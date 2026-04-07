import { useCallback, useRef, useEffect } from 'react';

interface IntentFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function IntentField({ value, onChange }: IntentFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const minHeight = 48;

  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, []);

  useEffect(() => {
    autoExpand();
  }, [value, autoExpand]);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="intent"
        className="text-xs uppercase text-ink-muted font-semibold tracking-wide"
      >
        Intent
      </label>
      <textarea
        ref={textareaRef}
        id="intent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoExpand}
        placeholder="What do you want to accomplish?"
        className="w-full bg-bg-surface border-2 border-accent-primary rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint resize-none focus:outline-none transition-colors"
        style={{
          minHeight: `${minHeight}px`,
          boxShadow: '0 0 0 4px var(--color-accent-primary-shadow)',
        }}
      />
    </div>
  );
}
