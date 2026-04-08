import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IntentField } from '@/components/editor/IntentField';
import { FieldRenderer } from '@/components/editor/FieldRenderer';
import { AddFieldPanel } from '@/components/editor/AddFieldPanel';
import type { FieldDefinition, TaskType } from '@/registry/types';

/** Duration of the field-collapse animation (ms). */
const FIELD_COLLAPSE_DURATION = 200;

interface EditorAreaProps {
  fields: FieldDefinition[];
  fieldValues: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
  selectedType?: TaskType | null;
  addedFields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
  onRemoveField: (fieldKey: string) => void;
}

export function EditorArea({
  fields,
  fieldValues,
  onFieldChange,
  selectedType,
  addedFields,
  onAddField,
  onRemoveField,
}: EditorAreaProps) {
  const { t } = useTranslation();
  const [removingFieldKey, setRemovingFieldKey] = useState<string | null>(null);

  // No task type selected
  if (!selectedType) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-ink-muted text-sm p-5">
        {t('editor.selectTaskPrompt')}
      </div>
    );
  }

  // Task type selected but no fields defined (should not happen after Phase 2)
  if (fields.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-ink-muted text-sm p-5 gap-2">
        <span className="text-2xl">🚧</span>
        <span>{t('editor.comingSoon')}</span>
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

  const hasRemainingOptional =
    remainingTaskOptional.length > 0 || remainingUniversalOptional.length > 0;

  const handleRemoveClick = (fieldKey: string) => {
    setRemovingFieldKey(fieldKey);
    setTimeout(() => {
      onRemoveField(fieldKey);
      setRemovingFieldKey(null);
    }, FIELD_COLLAPSE_DURATION);
  };

  return (
    <div className="flex flex-col gap-6 p-5 overflow-y-auto">
      {/* Intent field (always first, elevated styling) */}
      {intentField && (
        <IntentField
          value={(fieldValues['intent'] as string) ?? ''}
          onChange={(v) => onFieldChange('intent', v)}
        />
      )}

      {/* Default fields — separated by subtle dividers */}
      {defaultFields.map((field, index) => (
        <div key={field.key}>
          {index === 0 && <div className="border-t border-border-light -mt-1 mb-4" />}
          {index > 0 && <div className="border-t border-border-light -mt-2 mb-4" />}
          <FieldRenderer
            field={field}
            value={fieldValues[field.key]}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        </div>
      ))}

      {/* Added optional fields — removable, with dividers */}
      {addedFields.map((field) => {
        const isRemoving = removingFieldKey === field.key;
        return (
          <div
            key={field.key}
            style={isRemoving
              ? { display: 'grid', animation: `field-collapse ${FIELD_COLLAPSE_DURATION}ms ease-in forwards` }
              : { display: 'grid', gridTemplateRows: '1fr' }
            }
          >
            <div style={{ overflow: 'hidden', minHeight: 0 }}>
              <div className="border-t border-border-light mb-4" />
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveClick(field.key)}
                  disabled={isRemoving}
                  className="absolute -top-1 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-ink-hint hover:text-status-danger"
                  aria-label={`remove ${field.key}`}
                >
                  ✕
                </button>
                <FieldRenderer
                  field={field}
                  value={fieldValues[field.key]}
                  onChange={(v) => onFieldChange(field.key, v)}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Field panel — visually separated */}
      {hasRemainingOptional && (
        <div className="pt-2 mt-2 border-t border-border-default">
          <AddFieldPanel
            taskOptionalFields={remainingTaskOptional}
            universalOptionalFields={remainingUniversalOptional}
            onAddField={onAddField}
          />
        </div>
      )}
    </div>
  );
}
