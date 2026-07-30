import { useCallback, useRef, useState } from 'react';
import { loadModel, runInference } from './inference';
import type { InferenceResult } from './labels';

export type ModelState = 'idle' | 'loading' | 'ready' | 'error';

export interface UseInferenceReturn {
  modelState: ModelState;
  inferring: boolean;
  result: InferenceResult | null;
  errorMessage: string | null;
  analyze: (imageUri: string, crop?: string) => Promise<InferenceResult | null>;
  reset: () => void;
}

export function useInference(): UseInferenceReturn {
  const [modelState, setModelState] = useState<ModelState>('idle');
  const [inferring, setInferring] = useState(false);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const modelLoadedRef = useRef(false);

  const ensureModelLoaded = useCallback(async (): Promise<boolean> => {
    if (modelLoadedRef.current) return true;
    if (mountedRef.current) setModelState('loading');
    try {
      await loadModel();
      modelLoadedRef.current = true;
      if (mountedRef.current) setModelState('ready');
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[useInference] Model failed to load:', msg);
      if (mountedRef.current) {
        setModelState('error');
        setErrorMessage(`Model failed to load: ${msg}`);
      }
      return false;
    }
  }, []);

  const analyze = useCallback(
    async (imageUri: string, crop?: string): Promise<InferenceResult | null> => {
      const loaded = await ensureModelLoaded();
      if (!loaded) return null;

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
        console.error('[useInference] Inference failed:', msg);
        if (mountedRef.current) setErrorMessage(`Analysis failed: ${msg}`);
        return null;
      } finally {
        if (mountedRef.current) setInferring(false);
      }
    },
    [ensureModelLoaded],
  );

  const reset = useCallback(() => {
    setResult(null);
    setErrorMessage(null);
  }, []);

  return { modelState, inferring, result, errorMessage, analyze, reset };
}
