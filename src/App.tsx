import { useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { getTemplate } from '@/registry/template-registry';
import { useCompiler } from '@/hooks/useCompiler';
import type { TaskType, FieldDefinition } from '@/registry/types';

function App() {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Get the current template's field definitions
  const template = selectedType ? getTemplate(selectedType) : undefined;
  const fields: FieldDefinition[] = template?.fields ?? [];

  // Compile fields into preview output
  const { compiledOutput, hasContent } = useCompiler(
    fields,
    fieldValues,
    'markdown',
  );

  const handleSelectType = useCallback((type: TaskType) => {
    setSelectedType(type);
    setFieldValues({});
  }, []);

  const handleFieldChange = useCallback((key: string, value: string) => {
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
    />
  );
}

export default App;
