import { FieldLabel } from '@/components/editor/FieldLabel';
import { keyToLabelZh } from '@/lib/format';
import type { FieldDefinition } from '@/registry/types';

interface ToggleFieldProps {
  field: FieldDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleField({ field, value, onChange }: ToggleFieldProps) {
  const displayName = keyToLabelZh(field.key);

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="toggle" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className="relative flex-shrink-0 rounded-full transition-colors duration-200"
          style={{
            width: '36px',
            height: '20px',
            backgroundColor: value ? 'var(--color-accent-primary)' : 'transparent',
            border: value ? '1.5px solid var(--color-accent-primary)' : '1.5px solid var(--color-border-default)',
          }}
        >
          <span
            className="absolute top-[1px] rounded-full transition-transform duration-200"
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: value ? 'var(--color-ink-primary)' : 'var(--color-ink-muted)',
              transform: value ? 'translateX(17px)' : 'translateX(1px)',
            }}
          />
        </button>
        <span className="text-sm text-ink-secondary">
          {value ? '是' : '否'} — {displayName}
        </span>
      </div>
    </div>
  );
}
