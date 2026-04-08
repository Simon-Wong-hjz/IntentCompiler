import { useState, useEffect } from 'react';
import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface ComboFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function ComboField({ field, value, onChange }: ComboFieldProps) {
  const options = field.options ?? [];
  const isOptionSelected = options.includes(value);
  const [customText, setCustomText] = useState(isOptionSelected ? '' : value);

  useEffect(() => {
    if (options.includes(value)) {
      setCustomText('');
    } else {
      setCustomText(value);
    }
  }, [value, options]);

  const handlePillClick = (option: string) => {
    onChange(value === option ? '' : option);
  };

  const handleTextChange = (text: string) => {
    setCustomText(text);
    onChange(text);
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="combo" />
      <div className="rounded-lg overflow-hidden border border-border-default">
        {/* Pills section */}
        <div className="flex flex-wrap gap-2 p-2">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handlePillClick(option)}
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
        {/* Divider */}
        <div className="border-t border-border-light" />
        {/* Text input section */}
        <input
          type="text"
          value={customText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="或自定义输入..."
          className="w-full px-3 py-2 text-sm border-0 outline-none bg-bg-surface text-ink-primary placeholder:text-ink-hint"
        />
      </div>
    </div>
  );
}
