import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface NumberFieldProps {
  field: FieldDefinition;
  value: number;
  onChange: (value: number) => void;
}

export function NumberField({ field, value, onChange }: NumberFieldProps) {
  const handleDecrement = () => {
    onChange(Math.max(0, value - 1));
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="number" />
      <div className="flex items-center gap-0">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex items-center justify-center w-9 h-9 rounded-l-lg text-lg transition-colors bg-bg-surface border border-border-default text-ink-muted"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleDirectInput}
          className="h-9 text-center text-sm font-semibold outline-none bg-bg-surface text-ink-primary border-y border-border-default"
          style={{ minWidth: '40px', width: '56px' }}
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="flex items-center justify-center w-9 h-9 rounded-r-lg text-lg transition-colors bg-ink-primary text-accent-primary border border-ink-primary"
        >
          +
        </button>
      </div>
    </div>
  );
}
