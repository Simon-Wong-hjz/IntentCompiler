import type { FieldDefinition } from '@/registry/types';
import { TextareaField } from '@/components/editor/fields/TextareaField';
import { TextField } from '@/components/editor/fields/TextField';
import { keyToLabel } from '@/lib/format';

interface FieldRendererProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const label = keyToLabel(field.key);

  switch (field.inputType) {
    case 'textarea':
      return (
        <TextareaField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter text freely"
        />
      );

    case 'text':
      return (
        <TextField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter text freely"
        />
      );

    case 'list':
      return (
        <TextareaField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter items (one per line)"
        />
      );

    case 'select':
      return (
        <TextField
          fieldKey={field.key}
          label={`${label}${field.options ? ` (${field.options.join(' / ')})` : ''}`}
          value={value}
          onChange={onChange}
          placeholder={field.options ? field.options.join(', ') : 'Enter value'}
        />
      );

    case 'combo':
      return (
        <TextField
          fieldKey={field.key}
          label={`${label}${field.options ? ` (${field.options.join(' / ')})` : ''}`}
          value={value}
          onChange={onChange}
          placeholder={field.options ? `${field.options.join(', ')} or custom` : 'Select or type custom'}
        />
      );

    default:
      return (
        <TextField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter value"
        />
      );
  }
}
