import { useState, useCallback } from 'react';
import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/layout/PageLayout';
import { getTemplate } from '@/registry/template-registry';
import { useCompiler } from '@/hooks/useCompiler';
import type { TaskType, FieldDefinition } from '@/registry/types';
import type { OutputFormat, Language } from '@/compiler/types';

function App() {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
  const [addedFields, setAddedFields] = useState<FieldDefinition[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('markdown');
  const [outputLanguage, setOutputLanguage] = useState<Language>('zh');
  const { t } = useTranslation();

  // Get the current template's field definitions
  const template = selectedType ? getTemplate(selectedType) : undefined;
  const fields: FieldDefinition[] = template?.fields ?? [];

  // Build display-order fields: intent → defaults → added optionals
  // This ensures compiled output matches the editor's visual order
  const intentField = fields.find((f) => f.key === 'intent');
  const defaultFields = fields.filter(
    (f) => f.key !== 'intent' && f.visibility === 'default',
  );
  const displayOrderFields: FieldDefinition[] = [
    ...(intentField ? [intentField] : []),
    ...defaultFields,
    ...addedFields,
  ];

  // Compile fields into preview output (using display order)
  const { compiledOutput, hasContent } = useCompiler(
    displayOrderFields,
    fieldValues,
    outputFormat,
    outputLanguage,
  );

  // Copy requires both content and a non-empty Intent
  const intentFilled = ((fieldValues['intent'] as string) ?? '').trim().length > 0;
  const canCopy = hasContent && intentFilled;

  const handleSelectType = useCallback(
    (type: TaskType) => {
      if (type === selectedType) return;

      const hasNonIntentValues = Object.entries(fieldValues).some(
        ([key, val]) => {
          if (key === 'intent') return false;
          if (typeof val === 'string') return val.trim().length > 0;
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === 'boolean') return val;
          if (typeof val === 'number') return val !== 0;
          return val != null;
        },
      );

      if (selectedType !== null && hasNonIntentValues) {
        if (
          !window.confirm(t('editor.switchTaskConfirm'))
        ) {
          return;
        }
      }

      const intentValue = (fieldValues['intent'] as string) ?? '';
      setSelectedType(type);
      setFieldValues(intentValue ? { intent: intentValue } : {});
      setAddedFields([]);
    },
    [selectedType, fieldValues],
  );

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAddField = useCallback((field: FieldDefinition) => {
    setAddedFields((prev) => [...prev, field]);
  }, []);

  const handleRemoveField = useCallback((fieldKey: string) => {
    setAddedFields((prev) => prev.filter((f) => f.key !== fieldKey));
    setFieldValues((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  return (
    <PageLayout
      selectedType={selectedType}
      onSelectType={handleSelectType}
      fields={fields}
      fieldValues={fieldValues}
      onFieldChange={handleFieldChange}
      compiledOutput={compiledOutput}
      hasContent={hasContent}
      canCopy={canCopy}
      addedFields={addedFields}
      onAddField={handleAddField}
      onRemoveField={handleRemoveField}
      outputFormat={outputFormat}
      outputLanguage={outputLanguage}
      onFormatChange={setOutputFormat}
      onOutputLanguageChange={setOutputLanguage}
    />
  );
}

export default App;
