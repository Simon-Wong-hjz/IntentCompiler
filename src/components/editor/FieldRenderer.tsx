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
  isAiFilled?: boolean;
}

export function FieldRenderer({ field, value, onChange, isAiFilled }: FieldRendererProps) {
  let content: React.ReactNode;

  switch (field.inputType) {
    case 'textarea':
      content = (
        <TextareaField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );
      break;

    case 'text':
      content = (
        <TextField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );
      break;

    case 'combo':
      content = (
        <ComboField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
        />
      );
      break;

    case 'list':
      content = (
        <ListField
          field={field}
          value={(value as string[]) ?? []}
          onChange={onChange}
        />
      );
      break;

    case 'toggle':
      content = (
        <ToggleField
          field={field}
          value={(value as boolean) ?? false}
          onChange={onChange}
        />
      );
      break;

    case 'number':
      content = (
        <NumberField
          field={field}
          value={(value as number) ?? 0}
          onChange={onChange}
        />
      );
      break;

    case 'key-value':
      content = (
        <KeyValueField
          field={field}
          value={(value as KeyValuePair[]) ?? []}
          onChange={onChange}
        />
      );
      break;

    default:
      content = (
        <TextField
          field={field}
          value={(value as string) ?? ''}
          onChange={onChange}
          placeholder={undefined}
        />
      );
  }

  if (isAiFilled) {
    return <div className="rounded-lg bg-accent-light">{content}</div>;
  }

  return content;
}
