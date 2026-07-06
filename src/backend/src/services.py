# plantnet_service.py
# disease_service.py
import io
import re
from typing import List, Optional

import httpx
import numpy as np
import tensorflow as tf
from fastapi import HTTPException, UploadFile
from PIL import Image

from .config import settings
from .schema import IdentificationResult, PlantMatch

PLANTNET_BASE_URL = "https://my-api.plantnet.org/v2/identify"


async def identify_plant(
    client: httpx.AsyncClient,
    images: List[UploadFile],
    organs: Optional[List[str]] = None,
) -> dict:
    """
    Sends one or more images to the Pl@ntNet API for identification.

    Args:
        client: Shared httpx.AsyncClient injected from app state.
        images: List of FastAPI UploadFile objects.
        organs: Organs visible in each image. Options: leaf, flower, fruit, bark, auto.

    Returns:
        dict: JSON response from Pl@ntNet.
    """
    if organs is None:
        organs = ["leaf"]

    url = f"{PLANTNET_BASE_URL}/{settings.plantnet_project}"
    params = {"api-key": settings.plantnet_api_key}

    files = []
    for image in images:
        contents = await image.read()
        files.append(("images", (image.filename, contents, image.content_type)))

    data = {"organs": organs}

    try:
        response = await client.post(url, params=params, files=files, data=data)
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504, detail="PlantNet API request timed out."
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"PlantNet API error: {exc.response.text}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502, detail=f"Failed to reach PlantNet API: {str(exc)}"
        ) from exc


def parse_best_match(plantnet_response: dict) -> IdentificationResult:
    """
    Extracts the highest-confidence species match from a Pl@ntNet API response.

    Args:
        plantnet_response: Raw JSON dict returned by the Pl@ntNet identify endpoint.

    Returns:
        IdentificationResult: Structured top match with common names and score.

    Raises:
        HTTPException: If the response contains no results (e.g. unrecognized image).
    """
    results = plantnet_response.get("results", [])
    if not results:
        raise HTTPException(
            status_code=422,
            detail="Pl@ntNet could not identify any species in the provided image(s).",
        )

    # Results are already ordered by score (highest first), but sort defensively
    top = max(results, key=lambda r: r["score"])
    species = top["species"]

    return IdentificationResult(
        best_match=plantnet_response.get("bestMatch", species["scientificName"]),
        top_result=PlantMatch(
            scientific_name=species["scientificName"],
            common_names=species.get("commonNames", []),
            family=species["family"]["scientificNameWithoutAuthor"],
            genus=species["genus"]["scientificNameWithoutAuthor"],
            score=top["score"],
            gbif_id=top.get("gbif", {}).get("id"),
            powo_id=top.get("powo", {}).get("id"),
        ),
        remaining_requests=plantnet_response.get("remainingIdentificationRequests", 0),
    )


# CRITICAL: this order must match your training generator's class_indices exactly.
# Re-verify this against a shuffle=False evaluation before finalizing.
CLASS_NAMES = [
    "Bean___Other_Disease",
    "Bean___Rust",
    "Bean___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
]

IMG_SIZE = (224, 224)  # match whatever MobileNetV2 input size you trained with


async def preprocess_image(image: UploadFile) -> np.ndarray:
    """Reads an UploadFile and converts it to a model-ready array."""
    contents = await image.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)  # add batch dimension
    return arr


async def predict_disease(model: tf.keras.Model, image: UploadFile) -> dict:
    """
    Runs disease classification on a single leaf image using the trained
    MobileNetV2 model.

    Args:
        model: Loaded Keras model (injected via dependency).
        image: FastAPI UploadFile containing the leaf photo.

    Returns:
        dict: predicted label, confidence, and full class probability breakdown.
    """
    try:
        arr = await preprocess_image(image)
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Invalid image file: {str(exc)}"
        ) from exc

    predictions = model.predict(arr, verbose=0)[0]  # shape: (10,)
    predicted_idx = int(np.argmax(predictions))
    confidence = float(predictions[predicted_idx])

    return {
        "predicted_label": CLASS_NAMES[predicted_idx],
        "confidence": round(confidence, 4),
        "all_probabilities": {
            CLASS_NAMES[i]: round(float(p), 4) for i, p in enumerate(predictions)
        },
    }


# Only these species should be allowed through to the disease classifier
VALID_CROPS = {
    "Zea mays": "maize",
    "Phaseolus vulgaris": "beans",
    "Solanum tuberosum": "potato",
}
VALID_SPECIES = {
    "zea mays": "maize",
    "phaseolus vulgaris": "beans",
    "solanum tuberosum": "potato",
}
MIN_PLANTNET_CONFIDENCE = 0.5


SUPPORTED_CROPS = ["Bean", "Potato", "Maize"]


def check_crop_exists_debug(target_crops, common_names=SUPPORTED_CROPS):
    # Create the pattern: "Bean|Potato|Maize"
    pattern = "|".join(re.escape(crop) for crop in target_crops)

    print(f"Testing regex pattern: '{pattern}'")

    for name in common_names:
        match = re.search(pattern, name, re.IGNORECASE)
        print(f"Checking element '{name}' -> Match found: {bool(match)}")
        if match:
            return True

    return False


def validate_crop_species(plantnet_result: PlantMatch) -> str:
    """
    Confirms the identified species is one of the three crops your
    disease model was trained on, before running disease classification.

    Raises:
        HTTPException: If Pl@ntNet's identification doesn't match a
        supported crop species.
    """
    print(plantnet_result)
    if not check_crop_exists_debug(plantnet_result.common_names):
        raise HTTPException(
            status_code=422, detail=("Only supports Maize, Potato, Bean")
        )

    # Normalize: lowercase, strip authorship (e.g. "(L.) Merr.", "L.")
    # name = plantnet_result.scientific_name.lower()
    # Take just genus + species (first two words), dropping authorship text
    # parts = name.split()
    # genus_species = " ".join(parts[:2]) if len(parts) >= 2 else name

    # crop = VALID_SPECIES.get(genus_species)
    # if crop is None:
    #     raise HTTPException(
    #         status_code=422,
    #         detail=(
    #             f"Identified species '{plantnet_result.scientific_name}' "
    #             f"is not a supported crop (maize, beans, or potato). "
    #             f"Disease detection only supports these three crops."
    #         ),
    #     )
    # return crop
