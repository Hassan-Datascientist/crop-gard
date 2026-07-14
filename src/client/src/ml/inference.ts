// src/ml/inference.ts
// ─────────────────────────────────────────────────────────────────────────────
// TFLite model loading and inference orchestration.
//
// Singleton pattern — the model is loaded once on first call to loadModel()
// and reused for every subsequent inference.  This avoids paying the model-
// initialisation cost (typically 200–800 ms) on every scan.
//
// Hardware acceleration:
//  - iOS  → CoreML delegate (Neural Engine / GPU).  Enabled by the Expo
//            config plugin in app.json.  Falls back to CPU automatically.
//  - Android → NNAPI delegate when available (Snapdragon, MediaTek NPUs).
//              Falls back to CPU on unsupported devices.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TensorflowModel, TensorflowModelDelegate } from 'react-native-fast-tflite';

import { preprocessImage, MODEL_INPUT_SIZE } from './preprocessing';
import { buildResult } from './labels';
import type { InferenceResult } from './labels';

// ─── Singleton state ──────────────────────────────────────────────────────────

let _model: TensorflowModel | null = null;
let _loadPromise: Promise<TensorflowModel> | null = null;

// ─── Model loading ────────────────────────────────────────────────────────────

/**
 * Resolves the appropriate hardware delegates for the current platform.
 *
 * Delegates are optional — react-native-fast-tflite silently falls back
 * to CPU if the requested delegate is unavailable.
 */
function getDelegates(): TensorflowModelDelegate[] {
  if (Platform.OS === 'ios') {
    // CoreML accelerates CNNs by running them on the Neural Engine (A-series chips)
    return ['core-ml'];
  }
  // NNAPI enables hardware acceleration on Android 8.1+ (Snapdragon, Kirin, MediaTek)
  return ['nnapi'];
}

/**
 * Loads the TFLite model from the app bundle (singleton, call-safe).
 *
 * The model file must be located at:
 *   assets/models/crop_disease_model.tflite
 *
 * It is bundled at build time via the metro.config.js asset extension and
 * require() — no network download is ever needed.
 *
 * @returns The loaded TensorflowModel, ready for runSync().
 */
export async function loadModel(): Promise<TensorflowModel> {
  // Return cached instance immediately
  if (_model) return _model;

  // De-duplicate concurrent calls — only one load attempt runs at a time
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      // Attempt with hardware delegate first (faster on mid/high-end devices)
      const model = await loadTensorflowModel(
        // The tflite file is bundled as an asset via metro.config.js
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../assets/models/crop_disease_model.tflite'),
        getDelegates(),
      );
      _model = model;
      console.log('[TFLite] Model loaded with delegate:', getDelegates().join(', '));
      return model;
    } catch (delegateError) {
      // Delegate unavailable (e.g. simulator, old Android) — fall back to CPU
      console.warn(
        '[TFLite] Hardware delegate unavailable, falling back to CPU.',
        delegateError,
      );
      const model = await loadTensorflowModel(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../assets/models/crop_disease_model.tflite'),
        [],
      );
      _model = model;
      console.log('[TFLite] Model loaded on CPU.');
      return model;
    }
  })();

  return _loadPromise;
}

/**
 * Releases the cached model instance and its native resources.
 * Call this only if you are certain you will not run inference again
 * (e.g. app teardown), otherwise the next call to loadModel() will
 * incur the full load latency again.
 */
export function disposeModel(): void {
  _model = null;
  _loadPromise = null;
}

// ─── Inference ────────────────────────────────────────────────────────────────

/**
 * Runs fully on-device inference on a single leaf image.
 *
 * Pipeline:
 *   imageUri
 *     → resize to 224×224      (expo-image-manipulator, native thread)
 *     → decode JPEG → RGBA     (jpeg-js, JS thread)
 *     → normalize to [0, 1]    (JS thread)
 *     → model.runSync()        (C++ JSI, < 1 ms overhead on fast-tflite)
 *     → softmax + top-K        (JS thread)
 *     → InferenceResult
 *
 * The preprocessing (resize + decode) is the most time-consuming step
 * (~100–300 ms on mid-range devices).  The model itself typically runs
 * in 50–500 ms depending on hardware and delegate.
 *
 * @param imageUri  Local file URI from expo-image-picker / expo-camera.
 * @param crop      Selected crop type (reserved for future per-crop model routing).
 */
export async function runInference(
  imageUri: string,
  crop = 'maize',
): Promise<InferenceResult> {
  console.log(`[TFLite] Starting inference — crop: ${crop}`);
  const t0 = Date.now();

  // Load model and preprocess image in parallel (model is usually already cached)
  const [model, tensor] = await Promise.all([
    loadModel(),
    preprocessImage(imageUri, MODEL_INPUT_SIZE),
  ]);

  const tPreproc = Date.now();
  console.log(`[TFLite] Preprocessing: ${tPreproc - t0} ms`);

  // runSync executes synchronously on the JSI thread (no async overhead).
  // For the static-image use case this is fine; for real-time camera frames
  // use a VisionCamera frame processor worklet instead.
  const outputs = model.runSync([tensor.buffer as ArrayBuffer]);

  const tInfer = Date.now();
  console.log(`[TFLite] Inference:     ${tInfer - tPreproc} ms`);
  console.log(`[TFLite] Total:         ${tInfer - t0} ms`);

  // outputs[0] is the raw probability ArrayBuffer from the output tensor
  const rawProbabilities = new Float32Array(outputs[0]);

  return buildResult(rawProbabilities);
}
