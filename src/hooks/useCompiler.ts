import { useMemo } from 'react';
import type { FieldDefinition } from '@/registry/types';
import { compileFields } from '@/compiler/compiler';
import { getFormatter } from '@/formatters';
import type { OutputFormat } from '@/compiler/types';

export function useCompiler(
  fieldDefinitions: FieldDefinition[],
  fieldValues: Record<string, string>,
  format: OutputFormat = 'markdown',
) {
  const compiledOutput = useMemo(() => {
    const orderedFields = compileFields(fieldDefinitions, fieldValues);
    if (orderedFields.length === 0) return '';
    const formatter = getFormatter(format);
    return formatter.format(orderedFields);
  }, [fieldDefinitions, fieldValues, format]);

  const hasContent = compiledOutput.trim().length > 0;

  return { compiledOutput, hasContent };
}
