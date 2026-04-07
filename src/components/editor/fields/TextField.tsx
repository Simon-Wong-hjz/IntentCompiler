interface TextFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({
  fieldKey,
  label,
  value,
  onChange,
  placeholder,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldKey}
        className="text-xs uppercase text-ink-muted font-semibold tracking-wide"
      >
        {label}
      </label>
      <input
        type="text"
        id={fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border-[1.5px] border-border-default rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint focus:outline-none focus:border-accent-primary transition-colors"
      />
    </div>
  );
}
