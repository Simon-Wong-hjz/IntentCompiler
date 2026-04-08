import type { FieldDefinition } from '@/registry/types';
import { TextareaField } from '@/components/editor/fields/TextareaField';
import { TextField } from '@/components/editor/fields/TextField';
import { ComboField } from '@/components/editor/fields/ComboField';
import { ListField } from '@/components/editor/fields/ListField';
import { ToggleField } from '@/components/editor/fields/ToggleField';
import { NumberField } from '@/components/editor/fields/NumberField';
import { KeyValueField, type KeyValuePair } from '@/components/editor/fields/KeyValueField';

interface FieldRendererProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  switch (field.inputType) {
    case 'textarea':
      return (
        <TextareaField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'text':
      return (
        <TextField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'combo':
      return (
        <ComboField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );

    case 'list':
      return (
        <ListField
          field={field}
          value={(value as string[]) ?? []}
          onChange={onChange}
        />
      );

    case 'toggle':
      return (
        <ToggleField
          field={field}
          value={(value as boolean) ?? false}
          onChange={onChange}
        />
      );

    case 'number':
      return (
        <NumberField
          field={field}
          value={(value as number) ?? 0}
          onChange={onChange}
        />
      );

    case 'key-value':
      return (
        <KeyValueField
          field={field}
          value={(value as KeyValuePair[]) ?? []}
          onChange={onChange}
        />
      );

    default:
      return (
        <TextField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
          placeholder="输入内容"
        />
      );
  }
}
