# Web Model (TF.js GraphModel format)

Files in this directory are served by Expo at the **root URL** during `npm run web`
and copied to the web build output by `npx expo export --platform web`.

## Required files

```
public/models/web_model/
├── model.json          ← model topology + weight manifest
└── group1-shard1of1.bin  ← model weights (name may differ)
```

## Convert your .tflite → TF.js once

```bash
pip install tensorflowjs

tensorflowjs_converter \
  --input_format=tflite \
  path/to/crop_disease_model.tflite \
  public/models/web_model/
```

The converter produces `model.json` + one or more `.bin` weight shards.
These files are then served at `/models/web_model/model.json` on the web build.

## Why a separate format for web?

`react-native-fast-tflite` uses native C++ and runs only on Android/iOS.
On web, `@tensorflow/tfjs` loads the TF.js GraphModel and runs it with
the CPU backend (or WASM backend if available) — no server needed.

The label order and normalization settings in `src/ml/labels.ts` and
`src/ml/preprocessing.web.ts` are shared between both platforms.
