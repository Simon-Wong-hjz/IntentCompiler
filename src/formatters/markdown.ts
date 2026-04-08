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

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    // Plain string array — render as bullet list
    return value.map((item) => `- ${item}`).join('\n');
  }
  return String(value);
}

export class MarkdownFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) return '';

    const sections: string[] = [];

    for (const field of fields) {
      // KeyValuePair[] — expand each pair into its own heading section
      if (isKeyValueArray(field.value)) {
        for (const pair of field.value) {
          if (pair.key.trim() || pair.value.trim()) {
            sections.push(`# ${pair.key || '(untitled)'}\n${pair.value}`);
          }
        }
      } else {
        sections.push(`# ${field.label}\n${formatValue(field.value)}`);
      }
    }

    return sections.join('\n\n');
  }
}
