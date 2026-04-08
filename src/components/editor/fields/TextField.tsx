import { useTranslation } from 'react-i18next';
import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface TextFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({
  field,
  value,
  onChange,
  placeholder,
}: TextFieldProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('hints.text');
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel fieldKey={field.key} inputType={field.inputType} />
      <input
        type="text"
        id={field.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full bg-bg-surface border-[1.5px] border-border-default rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint focus:outline-none focus:border-accent-primary transition-colors"
      />
    </div>
  );
}
