import { useMemo } from 'react';
import type { FieldDefinition } from '@/registry/types';
import { compileFields, buildSkeleton } from '@/compiler/compiler';
import { getFormatter } from '@/formatters';
import type { OutputFormat, Language } from '@/compiler/types';

export function useCompiler(
  fieldDefinitions: FieldDefinition[],
  fieldValues: Record<string, unknown>,
  format: OutputFormat = 'markdown',
  outputLanguage: Language = 'zh',
) {
  const compiledOutput = useMemo(() => {
    const orderedFields = compileFields(fieldDefinitions, fieldValues, outputLanguage);
    if (orderedFields.length === 0) return '';
    const formatter = getFormatter(format);
    return formatter.format(orderedFields);
  }, [fieldDefinitions, fieldValues, format, outputLanguage]);

  const hasContent = compiledOutput.trim().length > 0;

  // Generate skeleton preview when field definitions exist but no content
  const skeletonOutput = useMemo(() => {
    if (hasContent || fieldDefinitions.length === 0) return '';
    const skeletonFields = buildSkeleton(fieldDefinitions, outputLanguage);
    const formatter = getFormatter(format);
    return formatter.format(skeletonFields);
  }, [hasContent, fieldDefinitions, format, outputLanguage]);

  return { compiledOutput, hasContent, skeletonOutput };
}
