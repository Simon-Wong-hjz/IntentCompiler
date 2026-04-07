import type { OrderedField, Formatter } from '@/compiler/types';

export class MarkdownFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) return '';

    return fields
      .map((field) => {
        const value =
          typeof field.value === 'string'
            ? field.value
            : String(field.value);
        return `# ${field.label}\n${value}`;
      })
      .join('\n\n');
  }
}
