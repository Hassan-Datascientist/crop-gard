import base64
import os
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, File, UploadFile
from groq import AsyncGroq

app = FastAPI()

# env_path = Path(__file__).parent.parent / ".env"
# print(f"Loading .env from: {env_path}")
# print(f"File exists: {env_path.exists()}")
# load_dotenv(dotenv_path=env_path, encoding="utf-8")

load_dotenv(find_dotenv())
print(f"API KEY: {os.getenv('GROQ_API_KEY')}")

client = AsyncGroq(
    api_key="",
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

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
                        "text": "Predict the disease of the leaf in the image and provide a brief description.",
                    },
                ],
            }
        ],
    )

    return {"prediction": response.choices[0].message.content}
