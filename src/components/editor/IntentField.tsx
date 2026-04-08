import { useCallback, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FieldLabel } from '@/components/editor/FieldLabel';

interface IntentFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function IntentField({ value, onChange }: IntentFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const minHeight = 48;
  const isEmpty = value.trim().length === 0;

  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, []);

  useEffect(() => {
    autoExpand();
  }, [value, autoExpand]);

  const glowStyle = isEmpty
    ? '0 0 0 4px var(--color-status-danger-shadow)'
    : isFocused
      ? '0 0 0 4px var(--color-accent-primary-shadow)'
      : 'none';

  return (
    <div className="flex flex-col gap-1">
      <FieldLabel fieldKey="intent" inputType="textarea" />
      <textarea
        ref={textareaRef}
        id="intent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoExpand}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="你想完成什么？"
        className={cn(
          'w-full bg-bg-surface border-2 rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint resize-none focus:outline-none transition-all',
          isEmpty
            ? 'border-status-danger'
            : isFocused
              ? 'border-accent-primary'
              : 'border-border-default',
        )}
        style={{
          minHeight: `${minHeight}px`,
          boxShadow: glowStyle,
        }}
      />
    </div>
  );
}
