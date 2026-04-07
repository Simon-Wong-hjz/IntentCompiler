import { describe, it, expect } from 'vitest';
import { compileFields } from '@/compiler/compiler';
import type { FieldDefinition } from '@/registry/types';

const askDefaultFields: FieldDefinition[] = [
  { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
  { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
  { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
  { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
  { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default' },
  { key: 'question_type', inputType: 'select', scope: 'task', visibility: 'default' },
  { key: 'audience', inputType: 'text', scope: 'task', visibility: 'default' },
];

describe('Compiler', () => {
  it('returns ordered fields with intent first', () => {
    const fieldValues: Record<string, string> = {
      intent: 'How do React hooks work?',
      context: 'Building a new web app',
      audience: 'Junior developers',
    };

    const result = compileFields(askDefaultFields, fieldValues);

    expect(result[0].key).toBe('intent');
    expect(result[0].value).toBe('How do React hooks work?');
    expect(result.length).toBe(3);
  });

  it('omits empty optional fields from output', () => {
    const fieldValues: Record<string, string> = {
      intent: 'Explain closures',
      context: '',
      requirements: '',
      constraints: '',
      output_format: '',
      question_type: '',
      audience: '',
    };

    const result = compileFields(askDefaultFields, fieldValues);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('intent');
  });

  it('preserves field order matching definition order', () => {
    const fieldValues: Record<string, string> = {
      intent: 'Explain closures',
      audience: 'Beginners',
      context: 'JavaScript course',
      question_type: 'conceptual',
    };

    const result = compileFields(askDefaultFields, fieldValues);
    const keys = result.map((f) => f.key);

    // Should follow definition order: intent, context, question_type, audience
    expect(keys).toEqual(['intent', 'context', 'question_type', 'audience']);
  });

  it('generates human-readable labels from field keys', () => {
    const fieldValues: Record<string, string> = {
      intent: 'Test',
      output_format: 'list',
      question_type: 'how-to',
    };

    const result = compileFields(askDefaultFields, fieldValues);

    expect(result.find((f) => f.key === 'intent')!.label).toBe('Intent');
    expect(result.find((f) => f.key === 'output_format')!.label).toBe('Output Format');
    expect(result.find((f) => f.key === 'question_type')!.label).toBe('Question Type');
  });

  it('returns empty array when no fields have values', () => {
    const result = compileFields(askDefaultFields, {});
    expect(result).toEqual([]);
  });
});
