# quick_test.py — run standalone before wiring into FastAPI
import numpy as np
import tensorflow as tf
from PIL import Image

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
model = tf.keras.models.load_model("./models/crop_disease_model.keras")

img = (
    Image.open("./test_images/known_maize_rust_leaf.jpg")
    .convert("RGB")
    .resize((224, 224))
)
arr = (
    np.array(img, dtype=np.float32) / 255.0
)  # or preprocess_input(), depending on your answer above
arr = np.expand_dims(arr, axis=0)

pred = model.predict(arr)[0]
print(CLASS_NAMES[np.argmax(pred)], pred.max())
