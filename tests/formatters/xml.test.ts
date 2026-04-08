import { describe, it, expect } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import { XmlFormatter } from '@/formatters/xml';
import type { OrderedField } from '@/compiler/types';

const parser = new XMLParser({
  preserveOrder: true,
  trimValues: false,
});

describe('XmlFormatter', () => {
  const formatter = new XmlFormatter();

  it('produces valid XML wrapped in <prompt> root element', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Write a REST API' },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<prompt>');
    expect(result).toContain('</prompt>');
    expect(result).toContain('<Intent>');
    expect(result).toContain('</Intent>');
    expect(() => parser.parse(result)).not.toThrow();
  });

  it('preserves field ordering in output', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Do something' },
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure'] },
      { key: 'context', label: 'Context', value: 'Background info' },
    ];
    const result = formatter.format(fields);
    const intentPos = result.indexOf('<Intent>');
    const requirementsPos = result.indexOf('<Requirements>');
    const contextPos = result.indexOf('<Context>');
    expect(intentPos).toBeLessThan(requirementsPos);
    expect(requirementsPos).toBeLessThan(contextPos);
  });

  it('handles array values with <item> sub-elements', () => {
    const fields: OrderedField[] = [
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure', 'scalable'] },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<item>fast</item>');
    expect(result).toContain('<item>secure</item>');
    expect(result).toContain('<item>scalable</item>');
  });

  it('handles boolean values', () => {
    const fields: OrderedField[] = [
      { key: 'include_tests', label: 'Include_Tests', value: true },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Include_Tests>true</Include_Tests>');
  });

  it('handles numeric values', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea_Count', value: 5 },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Idea_Count>5</Idea_Count>');
  });

  it('handles key-value pair values with sub-elements', () => {
    const fields: OrderedField[] = [
      {
        key: 'custom_fields',
        label: 'Custom_Fields',
        value: { deadline: '2026-05-01', priority: 'high' },
      },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Custom_Fields>');
    expect(result).toContain('<deadline>2026-05-01</deadline>');
    expect(result).toContain('<priority>high</priority>');
    expect(result).toContain('</Custom_Fields>');
  });

  it('escapes special XML characters in text content', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Use <angle> & "quotes" properly' },
    ];
    const result = formatter.format(fields);
    const intentContent = result.match(/<Intent>([\s\S]*?)<\/Intent>/)?.[1] ?? '';
    expect(intentContent).not.toContain('<angle>');
    expect(intentContent).toContain('&lt;');
    expect(intentContent).toContain('&amp;');
    expect(() => parser.parse(result)).not.toThrow();
  });

  it('handles multiline string values', () => {
    const fields: OrderedField[] = [
      { key: 'context', label: 'Context', value: 'Line 1\nLine 2\nLine 3' },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('Line 1\nLine 2\nLine 3');
    expect(() => parser.parse(result)).not.toThrow();
  });

  it('returns empty prompt element for empty fields array', () => {
    const result = formatter.format([]);
    expect(result).toContain('<prompt>');
    expect(result).toContain('</prompt>');
    const content = result.replace(/<\/?prompt>/g, '').trim();
    expect(content).toBe('');
  });

  it('converts spaces in labels to underscores for valid XML tag names', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea Count', value: 3 },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Idea_Count>');
    expect(result).not.toContain('<Idea Count>');
  });
});
