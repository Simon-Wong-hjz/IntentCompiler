import { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FieldLabel } from '@/components/editor/FieldLabel';
import { AiFillButton } from '@/components/editor/AiFillButton';
import type { AiFillStatus } from '@/hooks/useAiFill';

interface IntentFieldProps {
  value: string;
  onChange: (value: string) => void;
  // AI props
  aiFillStatus: AiFillStatus;
  aiFillDisabled: boolean;
  hasApiKey: boolean;
  filledCount: number;
  errorMessage: string;
  onAiFill: () => void;
  onDismissError: () => void;
  onOpenSettings?: () => void;
  allowAddFields: boolean;
  onAllowAddFieldsChange: (checked: boolean) => void;
}

export function IntentField({
  value,
  onChange,
  aiFillStatus,
  aiFillDisabled,
  hasApiKey,
  filledCount,
  errorMessage,
  onAiFill,
  onDismissError,
  onOpenSettings,
  allowAddFields,
  onAllowAddFieldsChange,
}: IntentFieldProps) {
  const { t } = useTranslation();
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
      {/* Label row: field label left, [checkbox + AI Fill] right */}
      <div className="flex items-start justify-between gap-4">
        <FieldLabel fieldKey="intent" inputType="textarea" />
        <div className="flex items-center gap-3">
          {hasApiKey && (
            <label className="flex items-center gap-1.5 text-xs text-ink-secondary cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={allowAddFields}
                onChange={(e) => onAllowAddFieldsChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border-default text-accent-primary focus:ring-accent-primary"
              />
              <span>{t('ai.allowAddFields')}</span>
              <span
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-bg-muted text-ink-muted text-[9px] cursor-help"
                title={t('ai.allowAddFieldsHelp')}
              >
                ?
              </span>
            </label>
          )}
          <AiFillButton
            status={aiFillStatus}
            disabled={aiFillDisabled}
            hasApiKey={hasApiKey}
            filledCount={filledCount}
            errorMessage={errorMessage}
            onFill={onAiFill}
            onDismissError={onDismissError}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>
      <textarea
        ref={textareaRef}
        id="intent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoExpand}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={t('editor.intentPlaceholder')}
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
