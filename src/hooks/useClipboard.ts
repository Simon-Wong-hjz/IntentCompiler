import { useState, useCallback, useRef, useEffect } from 'react';

type ClipboardStatus = 'idle' | 'success' | 'error';

export function useClipboard(resetDelay: number = 1500) {
  const [status, setStatus] = useState<ClipboardStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        await navigator.clipboard.writeText(text);
        setStatus('success');
      } catch {
        setStatus('error');
      }

      timeoutRef.current = setTimeout(() => {
        setStatus('idle');
        timeoutRef.current = null;
      }, resetDelay);
    },
    [resetDelay],
  );

  return { status, copy };
}
