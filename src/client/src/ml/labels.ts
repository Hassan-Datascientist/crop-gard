// src/ml/labels.ts
// ─────────────────────────────────────────────────────────────────────────────
// Label definitions for the crop disease TFLite model.
//
// ⚠️  IMPORTANT: The index in DISEASE_LABELS must match the output neuron order
//     of your model exactly.  Run the Python snippet in assets/models/README.md
//     to extract the ordered class list from your Keras training generator.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ordered class labels — index 0 corresponds to output neuron 0, etc.
 *
 * Format: "CropName___Disease_Name" (underscores within names, triple-
 * underscore as the crop/disease separator — matches the existing
 * parseDiseaseLabel() in ScanScreen.)
 */
export const UNSUPPORTED_THRESHOLD = 0.5;

export const DISEASE_LABELS: readonly string[] = [
  // ── Beans (3 classes) ─────────────────────────────────────────────────────
  'Bean___Other_Disease',
  'Bean___Rust',
  'Bean___healthy',
  // ── Maize (4 classes) ─────────────────────────────────────────────────────
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
  'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight',
  'Corn_(maize)___healthy',
  // ── Potato (3 classes) ────────────────────────────────────────────────────
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
] as const;

/** Number of output classes. */
export const NUM_CLASSES = DISEASE_LABELS.length;

// ─── Result types ─────────────────────────────────────────────────────────────

export interface TopKPrediction {
  /** Raw label e.g. "Maize___Common_Rust" */
  label: string;
  /** Probability in [0, 1] */
  probability: number;
}

export interface InferenceResult {
  disease: string;
  confidence: number;
  topK: TopKPrediction[];

  /** Top-1 confidence is below the unsupported threshold — the image likely
   *  does not belong to any known class. */
  unsupported: boolean;

  /** Sentinel that tells the UI this result came from the on-device model. */
  offlineMode: true;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Applies softmax to an array of logits and returns a new Float32Array of
 * probabilities that sum to 1.
 *
 * If the model already outputs softmax probabilities (final layer is Softmax)
 * you can skip this step — calling softmax on probabilities only introduces
 * a tiny floating-point error and is otherwise harmless.
 */
export function softmax(logits: Float32Array): Float32Array {
  const max = Math.max(...logits);
  const exps = Float32Array.from(logits, (x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return Float32Array.from(exps, (x) => x / sum);
}

/**
 * Returns the top-K class predictions sorted by probability descending.
 *
 * @param probabilities  Raw model output — either logits or softmax probs.
 * @param k              Number of predictions to return (default 3).
 */
export function getTopK(probabilities: Float32Array, k = 3): TopKPrediction[] {
  return Array.from(probabilities)
    .map((prob, idx) => ({
      label: DISEASE_LABELS[idx] ?? `unknown_class_${idx}`,
      probability: prob,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, k);
}

/**
 * Converts the raw model output Float32Array into a typed InferenceResult.
 *
 * @param rawOutput  Output tensor from model.runSync() — shape [NUM_CLASSES].
 */
export function buildResult(rawOutput: Float32Array): InferenceResult {
  // The model's final layer is already a Softmax, so `rawOutput` is a valid
  // probability distribution (sum ≈ 1). Re-applying softmax() would flatten
  // the confidence and push every prediction below the unsupported threshold,
  // so only convert logits → probabilities when the output is NOT normalized.
  const sum = rawOutput.reduce((a, b) => a + b, 0);
  const probabilities =
    Math.abs(sum - 1) > 0.01 ? softmax(rawOutput) : rawOutput;

  const topK = getTopK(probabilities, 3);
  const best = topK[0];

  return {
    disease: best.label,
    confidence: parseFloat((best.probability * 100).toFixed(2)),
    topK,
    offlineMode: true,
    unsupported: best.probability < UNSUPPORTED_THRESHOLD,
  };
}
