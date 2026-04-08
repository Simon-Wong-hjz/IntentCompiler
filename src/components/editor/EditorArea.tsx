import { useState, useEffect } from 'react';
import { IntentField } from '@/components/editor/IntentField';
import { FieldRenderer } from '@/components/editor/FieldRenderer';
import { AddFieldPanel } from '@/components/editor/AddFieldPanel';
import type { FieldDefinition, TaskType } from '@/registry/types';

interface EditorAreaProps {
  fields: FieldDefinition[];
  fieldValues: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
  selectedType?: TaskType | null;
}

export function EditorArea({
  fields,
  fieldValues,
  onFieldChange,
  selectedType,
}: EditorAreaProps) {
  const [addedFields, setAddedFields] = useState<FieldDefinition[]>([]);

  // Reset added optional fields when task type changes
  // (field values are reset in App.tsx's handleSelectType)
  useEffect(() => {
    setAddedFields([]);
  }, [selectedType]);

  // No task type selected
  if (!selectedType) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-ink-muted text-sm p-5">
        请先在上方选择一个任务类型
      </div>
    );
  }

  // Task type selected but no fields defined (should not happen after Phase 2)
  if (fields.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-ink-muted text-sm p-5 gap-2">
        <span className="text-2xl">🚧</span>
        <span>即将推出</span>
      </div>
    );
  }

  // Separate fields by visibility
  const intentField = fields.find((f) => f.key === 'intent');
  const defaultFields = fields.filter(
    (f) => f.key !== 'intent' && f.visibility === 'default',
  );

  // Compute remaining optional fields for the AddFieldPanel
  const addedFieldKeys = new Set(addedFields.map((f) => f.key));
  const remainingTaskOptional = fields.filter(
    (f) =>
      f.visibility === 'optional' &&
      f.scope === 'task' &&
      !addedFieldKeys.has(f.key),
  );
  const remainingUniversalOptional = fields.filter(
    (f) =>
      f.visibility === 'optional' &&
      f.scope === 'universal' &&
      !addedFieldKeys.has(f.key),
  );

  const handleAddField = (field: FieldDefinition) => {
    setAddedFields((prev) => [...prev, field]);
  };

  const hasRemainingOptional =
    remainingTaskOptional.length > 0 || remainingUniversalOptional.length > 0;

  return (
    <div className="flex flex-col gap-[10px] p-5 overflow-y-auto">
      {/* Intent field (always first, elevated styling) */}
      {intentField && (
        <IntentField
          value={(fieldValues['intent'] as string) ?? ''}
          onChange={(v) => onFieldChange('intent', v)}
        />
      )}

      {/* Default fields */}
      {defaultFields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={fieldValues[field.key]}
          onChange={(v) => onFieldChange(field.key, v)}
        />
      ))}

      {/* Added optional fields */}
      {addedFields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={fieldValues[field.key]}
          onChange={(v) => onFieldChange(field.key, v)}
        />
      ))}

      {/* Add Field panel */}
      {hasRemainingOptional && (
        <AddFieldPanel
          taskOptionalFields={remainingTaskOptional}
          universalOptionalFields={remainingUniversalOptional}
          onAddField={handleAddField}
        />
      )}
    </div>
  );
}
