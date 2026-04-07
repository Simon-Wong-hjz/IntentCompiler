import { describe, it, expect } from 'vitest';
import { MarkdownFormatter } from '@/formatters/markdown';
import type { OrderedField } from '@/compiler/types';

describe('Markdown Formatter', () => {
  const formatter = new MarkdownFormatter();

  it('formats a single field with section header', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Explain closures in JavaScript' },
    ];

    const result = formatter.format(fields);

    expect(result).toBe('# Intent\nExplain closures in JavaScript');
  });

  it('formats multiple fields separated by blank lines', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Explain closures' },
      { key: 'context', label: 'Context', value: 'JavaScript course for beginners' },
      { key: 'audience', label: 'Audience', value: 'Junior developers' },
    ];

    const result = formatter.format(fields);

    const expected = [
      '# Intent',
      'Explain closures',
      '',
      '# Context',
      'JavaScript course for beginners',
      '',
      '# Audience',
      'Junior developers',
    ].join('\n');

    expect(result).toBe(expected);
  });

  it('handles multiline values preserving line breaks', () => {
    const fields: OrderedField[] = [
      {
        key: 'context',
        label: 'Context',
        value: 'Line one\nLine two\nLine three',
      },
    ];

    const result = formatter.format(fields);

    expect(result).toBe('# Context\nLine one\nLine two\nLine three');
  });

  it('returns empty string for empty fields array', () => {
    const result = formatter.format([]);
    expect(result).toBe('');
  });

  it('preserves field ordering in output', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'First' },
      { key: 'question_type', label: 'Question Type', value: 'how-to' },
      { key: 'context', label: 'Context', value: 'Third' },
    ];

    const result = formatter.format(fields);
    const headers = result.split('\n').filter((line) => line.startsWith('# '));

    expect(headers).toEqual(['# Intent', '# Question Type', '# Context']);
  });
});
