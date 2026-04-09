import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InputType } from '@/registry/types';
import { HelpCard } from '@/components/help/HelpCard';
import { helpContentMap } from '@/data/help-content';

interface FieldLabelProps {
  fieldKey: string;
  inputType: InputType;
}

export function FieldLabel({ fieldKey, inputType }: FieldLabelProps) {
  const { t } = useTranslation();
  const [helpOpen, setHelpOpen] = useState(false);
  const displayName = t(`fields.${fieldKey}`);
  const hint = t(`hints.${inputType}`);
  const helpContent = helpContentMap[fieldKey];

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-bold text-ink-primary">
          {displayName}
        </span>
        <button
          type="button"
          onClick={() => setHelpOpen((prev) => !prev)}
          className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold flex-shrink-0 -translate-y-1 transition-colors duration-150 ${
            helpOpen
              ? 'bg-ink-primary text-accent-primary'
              : 'border border-ink-hint text-ink-muted hover:border-accent-primary hover:text-accent-primary'
          }`}
          aria-expanded={helpOpen}
          aria-label={`Help for ${fieldKey}`}
        >
          ?
        </button>
        <span className="text-xs ml-1 text-ink-hint">
          {hint}
        </span>
      </div>
      {helpContent && (
        <HelpCard content={helpContent} isOpen={helpOpen} />
      )}
    </div>
  );
}
