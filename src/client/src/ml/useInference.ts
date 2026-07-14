// src/ml/useInference.ts
// ─────────────────────────────────────────────────────────────────────────────
// React hook that manages the full on-device inference lifecycle:
//   model warm-up → image preprocessing → inference → typed result.
//
// Usage (in a functional component):
//
//   const { modelState, inferring, result, error, analyze, reset } = useInference();
//
//   // Kick off warm-up on mount — model loads while user picks an image
//   // Call analyze() once an image is selected
//   const handleAnalyse = async () => {
//     const res = await analyze(imageUri, 'maize');
//     if (res) console.log(res.disease, res.confidence);
//   };
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadModel, runInference } from './inference';
import type { InferenceResult } from './labels';

// ─── Public types ─────────────────────────────────────────────────────────────

/** Lifecycle state of the TFLite model. */
export type ModelState = 'loading' | 'ready' | 'error';

export interface UseInferenceReturn {
  /**
   * Current model lifecycle state.
   *  - 'loading' → model is being loaded from the app bundle
   *  - 'ready'   → model is loaded and inference can be run
   *  - 'error'   → model failed to load (see errorMessage)
   */
  modelState: ModelState;

  /** True while the image is being preprocessed or the model is running. */
  inferring: boolean;

  /** Most recent successful inference result, or null. */
  result: InferenceResult | null;

  /** Human-readable error message, or null when no error has occurred. */
  errorMessage: string | null;

  /**
   * Run inference on the given image URI.
   *
   * @param imageUri  Local URI from expo-image-picker or expo-camera.
   * @param crop      Crop type string ('maize' | 'potato' | 'beans').
   * @returns The InferenceResult on success, or null on failure (error is set).
   */
  analyze: (imageUri: string, crop: string) => Promise<InferenceResult | null>;

  /** Clears the last result and error without reloading the model. */
  reset: () => void;
}

// ─── Hook implementation ──────────────────────────────────────────────────────

/**
 * React hook for on-device TFLite inference.
 *
 * The model is pre-warmed once on mount so there is no cold-start delay
 * when the user first taps "Analyse Leaf".
 *
 * All state updates are guarded against unmounted-component warnings via
 * a `mountedRef`.
 */
export function useInference(): UseInferenceReturn {
  const [modelState, setModelState] = useState<ModelState>('loading');
  const [inferring, setInferring] = useState(false);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guards against setState() after unmount
  const mountedRef = useRef(true);

  // ── Pre-warm the model on mount ─────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    loadModel()
      .then(() => {
        if (mountedRef.current) {
          setModelState('ready');
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useInference] Model failed to load:', msg);
        if (mountedRef.current) {
          setModelState('error');
          setErrorMessage(`Model failed to load: ${msg}`);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── analyze ─────────────────────────────────────────────────────────────────
  const analyze = useCallback(
    async (imageUri: string, crop: string): Promise<InferenceResult | null> => {
      if (modelState !== 'ready') {
        if (mountedRef.current) {
          setErrorMessage(
            modelState === 'loading'
              ? 'Model is still loading. Please wait a moment and try again.'
              : 'Model failed to initialise. Please restart the app.',
          );
        }
        return null;
      }

      if (mountedRef.current) {
        setInferring(true);
        setErrorMessage(null);
        setResult(null);
      }

      try {
        const inferenceResult = await runInference(imageUri, crop);

        if (mountedRef.current) {
          setResult(inferenceResult);
        }
        return inferenceResult;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useInference] Inference failed:', msg);
        if (mountedRef.current) {
          setErrorMessage(`Analysis failed: ${msg}`);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setInferring(false);
        }
      }
    },
    [modelState],
  );

  // ── reset ────────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setResult(null);
    setErrorMessage(null);
  }, []);

  return { modelState, inferring, result, errorMessage, analyze, reset };
}
