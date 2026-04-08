import { useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { getTemplate } from '@/registry/template-registry';
import { useCompiler } from '@/hooks/useCompiler';
import type { TaskType, FieldDefinition } from '@/registry/types';

function App() {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});

  // Get the current template's field definitions
  const template = selectedType ? getTemplate(selectedType) : undefined;
  const fields: FieldDefinition[] = template?.fields ?? [];

  // Compile fields into preview output
  const { compiledOutput, hasContent } = useCompiler(
    fields,
    fieldValues,
    'markdown',
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
          !window.confirm(
            '切换任务类型将清空除"意图"之外的所有字段，是否继续？',
          )
        ) {
          return;
        }
      }

      const intentValue = (fieldValues['intent'] as string) ?? '';
      setSelectedType(type);
      setFieldValues(intentValue ? { intent: intentValue } : {});
    },
    [selectedType, fieldValues],
  );

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
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
    />
  );
}

export default App;
