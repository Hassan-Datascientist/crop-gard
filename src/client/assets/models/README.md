# Crop Disease TFLite Model

Place your trained TFLite model file here:

```
assets/models/crop_disease_model.tflite
```

## Requirements

| Property | Value |
|---|---|
| Format | TensorFlow Lite (FlatBuffers .tflite) |
| Input shape | `[1, 224, 224, 3]` — batch × height × width × RGB channels |
| Input dtype | `FLOAT32`, values normalized to **[0.0 – 1.0]** (pixel ÷ 255) |
| Output shape | `[1, N]` — where N = number of disease classes |
| Output dtype | `FLOAT32` softmax probabilities (sum ≈ 1.0) |

## Label order

The class index in the output tensor **must match** the order defined in
`src/ml/labels.ts`. Run the following on your training machine to get the
correct order:

```python
import json, pathlib

# Keras
model.compile(...)  # if not already compiled
class_indices = {v: k for k, v in train_generator.class_indices.items()}
ordered = [class_indices[i] for i in range(len(class_indices))]
print(json.dumps(ordered, indent=2))
```

Then paste the list into `DISEASE_LABELS` in `src/ml/labels.ts`.

## Converting your Keras model

```bash
pip install tensorflow
python - <<'EOF'
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model("saved_model_dir/")
# Optional: enable Float16 quantization for ~2× smaller file
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]
tflite_model = converter.convert()

with open("crop_disease_model.tflite", "wb") as f:
    f.write(tflite_model)
print("Done — model saved.")
EOF
```
