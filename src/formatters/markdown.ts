import type { OrderedField, Formatter } from '@/compiler/types';

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    // Check if it's KeyValuePair[]
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'key' in value[0]) {
      return value.map((pair) => `- **${pair.key}**: ${pair.value}`).join('\n');
    }
    // Plain string array — render as bullet list
    return value.map((item) => `- ${item}`).join('\n');
  }
  return String(value);
}

export class MarkdownFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) return '';

    return fields
      .map((field) => `# ${field.label}\n${formatValue(field.value)}`)
      .join('\n\n');
  }
}
