import type { FieldDefinition } from '@/registry/types';
import type { OrderedField } from '@/compiler/types';

function keyToLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
): OrderedField[] {
  const result: OrderedField[] = [];

  for (const def of fieldDefinitions) {
    const value = fieldValues[def.key];
    if (!hasValue(value)) continue;

    result.push({
      key: def.key,
      label: keyToLabel(def.key),
      value,
    });
  }

  return result;
}
