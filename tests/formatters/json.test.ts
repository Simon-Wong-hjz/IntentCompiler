import { describe, it, expect } from 'vitest';
import { JsonFormatter } from '@/formatters/json';
import type { OrderedField } from '@/compiler/types';

describe('JsonFormatter', () => {
  const formatter = new JsonFormatter();

  it('produces valid parseable JSON from ordered fields', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Write a REST API' },
      { key: 'context', label: 'Context', value: 'Node.js project' },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({
      Intent: 'Write a REST API',
      Context: 'Node.js project',
    });
  });

  it('preserves field ordering in output', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Do something' },
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure'] },
      { key: 'context', label: 'Context', value: 'Background info' },
    ];
    const result = formatter.format(fields);
    const keys = Object.keys(JSON.parse(result));
    expect(keys).toEqual(['Intent', 'Requirements', 'Context']);
  });

  it('handles array values', () => {
    const fields: OrderedField[] = [
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure', 'scalable'] },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed.Requirements).toEqual(['fast', 'secure', 'scalable']);
  });

  it('handles boolean values', () => {
    const fields: OrderedField[] = [
      { key: 'include_tests', label: 'Include Tests', value: true },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed['Include Tests']).toBe(true);
  });

  it('handles numeric values', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea Count', value: 5 },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed['Idea Count']).toBe(5);
  });

  it('handles key-value pair values (objects)', () => {
    const fields: OrderedField[] = [
      {
        key: 'custom_fields',
        label: 'Custom Fields',
        value: { deadline: '2026-05-01', priority: 'high' },
      },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed['Custom Fields']).toEqual({ deadline: '2026-05-01', priority: 'high' });
  });

  it('handles special characters in values', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Parse "JSON" with <special> & chars' },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed.Intent).toBe('Parse "JSON" with <special> & chars');
  });

  it('handles multiline string values', () => {
    const fields: OrderedField[] = [
      { key: 'context', label: 'Context', value: 'Line 1\nLine 2\nLine 3' },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed.Context).toBe('Line 1\nLine 2\nLine 3');
  });

  it('returns empty JSON object for empty fields array', () => {
    const result = formatter.format([]);
    expect(JSON.parse(result)).toEqual({});
  });

  it('outputs with 2-space indentation for readability', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Test' },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('\n');
    expect(result).toMatch(/^{\n {2}"/);
  });
});
