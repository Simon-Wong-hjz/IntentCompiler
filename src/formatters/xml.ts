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
  // Replace whitespace with underscores
  let tag = label.replace(/\s+/g, '_');
  // Keep Unicode letters, digits, underscore, hyphen, period (XML 1.0 allows CJK chars)
  tag = tag.replace(/[^\p{L}\p{N}_\-.]/gu, '');
  // XML tag names must start with a letter or underscore
  if (tag && !/^[\p{L}_]/u.test(tag)) {
    tag = '_' + tag;
  }
  return tag || 'field';
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

function isKeyValueArray(value: unknown): value is Array<{ key: string; value: string }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'key' in value[0]
  );
}

export class XmlFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) {
      return '<prompt>\n</prompt>';
    }

    const indent = '  ';
    const body = fields
      .flatMap((field) => {
        if (isKeyValueArray(field.value)) {
          return field.value
            .filter((pair) => pair.key.trim() || pair.value.trim())
            .map((pair) => {
              const tag = sanitizeTagName(pair.key || 'untitled');
              return `${indent}<${tag}>${escapeXml(pair.value)}</${tag}>`;
            });
        }
        const tag = sanitizeTagName(field.label);
        const content = serializeValue(field.value, indent);
        return `${indent}<${tag}>${content}</${tag}>`;
      })
      .join('\n');

    return `<prompt>\n${body}\n</prompt>`;
  }
}
