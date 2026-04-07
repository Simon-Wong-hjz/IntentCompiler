import { IntentField } from '@/components/editor/IntentField';
import { FieldRenderer } from '@/components/editor/FieldRenderer';
import type { FieldDefinition, TaskType } from '@/registry/types';

interface EditorAreaProps {
  fields: FieldDefinition[];
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  selectedType?: TaskType | null;
}

export function EditorArea({
  fields,
  fieldValues,
  onFieldChange,
  selectedType,
}: EditorAreaProps) {
  // No task type selected
  if (!selectedType) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-ink-muted text-sm p-5">
        请先在上方选择一个任务类型
      </div>
    );
  }

  // Task type selected but no fields defined (coming soon)
  if (fields.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-ink-muted text-sm p-5 gap-2">
        <span className="text-2xl">🚧</span>
        <span>即将推出</span>
      </div>
    );
  }

  // Separate intent from other fields
  const intentField = fields.find((f) => f.key === 'intent');
  const otherFields = fields.filter(
    (f) => f.key !== 'intent' && f.visibility === 'default',
  );

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
