import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TensorflowModel, TensorflowModelDelegate } from 'react-native-fast-tflite';

import { preprocessImage, MODEL_INPUT_SIZE } from './preprocessing';
import { buildResult } from './labels';
import type { InferenceResult } from './labels';

let _model: TensorflowModel | null = null;
let _loadPromise: Promise<TensorflowModel> | null = null;

function getDelegates(): TensorflowModelDelegate[] {
  if (Platform.OS === 'ios') return ['core-ml'];
  return ['nnapi'];
}

async function resolveModelPath(): Promise<string> {
  const asset = Asset.fromModule(
    require('../../assets/models/crop_disease_model.tflite'),
  );
  if (asset.localUri) return asset.localUri;
  await asset.downloadAsync();
  return asset.localUri!;
}

export async function loadModel(): Promise<TensorflowModel> {
  if (_model) return _model;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const modelPath = await resolveModelPath();
    const source = { url: modelPath };
    try {
      const model = await loadTensorflowModel(source, getDelegates());
      _model = model;
      console.log('[TFLite] Model loaded with delegate:', getDelegates().join(', '));
      return model;
    } catch (delegateError) {
      console.warn('[TFLite] Hardware delegate unavailable, falling back to CPU.', delegateError);
      const model = await loadTensorflowModel(source, []);
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
