import { IntentField } from '@/components/editor/IntentField';
import { FieldRenderer } from '@/components/editor/FieldRenderer';
import type { FieldDefinition } from '@/registry/types';

interface EditorAreaProps {
  fields: FieldDefinition[];
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}

export function EditorArea({
  fields,
  fieldValues,
  onFieldChange,
}: EditorAreaProps) {
  // Separate intent from other fields
  const intentField = fields.find((f) => f.key === 'intent');
  const otherFields = fields.filter(
    (f) => f.key !== 'intent' && f.visibility === 'default',
  );

  if (fields.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">
        Select a task type above to begin
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px] p-5 overflow-y-auto">
      {intentField && (
        <IntentField
          value={fieldValues['intent'] ?? ''}
          onChange={(v) => onFieldChange('intent', v)}
        />
      )}

      {otherFields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={fieldValues[field.key] ?? ''}
          onChange={(v) => onFieldChange(field.key, v)}
        />
      ))}
    </div>
  );
}
