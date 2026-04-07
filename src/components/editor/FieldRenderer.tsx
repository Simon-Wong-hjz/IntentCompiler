import type { FieldDefinition } from '@/registry/types';
import { TextareaField } from '@/components/editor/fields/TextareaField';
import { TextField } from '@/components/editor/fields/TextField';
import { keyToLabelZh } from '@/lib/format';

interface FieldRendererProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const label = keyToLabelZh(field.key);

  switch (field.inputType) {
    case 'textarea':
      return (
        <TextareaField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="自由输入"
        />
      );

    case 'text':
      return (
        <TextField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="自由输入"
        />
      );

    case 'list':
      return (
        <TextareaField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="每行输入一项"
        />
      );

    case 'select':
      return (
        <TextField
          fieldKey={field.key}
          label={`${label}${field.options ? `（${field.options.join(' / ')}）` : ''}`}
          value={value}
          onChange={onChange}
          placeholder={field.options ? field.options.join('、') : '输入内容'}
        />
      );

    case 'combo':
      return (
        <TextField
          fieldKey={field.key}
          label={`${label}${field.options ? `（${field.options.join(' / ')}）` : ''}`}
          value={value}
          onChange={onChange}
          placeholder={field.options ? `${field.options.join('、')} 或自定义` : '选择或输入自定义值'}
        />
      );

    default:
      return (
        <TextField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="输入内容"
        />
      );
  }
}
