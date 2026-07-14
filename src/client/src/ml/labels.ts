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
export const DISEASE_LABELS: readonly string[] = [
  // ── Beans (3 classes) ─────────────────────────────────────────────────────
  'Beans___Angular_Leaf_Spot',
  'Beans___Bean_Rust',
  'Beans___Healthy',
  // ── Maize (4 classes) ─────────────────────────────────────────────────────
  'Maize___Common_Rust',
  'Maize___Gray_Leaf_Spot',
  'Maize___Healthy',
  'Maize___Northern_Leaf_Blight',
  // ── Potato (3 classes) ────────────────────────────────────────────────────
  'Potato___Early_Blight',
  'Potato___Healthy',
  'Potato___Late_Blight',
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
  /**
   * Top-1 label string — e.g. "Maize___Common_Rust".
   * Deliberately matches the `disease` field returned by the remote API so
   * the existing parseDiseaseLabel() and result-card UI work without changes.
   */
  disease: string;

  /**
   * Top-1 confidence expressed as a percentage (0–100).
   * Stored as number; parseFloat(number) === number so it is backwards-
   * compatible with all existing UI code that calls parseFloat(result.confidence).
   */
  confidence: number;

  /** Top-K predictions sorted by probability descending. */
  topK: TopKPrediction[];

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
  // Apply softmax in case the model outputs raw logits
  const probabilities = softmax(rawOutput);
  const topK = getTopK(probabilities, 3);
  const best = topK[0];

  return {
    disease: best.label,
    confidence: parseFloat((best.probability * 100).toFixed(2)),
    topK,
    offlineMode: true,
  };
}
