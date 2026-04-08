import { useCallback, useRef, useEffect } from 'react';
import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface TextareaFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TextareaField({
  field,
  value,
  onChange,
  placeholder = '自由输入',
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
      <FieldLabel fieldKey={field.key} inputType={field.inputType} />
      <textarea
        ref={textareaRef}
        id={field.key}
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
