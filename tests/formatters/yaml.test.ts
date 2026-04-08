import { describe, it, expect } from 'vitest';
import * as yaml from 'js-yaml';
import { YamlFormatter } from '@/formatters/yaml';
import type { OrderedField } from '@/compiler/types';

describe('YamlFormatter', () => {
  const formatter = new YamlFormatter();

  it('produces valid parseable YAML from ordered fields', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Write a REST API' },
      { key: 'context', label: 'Context', value: 'Node.js project' },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
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
    const lines = result.split('\n').filter((line) => /^\S/.test(line));
    expect(lines[0]).toMatch(/^Intent:/);
    expect(lines[1]).toMatch(/^Requirements:/);
    const contextLine = lines.find((l) => l.startsWith('Context:'));
    expect(contextLine).toBeDefined();
  });

  it('handles array values as YAML sequences', () => {
    const fields: OrderedField[] = [
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure', 'scalable'] },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed.Requirements).toEqual(['fast', 'secure', 'scalable']);
  });

  it('handles boolean values', () => {
    const fields: OrderedField[] = [
      { key: 'include_tests', label: 'Include Tests', value: true },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed['Include Tests']).toBe(true);
  });

  it('handles numeric values', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea Count', value: 5 },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed['Idea Count']).toBe(5);
  });

  it('handles key-value pair values as nested YAML mappings', () => {
    const fields: OrderedField[] = [
      {
        key: 'custom_fields',
        label: 'Custom Fields',
        value: { deadline: '2026-05-01', priority: 'high' },
      },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed['Custom Fields']).toEqual({
      deadline: '2026-05-01',
      priority: 'high',
    });
  });

  it('handles special characters in values without corruption', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Use "quotes" & <angle brackets>' },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed.Intent).toBe('Use "quotes" & <angle brackets>');
  });

  it('handles multiline string values', () => {
    const fields: OrderedField[] = [
      { key: 'context', label: 'Context', value: 'Line 1\nLine 2\nLine 3' },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect((parsed.Context as string).trim()).toBe('Line 1\nLine 2\nLine 3');
  });

  it('returns empty string for empty fields array', () => {
    const result = formatter.format([]);
    expect(result).toBe('');
  });

  it('preserves insertion order even with many fields', () => {
    const fields: OrderedField[] = [
      { key: 'a', label: 'Alpha', value: '1' },
      { key: 'b', label: 'Beta', value: '2' },
      { key: 'c', label: 'Gamma', value: '3' },
      { key: 'd', label: 'Delta', value: '4' },
      { key: 'e', label: 'Epsilon', value: '5' },
    ];
    const result = formatter.format(fields);
    const topLevelKeys = result
      .split('\n')
      .filter((line) => /^\S/.test(line) && line.includes(':'))
      .map((line) => line.split(':')[0]);
    expect(topLevelKeys).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']);
  });
});
