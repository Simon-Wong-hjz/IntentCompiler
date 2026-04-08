import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface ToggleFieldProps {
  field: FieldDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleField({ field, value, onChange }: ToggleFieldProps) {
  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="toggle" />
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative flex-shrink-0 p-0 rounded-full transition-colors duration-200"
        style={{
          width: '36px',
          height: '20px',
          boxSizing: 'border-box',
          backgroundColor: value ? 'var(--color-accent-primary)' : 'transparent',
          border: value ? '2px solid var(--color-accent-primary)' : '2px solid var(--color-border-default)',
        }}
      >
        <span
          className="absolute rounded-full transition-transform duration-200"
          style={{
            width: '12px',
            height: '12px',
            top: '2px',
            left: '0px',
            backgroundColor: value ? 'var(--color-ink-primary)' : 'var(--color-ink-muted)',
            transform: value ? 'translateX(18px)' : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  );
}
