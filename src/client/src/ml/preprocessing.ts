// src/ml/preprocessing.ts
// ─────────────────────────────────────────────────────────────────────────────
// Image preprocessing pipeline for on-device TFLite inference.
//
// Pipeline:
//   imageUri (any size)
//     → resize to MODEL_INPUT_SIZE × MODEL_INPUT_SIZE  (expo-image-manipulator)
//     → read raw bytes as base64                        (expo-file-system)
//     → decode JPEG → RGBA Uint8Array                  (jpeg-js, pure JS)
//     → strip alpha, normalize to [0,1]                 (Float32Array)
//     → NHWC tensor [1 × H × W × 3]                   ready for model.runSync()
//
// No native modules beyond expo-image-manipulator and expo-file-system are
// required.  jpeg-js is a pure-JS JPEG decoder (~15 KB minified) that works
// on both Hermes and JSC runtimes.
// ─────────────────────────────────────────────────────────────────────────────

import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

// ─── Constants — must match model training configuration ──────────────────────

/**
 * Spatial dimension fed to the CNN.
 * Change this if your model was trained on a different resolution (e.g. 256).
 */
export const MODEL_INPUT_SIZE = 224;

/**
 * Normalization mode.
 *  - 'zero_to_one'   → pixel / 255            (most common, e.g. ImageNet fine-tune)
 *  - 'neg_one_to_one' → (pixel - 127.5) / 127.5  (MobileNet-style)
 */
export type NormalizationMode = 'zero_to_one' | 'neg_one_to_one';

export const DEFAULT_NORMALIZATION: NormalizationMode = 'zero_to_one';

// ─── Step 1: Resize ───────────────────────────────────────────────────────────

/**
 * Resizes an image to a square of `size × size` pixels using
 * expo-image-manipulator (native, fast, runs off the JS thread).
 *
 * Returns a new local file URI pointing to the resized JPEG.
 */
export async function resizeImage(
  uri: string,
  size: number = MODEL_INPUT_SIZE,
): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: size, height: size } }],
    {
      // compress: 1 = maximum quality (least JPEG artefacts)
      compress: 1,
      format: SaveFormat.JPEG,
    },
  );
  return result.uri;
}

// ─── Step 2: Decode to raw pixels ────────────────────────────────────────────

/**
 * Reads a local JPEG file URI and decodes it to a raw RGBA Uint8Array.
 *
 * Uses:
 *  1. expo-file-system to read the file as a base64 string
 *  2. atob() (available in Hermes ≥ RN 0.71 and JSC) to get binary
 *  3. jpeg-js (pure JS) to decode the JPEG bitstream → RGBA pixels
 */
async function decodeJpegToRGBA(uri: string): Promise<{
  width: number;
  height: number;
  data: Uint8Array;
}> {
  // Read the JPEG file as base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64' as const,
  });

  // base64 → binary string → Uint8Array
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Decode JPEG → raw RGBA
  const decoded = jpeg.decode(bytes, {
    useTArray: true,       // return Uint8Array instead of Buffer (works in RN)
    formatAsRGBA: true,    // always output 4 channels
    tolerantDecoding: true, // don't throw on minor JPEG artefacts
  });

  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data as Uint8Array,
  };
}

// ─── Step 3: Normalize & build Float32 tensor ─────────────────────────────────

/**
 * Converts a raw RGBA Uint8Array to a Float32Array tensor in NHWC layout.
 *
 * NHWC = [batch=1, height, width, channels=3]
 * Alpha channel is discarded.
 *
 * @param rgba   Raw RGBA pixel data from decodeJpegToRGBA()
 * @param width  Image width  (should equal MODEL_INPUT_SIZE)
 * @param height Image height (should equal MODEL_INPUT_SIZE)
 * @param mode   Normalization mode (default: zero_to_one → pixel / 255)
 */
function rgbaToFloat32Tensor(
  rgba: Uint8Array,
  width: number,
  height: number,
  mode: NormalizationMode = DEFAULT_NORMALIZATION,
): Float32Array {
  const numPixels = width * height;
  const tensor = new Float32Array(numPixels * 3); // [H × W × 3]

  for (let i = 0; i < numPixels; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    // rgba[i * 4 + 3] is alpha — intentionally discarded

    if (mode === 'zero_to_one') {
      tensor[i * 3]     = r / 255.0;
      tensor[i * 3 + 1] = g / 255.0;
      tensor[i * 3 + 2] = b / 255.0;
    } else {
      // neg_one_to_one: (pixel - 127.5) / 127.5
      tensor[i * 3]     = (r - 127.5) / 127.5;
      tensor[i * 3 + 1] = (g - 127.5) / 127.5;
      tensor[i * 3 + 2] = (b - 127.5) / 127.5;
    }
  }

  return tensor;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Full preprocessing pipeline.
 *
 * Takes a raw image URI from expo-image-picker or expo-camera and returns a
 * Float32Array tensor ready to be passed directly to TFLite via:
 *
 * ```ts
 * const tensor = await preprocessImage(imageUri);
 * const outputs = model.runSync([tensor.buffer]);
 * ```
 *
 * @param imageUri   Local file URI of the captured/selected image.
 * @param inputSize  Model input resolution in pixels (default 224).
 * @param normalize  Normalization strategy (default 'zero_to_one').
 */
export async function preprocessImage(
  imageUri: string,
  inputSize: number = MODEL_INPUT_SIZE,
  normalize: NormalizationMode = DEFAULT_NORMALIZATION,
): Promise<Float32Array> {
  // 1. Resize to model input dimensions
  const resizedUri = await resizeImage(imageUri, inputSize);

  // 2. Decode JPEG → RGBA
  const { width, height, data: rgba } = await decodeJpegToRGBA(resizedUri);

  if (width !== inputSize || height !== inputSize) {
    console.warn(
      `[Preprocessing] Expected ${inputSize}×${inputSize}, got ${width}×${height}.` +
      ' Tensor values may be incorrect.',
    );
  }

  // 3. Build normalized Float32 tensor in NHWC layout
  return rgbaToFloat32Tensor(rgba, width, height, normalize);
}
