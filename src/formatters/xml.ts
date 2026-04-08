import type { OrderedField, Formatter } from '@/compiler/types';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeTagName(label: string): string {
  return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
}

function serializeValue(value: unknown, indent: string): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => `\n${indent}  <item>${escapeXml(String(item))}</item>`)
      .join('') + `\n${indent}`;
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries
      .map(
        ([key, val]) =>
          `\n${indent}  <${sanitizeTagName(key)}>${escapeXml(String(val))}</${sanitizeTagName(key)}>`,
      )
      .join('') + `\n${indent}`;
  }

  return escapeXml(String(value));
}

export class XmlFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) {
      return '<prompt>\n</prompt>';
    }

    const indent = '  ';
    const body = fields
      .map((field) => {
        const tag = sanitizeTagName(field.label);
        const content = serializeValue(field.value, indent);
        return `${indent}<${tag}>${content}</${tag}>`;
      })
      .join('\n');

    return `<prompt>\n${body}\n</prompt>`;
  }
}
