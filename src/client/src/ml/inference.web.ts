// src/ml/inference.web.ts
// ─────────────────────────────────────────────────────────────────────────────
// WEB inference using @tensorflow/tfjs (CPU backend, pure JS, Metro-safe).
//
// Why NOT @tensorflow/tfjs-tflite here:
//   It imports a WASM binding (`tflite_web_api_client`) via a relative path
//   that Metro's static bundler cannot resolve — a known incompatibility.
//
// Solution:
//   Convert the model once with `tensorflowjs_converter --input_format=tflite`
//   (see public/models/web_model/README.md) and place the output files in
//   public/models/web_model/.  Expo serves public/ at the web root, so
//   tf.loadGraphModel('/models/web_model/model.json') works in dev & production.
//
// On native (Android/iOS), Metro loads inference.ts (not this file), which
// uses react-native-fast-tflite with the original .tflite model.
// ─────────────────────────────────────────────────────────────────────────────

import * as tf from '@tensorflow/tfjs';
// CPU backend: pure JS, no WASM, zero Metro compatibility issues.
// For production you can swap to '@tensorflow/tfjs-backend-wasm' if you
// configure the WASM binary path — but CPU works fine for leaf-scan workloads.
import '@tensorflow/tfjs-backend-cpu';

import { preprocessImage, MODEL_INPUT_SIZE } from './preprocessing';
import { buildResult } from './labels';
import type { InferenceResult } from './labels';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * URL of the TF.js GraphModel served from the `public/` directory.
 * Expo serves public/ at "/" in both dev (`expo start --web`) and
 * the exported web build (`expo export --platform web`).
 *
 * Run `tensorflowjs_converter --input_format=tflite model.tflite public/models/web_model/`
 * to generate these files. See public/models/web_model/README.md for details.
 */
const WEB_MODEL_URL = '/models/web_model/model.json';

// ─── Singleton ────────────────────────────────────────────────────────────────

let _model: tf.GraphModel | null = null;
let _loadPromise: Promise<tf.GraphModel> | null = null;

// ─── Model loading ────────────────────────────────────────────────────────────

/**
 * Loads the TF.js GraphModel (singleton).
 *
 * tf.loadGraphModel uses the browser's fetch() API — fully offline after the
 * first load because the browser caches the model.json + weight .bin files.
 */
export async function loadModel(): Promise<tf.GraphModel> {
  if (_model) return _model;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    await tf.setBackend('cpu');
    await tf.ready();

    console.log('[TFLite/web] Loading model from', WEB_MODEL_URL);
    const model = await tf.loadGraphModel(WEB_MODEL_URL);
    _model = model;
    console.log('[TFLite/web] Model loaded. Inputs:', model.inputs);
    return model;
  })();

  return _loadPromise;
}

/** Releases the cached model instance. */
export function disposeModel(): void {
  if (_model) _model.dispose();
  _model = null;
  _loadPromise = null;
}

// ─── Inference ────────────────────────────────────────────────────────────────

/**
 * Runs offline inference in the browser using the TF.js CPU backend.
 *
 * Pipeline:
 *   imageUri (blob: / data: URL from expo-image-picker)
 *     → Canvas resize + normalize → Float32Array    (preprocessing.web.ts)
 *     → tf.tensor4d([1, 224, 224, 3])
 *     → model.predict()
 *     → Float32Array probabilities
 *     → buildResult() → InferenceResult
 */
export async function runInference(
  imageUri: string,
  _crop = 'maize',
): Promise<InferenceResult> {
  const t0 = Date.now();

  const [model, pixelData] = await Promise.all([
    loadModel(),
    preprocessImage(imageUri, MODEL_INPUT_SIZE),
  ]);

  console.log(`[TFLite/web] Preprocessing: ${Date.now() - t0} ms`);
  const t1 = Date.now();

  const inputTensor = tf.tensor4d(
    pixelData,
    [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3],
  );

  // model.predict() returns Tensor | Tensor[] | NamedTensorMap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputTensor = (model.predict(inputTensor) as unknown) as tf.Tensor;
  const probabilities = new Float32Array(await outputTensor.data());

  inputTensor.dispose();
  outputTensor.dispose();

  console.log(`[TFLite/web] Inference: ${Date.now() - t1} ms | Total: ${Date.now() - t0} ms`);

  return buildResult(probabilities);
}
