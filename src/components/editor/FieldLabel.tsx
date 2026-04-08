import { useTranslation } from 'react-i18next';
import type { InputType } from '@/registry/types';

interface FieldLabelProps {
  fieldKey: string;
  inputType: InputType;
}

export function FieldLabel({ fieldKey, inputType }: FieldLabelProps) {
  const { t } = useTranslation();
  const displayName = t(`fields.${fieldKey}`);
  const hint = t(`hints.${inputType}`);

  return (
    <div className="flex items-center gap-1 mb-2">
      <span className="text-sm font-bold text-ink-primary">
        {displayName}
      </span>
      <span
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold flex-shrink-0 border border-ink-hint text-ink-muted -translate-y-1 hover:border-accent-primary hover:text-accent-primary transition-colors cursor-help"
        aria-label={`${displayName}`}
      >
        ?
      </span>
      <span className="text-xs ml-1 text-ink-hint">
        {hint}
      </span>
    </div>
  );
}
