import { describe, it, expect } from 'vitest';
import {
  getTemplate,
  getAllTaskTypes,
} from '@/registry/template-registry';
import type { TaskType } from '@/registry/types';

describe('Template Registry', () => {
  it('returns all 6 task types with verb and mental model', () => {
    const types = getAllTaskTypes();
    expect(types).toHaveLength(6);

    const typeNames: TaskType[] = [
      'ask', 'create', 'transform', 'analyze', 'ideate', 'execute',
    ];
    typeNames.forEach((t) => {
      const found = types.find((tt) => tt.type === t);
      expect(found).toBeDefined();
      expect(found!.verb.en).toBeTruthy();
      expect(found!.verb.zh).toBeTruthy();
      expect(found!.mentalModel.en).toBeTruthy();
      expect(found!.mentalModel.zh).toBeTruthy();
    });
  });

  it('returns Ask template with correct default fields', () => {
    const template = getTemplate('ask');
    expect(template.type).toBe('ask');

    const defaultFields = template.fields.filter(
      (f) => f.visibility === 'default'
    );
    const defaultKeys = defaultFields.map((f) => f.key);

    expect(defaultKeys).toEqual([
      'intent',
      'context',
      'requirements',
      'constraints',
      'output_format',
      'question_type',
      'audience',
    ]);
  });

  it('marks intent as required', () => {
    const template = getTemplate('ask');
    const intent = template.fields.find((f) => f.key === 'intent');
    expect(intent).toBeDefined();
    expect(intent!.required).toBe(true);
    expect(intent!.inputType).toBe('textarea');
    expect(intent!.scope).toBe('universal');
  });

  it('returns correct input types for Ask fields', () => {
    const template = getTemplate('ask');
    const fieldMap = new Map(
      template.fields.map((f) => [f.key, f])
    );

    expect(fieldMap.get('context')!.inputType).toBe('textarea');
    expect(fieldMap.get('requirements')!.inputType).toBe('list');
    expect(fieldMap.get('constraints')!.inputType).toBe('list');
    expect(fieldMap.get('output_format')!.inputType).toBe('combo');
    expect(fieldMap.get('question_type')!.inputType).toBe('combo');
    expect(fieldMap.get('audience')!.inputType).toBe('text');
  });

  it('returns Create template with populated fields', () => {
    const template = getTemplate('create');
    expect(template.type).toBe('create');
    expect(template.fields.length).toBeGreaterThan(0);
  });

  it('throws for unknown task type', () => {
    expect(() => getTemplate('unknown' as TaskType)).toThrow('Unknown task type: unknown');
  });
});
