# import base64
import json
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
import tensorflow as tf
from dotenv import find_dotenv, load_dotenv
from fastapi import Depends, FastAPI, File, UploadFile  # HTTPException,
from fastapi.middleware.cors import CORSMiddleware
from groq import AsyncGroq

from src.dependencies import get_disease_model, get_http_client

from .services import (
    identify_plant,
    parse_best_match,
    predict_disease,
    validate_crop_species,
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "crop_disease_model.keras"


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(timeout=60)
    app.state.disease_model = tf.keras.models.load_model(MODEL_PATH)
    yield
    await app.state.http_client.aclose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


load_dotenv(find_dotenv())

API_KEY = os.getenv("GROQ_API_KEY")

client = AsyncGroq(api_key="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")


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


@app.post("/api/predict")
async def predict(
    file: UploadFile = File(...),
    client: httpx.AsyncClient = Depends(get_http_client),
    model: tf.keras.Model = Depends(get_disease_model),
):
    data = await identify_plant(client=client, images=[file], organs=["leaf"])
    result = parse_best_match(data)
    validate_crop_species(result.top_result)

    await file.seek(0)
    data = await predict_disease(model, file)
    print(result.top_result)
    print(data)

    return {"success": "Yes"}


@app.get("/")
def read_root():
    return {"Hello": "World"}
