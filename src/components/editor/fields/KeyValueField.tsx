import { useState } from 'react';
import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

export interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueFieldProps {
  field: FieldDefinition;
  value: KeyValuePair[];
  onChange: (value: KeyValuePair[]) => void;
}

export function KeyValueField({ field, value, onChange }: KeyValueFieldProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey.trim()) {
      onChange([...value, { key: newKey.trim(), value: newValue.trim() }]);
      setNewKey('');
      setNewValue('');
    }
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="key-value" />
      <div className="rounded-lg overflow-hidden border border-border-default">
        {/* Existing pairs */}
        {value.map((pair, index) => (
          <div key={index}>
            {index > 0 && <div className="border-t border-border-light" />}
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className="text-sm font-semibold px-2 py-0.5 rounded flex-shrink-0 bg-bg-page text-ink-primary">
                {pair.key}
              </span>
              <span className="text-sm flex-1 text-ink-primary">
                {pair.value}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="flex-shrink-0 text-sm transition-colors text-ink-hint hover:text-status-danger"
                aria-label="删除键值对"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {/* Add pair row */}
        {value.length > 0 && <div className="border-t border-border-light" />}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="text-sm flex-shrink-0 text-ink-hint">+</span>
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="键"
            className="text-sm outline-none bg-transparent font-semibold text-ink-primary"
            style={{ width: '80px' }}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="值"
            className="flex-1 text-sm outline-none bg-transparent text-ink-primary"
          />
        </div>
      </div>
    </div>
  );
}
