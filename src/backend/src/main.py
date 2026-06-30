import base64
import json
import os
import re

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import AsyncGroq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


load_dotenv(find_dotenv())
print(f"API KEY: {os.getenv('GROQ_API_KEY')}")

client = AsyncGroq(
    api_key="",
)


CROP_LABELS = {
    "maize": [
        "Maize___Common_Rust",
        "Maize___Gray_Leaf_Spot",
        "Maize___Northern_Leaf_Blight",
        "Maize___Healthy",
    ],
    "potato": ["Potato___Early_Blight", "Potato___Late_Blight", "Potato___Healthy"],
    "beans": ["Beans___Angular_Leaf_Spot", "Beans___Rust", "Beans___Healthy"],
}


def build_prompt(crop: str, allowed_labels: list[str]) -> str:
    return (
        f"You are a plant pathology classifier for {crop} leaves. "
        f"Respond with ONLY valid JSON, no markdown, no explanation outside the JSON.\n\n"
        f'Example: {{"disease": "{allowed_labels[0]}", "confidence": 0.85, '
        f'"description": "short description", "recommendation": "short advice"}}\n\n'
        f"Allowed disease values (choose exactly one): {allowed_labels}\n"
        f"This image is a {crop} leaf — only diagnose conditions from the allowed list above."
    )


def parse_groq_response(raw_text: str, allowed_labels: list[str]) -> dict:
    cleaned = re.sub(r"^```json\s*|\s*```$", "", raw_text.strip())
    try:
        data = json.loads(cleaned)
        if data.get("disease") in allowed_labels:
            return {
                "disease": data["disease"],
                "confidence": max(0.0, min(1.0, float(data.get("confidence", 0)))),
                "description": data.get("description", ""),
                "recommendation": data.get("recommendation", ""),
            }
    except (json.JSONDecodeError, ValueError, KeyError, TypeError):
        pass
    # Fallback instead of crashing the request
    return {
        "disease": "Unknown",
        "confidence": 0.0,
        "description": "Unable to confidently classify this image. Try a clearer, well-lit photo of the leaf.",
        "recommendation": "Retake photo with the leaf filling the frame.",
    }


@app.post("/api/predict")
async def predict(file: UploadFile = File(...), crop: str = Form(...)):
    crop_key = crop.lower().strip()
    if crop_key not in CROP_LABELS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop: {crop}")

    allowed_labels = CROP_LABELS[crop_key]
    image_bytes = await file.read()
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    try:
        response = await client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file.content_type or 'image/jpeg'};base64,{image_b64}"
                            },
                        },
                        {
                            "type": "text",
                            "text": build_prompt(crop_key, allowed_labels),
                        },
                    ],
                }
            ],
            response_format={
                "type": "json_object"
            },  # verify Groq supports this for vision input on this model
            temperature=0.2,
        )
        raw_text = response.choices[0].message.content or ""
    except Exception as e:
        # Groq call itself failed (network, rate limit, etc.) — don't 500 raw
        raise HTTPException(
            status_code=502, detail=f"Inference provider error: {str(e)}"
        )

    return parse_groq_response(raw_text, allowed_labels)


@app.get("/")
def read_root():
    return {"Hello": "World"}
