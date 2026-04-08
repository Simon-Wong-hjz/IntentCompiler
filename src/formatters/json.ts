import type { OrderedField, Formatter } from '@/compiler/types';

function isKeyValueArray(value: unknown): value is Array<{ key: string; value: string }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'key' in value[0]
  );
}

export class JsonFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    const entries: [string, unknown][] = [];
    for (const field of fields) {
      if (isKeyValueArray(field.value)) {
        for (const pair of field.value) {
          if (pair.key.trim() || pair.value.trim()) {
            entries.push([pair.key || '(untitled)', pair.value]);
          }
        }
      } else {
        entries.push([field.label, field.value]);
      }
    }
    const obj = Object.fromEntries(entries);
    return JSON.stringify(obj, null, 2);
  }
}
