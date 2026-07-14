// src/ml/useInference.web.ts
// ─────────────────────────────────────────────────────────────────────────────
// WEB PLATFORM — Metro picks this over useInference.ts on web builds.
//
// Delegates to inference.web.ts which uses @tensorflow/tfjs-tflite (WASM)
// to run the same .tflite model in the browser — fully offline, no server.
//
// The hook interface is IDENTICAL to the native version so ScanScreen.js
// requires zero changes across platforms.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
// On web Metro resolves this to inference.web.ts automatically
import { loadModel, runInference } from './inference';
import type { InferenceResult } from './labels';

// ─── Public types (mirrored from native useInference.ts) ─────────────────────

export type ModelState = 'loading' | 'ready' | 'error';

export interface UseInferenceReturn {
  modelState: ModelState;
  inferring: boolean;
  result: InferenceResult | null;
  errorMessage: string | null;
  analyze: (imageUri: string, crop: string) => Promise<InferenceResult | null>;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * On web: loads the TFLite model via WASM on mount, then runs inference
 * through the same `analyze()` API as the native hook.
 *
 * The model file is fetched from Expo's static asset server on first load and
 * cached by the browser — all subsequent calls work fully offline.
 */
export function useInference(): UseInferenceReturn {
  const [modelState, setModelState] = useState<ModelState>('loading');
  const [inferring, setInferring] = useState(false);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // ── Pre-warm the WASM model on mount ────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    loadModel()
      .then(() => {
        if (mountedRef.current) setModelState('ready');
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useInference/web] Model failed to load:', msg);
        if (mountedRef.current) {
          setModelState('error');
          setErrorMessage(
            `Model failed to load: ${msg}. ` +
              'Ensure crop_disease_model.tflite is in assets/models/.',
          );
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
              ? 'WASM model is still loading. Please wait a moment.'
              : 'Model failed to initialise. Check the console for details.',
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
        if (mountedRef.current) setResult(inferenceResult);
        return inferenceResult;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useInference/web] Inference failed:', msg);
        if (mountedRef.current) setErrorMessage(`Analysis failed: ${msg}`);
        return null;
      } finally {
        if (mountedRef.current) setInferring(false);
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
