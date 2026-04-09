import { useState, useCallback, useRef } from 'react';
import type { TaskType, FieldDefinition } from '@/registry/types';
import type { AiFillResponse, AiProviderName } from '@/ai/types';
import { createProvider, aiFill } from '@/ai/connector';

export type AiFillStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAiFillParams {
  taskType: TaskType | null;
  intent: string;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
  providerName: AiProviderName | null;
  language: string;
  getApiKey: () => string | null;
  getEndpoint: () => string | null;
  getModel: () => string | null;
}

interface UseAiFillReturn {
  status: AiFillStatus;
  filledCount: number;
  errorMessage: string;
  triggerFill: () => Promise<AiFillResponse | null>;
  cancelFill: () => void;
  reset: () => void;
  isDisabled: boolean;
}

export function useAiFill(params: UseAiFillParams): UseAiFillReturn {
  const { taskType, intent, currentFields, allOptionalFields, allowAddFields, providerName, language, getApiKey, getEndpoint, getModel } = params;

  const [status, setStatus] = useState<AiFillStatus>('idle');
  const [filledCount, setFilledCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isDisabled = !taskType || intent.trim() === '' || !providerName;

  const reset = useCallback(() => {
    setStatus('idle');
    setFilledCount(0);
    setErrorMessage('');
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  const cancelFill = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStatus('idle');
    setErrorMessage('');
    setFilledCount(0);
  }, []);

  const triggerFill = useCallback(async (): Promise<AiFillResponse | null> => {
    if (!taskType || !providerName) return null;

    const apiKey = getApiKey();
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('No API key configured. Open Settings to add your API key.');
      return null;
    }

    // Clear any previous success timer
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }

    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setErrorMessage('');
    setFilledCount(0);

    try {
      const provider = createProvider(providerName);
      const endpoint = getEndpoint() || undefined;
      const model = getModel() || undefined;
      const response = await aiFill(provider, {
        intent,
        taskType,
        currentFields,
        allOptionalFields,
        allowAddFields,
        apiKey,
        endpoint,
        model,
        language,
      }, controller.signal);

      const count = Object.keys(response.filledFields).length;
      setFilledCount(count);
      setStatus('success');

      // Auto-reset success message after 3 seconds
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
        successTimerRef.current = null;
      }, 3000);

      return response;
    } catch (err) {
      // Silently swallow abort errors — the user cancelled intentionally
      if (err instanceof DOMException && err.name === 'AbortError') {
        return null;
      }
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setStatus('error');
      return null;
    }
  }, [taskType, providerName, language, getApiKey, getEndpoint, getModel, intent, currentFields, allOptionalFields, allowAddFields]);

  return { status, filledCount, errorMessage, triggerFill, cancelFill, reset, isDisabled };
}
