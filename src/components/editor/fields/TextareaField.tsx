import { useCallback, useRef, useEffect } from 'react';

interface TextareaFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TextareaField({
  fieldKey,
  label,
  value,
  onChange,
  placeholder,
  minHeight = 36,
}: TextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [minHeight]);

  useEffect(() => {
    autoExpand();
  }, [value, autoExpand]);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldKey}
        className="text-xs uppercase text-ink-muted font-semibold tracking-wide"
      >
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoExpand}
        placeholder={placeholder}
        className="w-full bg-bg-surface border-[1.5px] border-border-default rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint resize-none focus:outline-none focus:border-accent-primary transition-colors"
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}
