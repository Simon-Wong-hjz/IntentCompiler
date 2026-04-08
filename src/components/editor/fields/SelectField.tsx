import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface SelectFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function SelectField({ field, value, onChange }: SelectFieldProps) {
  const options = field.options ?? [];

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="select" />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(isSelected ? '' : option)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isSelected
                  ? 'font-semibold bg-bg-accent-light text-ink-primary border-[1.5px] border-accent-primary'
                  : 'bg-bg-surface text-ink-muted border border-border-default'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
