// src/ml/preprocessing.web.ts
// ─────────────────────────────────────────────────────────────────────────────
// WEB preprocessing — uses the browser's Canvas 2D API instead of
// expo-image-manipulator + jpeg-js (which are native-only).
//
// Pipeline:
//   imageUri (blob/data/http URL)
//     → draw onto off-screen <canvas> at MODEL_INPUT_SIZE × MODEL_INPUT_SIZE
//     → ctx.getImageData() → RGBA Uint8ClampedArray
//     → strip alpha, normalize → Float32Array [H × W × 3] (NHWC)
//
// No server call. No native module. Works fully offline in any browser.
// ─────────────────────────────────────────────────────────────────────────────

export const MODEL_INPUT_SIZE = 224;
export type NormalizationMode = 'zero_to_one' | 'neg_one_to_one';
export const DEFAULT_NORMALIZATION: NormalizationMode = 'zero_to_one';

/** On web, resizing is handled inside imageUriToTensor via Canvas. Pass-through. */
export async function resizeImage(uri: string, _size = MODEL_INPUT_SIZE): Promise<string> {
  return uri;
}

/**
 * Draws the image onto a `size × size` Canvas and reads back normalized pixels.
 *
 * @param uri      blob: / data: / http: URL of the selected image.
 * @param size     Target spatial dimension (default 224).
 * @param normalize Normalization mode (default zero_to_one → pixel / 255).
 */
export function imageUriToTensor(
  uri: string,
  size = MODEL_INPUT_SIZE,
  normalize: NormalizationMode = DEFAULT_NORMALIZATION,
): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Allow cross-origin data URIs from the image picker
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Off-screen canvas — never appended to the DOM
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('[preprocessing/web] Canvas 2D context unavailable'));
        return;
      }

      // Resize the image by drawing it into the small canvas
      ctx.drawImage(img, 0, 0, size, size);

      // RGBA pixel data from the canvas
      const rgba = ctx.getImageData(0, 0, size, size).data; // Uint8ClampedArray

      // RGBA → RGB Float32 tensor (NHWC layout)
      const float32 = new Float32Array(size * size * 3);
      for (let i = 0; i < size * size; i++) {
        const r = rgba[i * 4];
        const g = rgba[i * 4 + 1];
        const b = rgba[i * 4 + 2];
        // rgba[i*4+3] = alpha — discarded

        if (normalize === 'zero_to_one') {
          float32[i * 3]     = r / 255.0;
          float32[i * 3 + 1] = g / 255.0;
          float32[i * 3 + 2] = b / 255.0;
        } else {
          // neg_one_to_one: (pixel - 127.5) / 127.5
          float32[i * 3]     = (r - 127.5) / 127.5;
          float32[i * 3 + 1] = (g - 127.5) / 127.5;
          float32[i * 3 + 2] = (b - 127.5) / 127.5;
        }
      }

      resolve(float32);
    };

    img.onerror = () =>
      reject(new Error('[preprocessing/web] Failed to load image for preprocessing'));

    img.src = uri;
  });
}

/** Full pipeline on web: single Canvas pass (resize + decode + normalize). */
export async function preprocessImage(
  imageUri: string,
  inputSize = MODEL_INPUT_SIZE,
  normalize: NormalizationMode = DEFAULT_NORMALIZATION,
): Promise<Float32Array> {
  return imageUriToTensor(imageUri, inputSize, normalize);
}
