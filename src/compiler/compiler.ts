import type { FieldDefinition } from '@/registry/types';
import type { OrderedField, Language } from '@/compiler/types';
import { keyToLabel } from '@/lib/format';
import en from '@/i18n/locales/en.json';
import zh from '@/i18n/locales/zh.json';

const fieldLabels: Record<Language, Record<string, string>> = {
  en: en.fields,
  zh: zh.fields,
};

const optionLabels: Record<Language, Record<string, string>> = {
  en: en.options,
  zh: zh.options,
};

function getFieldLabel(fieldKey: string, outputLanguage: Language): string {
  return fieldLabels[outputLanguage]?.[fieldKey] ?? keyToLabel(fieldKey);
}

function getOptionLabel(optionValue: string, outputLanguage: Language): string {
  return optionLabels[outputLanguage]?.[optionValue] ?? optionValue;
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Builds skeleton OrderedFields with placeholder values for all field definitions.
 * Used to show a template preview when a task is selected but no fields are filled.
 */
export function buildSkeleton(
  fieldDefinitions: FieldDefinition[],
  outputLanguage: Language = 'zh',
): OrderedField[] {
  return fieldDefinitions.map((def) => ({
    key: def.key,
    label: getFieldLabel(def.key, outputLanguage),
    value:
      outputLanguage === 'en'
        ? `[Enter your ${def.key.replace(/_/g, ' ')}...]`
        : `[\u8F93\u5165${getFieldLabel(def.key, 'zh')}...]`,
  }));
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

    let processedValue: unknown = value;

    // Translate combo/enum option values based on output language
    if (def.inputType === 'combo' && typeof value === 'string') {
      processedValue = getOptionLabel(value, outputLanguage);
    }

    // Filter empty items from string arrays
    if (Array.isArray(value)) {
      const filtered = (value as unknown[]).filter(
        (item) => typeof item !== 'string' || item.trim().length > 0,
      );
      if (filtered.length === 0) continue;
      processedValue = filtered;
    }

    result.push({
      key: def.key,
      label: getFieldLabel(def.key, outputLanguage),
      value: processedValue,
    });
  }

  return result;
}
