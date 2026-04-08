import type { FieldDefinition } from '@/registry/types';
import type { OrderedField, Language } from '@/compiler/types';
import { keyToLabel } from '@/lib/format';
import en from '@/i18n/locales/en.json';
import zh from '@/i18n/locales/zh.json';

const fieldLabels: Record<Language, Record<string, string>> = {
  en: en.fields,
  zh: zh.fields,
};

function getFieldLabel(fieldKey: string, outputLanguage: Language): string {
  return fieldLabels[outputLanguage]?.[fieldKey] ?? keyToLabel(fieldKey);
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function compileFields(
  fieldDefinitions: FieldDefinition[],
  fieldValues: Record<string, unknown>,
  outputLanguage: Language = 'en',
): OrderedField[] {
  const result: OrderedField[] = [];

  for (const def of fieldDefinitions) {
    const value = fieldValues[def.key];
    if (!hasValue(value)) continue;

    result.push({
      key: def.key,
      label: getFieldLabel(def.key, outputLanguage),
      value,
    });
  }

  return result;
}
