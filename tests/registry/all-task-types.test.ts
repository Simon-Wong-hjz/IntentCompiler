import { describe, it, expect } from 'vitest';
import { getTemplate } from '@/registry/template-registry';
import type { TaskType, FieldDefinition } from '@/registry/types';

const ALL_TASK_TYPES: TaskType[] = ['ask', 'create', 'transform', 'analyze', 'ideate', 'execute'];

describe('All task types registered', () => {
  it.each(ALL_TASK_TYPES)('getTemplate("%s") returns a template with non-empty fields', (taskType) => {
    const template = getTemplate(taskType);
    expect(template).toBeDefined();
    expect(template.type).toBe(taskType);
    expect(template.fields.length).toBeGreaterThan(0);
  });

  it.each(ALL_TASK_TYPES)('"%s" has intent as the first field and it is required', (taskType) => {
    const template = getTemplate(taskType);
    const intentField = template.fields[0];
    expect(intentField.key).toBe('intent');
    expect(intentField.required).toBe(true);
    expect(intentField.visibility).toBe('default');
  });

  it.each(ALL_TASK_TYPES)('"%s" has custom_fields as the last field', (taskType) => {
    const template = getTemplate(taskType);
    const lastField = template.fields[template.fields.length - 1];
    expect(lastField.key).toBe('custom_fields');
    expect(lastField.inputType).toBe('key-value');
  });

  it.each(ALL_TASK_TYPES)('"%s" has all universal default fields', (taskType) => {
    const template = getTemplate(taskType);
    const defaultFields = template.fields.filter(
      (f: FieldDefinition) => f.visibility === 'default'
    );
    const defaultKeys = defaultFields.map((f: FieldDefinition) => f.key);
    expect(defaultKeys).toContain('intent');
    expect(defaultKeys).toContain('context');
    expect(defaultKeys).toContain('requirements');
    expect(defaultKeys).toContain('constraints');
    expect(defaultKeys).toContain('output_format');
  });

  it.each(ALL_TASK_TYPES)('"%s" default fields come before optional fields', (taskType) => {
    const template = getTemplate(taskType);
    const firstOptionalIndex = template.fields.findIndex(
      (f: FieldDefinition) => f.visibility === 'optional'
    );
    if (firstOptionalIndex === -1) return;
    const fieldsBeforeFirstOptional = template.fields.slice(0, firstOptionalIndex);
    fieldsBeforeFirstOptional.forEach((f: FieldDefinition) => {
      expect(f.visibility).toBe('default');
    });
  });

  // Task-specific field count checks
  it('Create has content_type, key_points, tone as task defaults', () => {
    const template = getTemplate('create');
    const taskDefaults = template.fields.filter(
      (f: FieldDefinition) => f.scope === 'task' && f.visibility === 'default'
    );
    const keys = taskDefaults.map((f: FieldDefinition) => f.key);
    expect(keys).toContain('content_type');
    expect(keys).toContain('key_points');
    expect(keys).toContain('tone');
  });

  it('Transform has source_content, transform_type as task defaults', () => {
    const template = getTemplate('transform');
    const taskDefaults = template.fields.filter(
      (f: FieldDefinition) => f.scope === 'task' && f.visibility === 'default'
    );
    const keys = taskDefaults.map((f: FieldDefinition) => f.key);
    expect(keys).toContain('source_content');
    expect(keys).toContain('transform_type');
  });

  it('Analyze has subject, analyze_type, criteria as task defaults', () => {
    const template = getTemplate('analyze');
    const taskDefaults = template.fields.filter(
      (f: FieldDefinition) => f.scope === 'task' && f.visibility === 'default'
    );
    const keys = taskDefaults.map((f: FieldDefinition) => f.key);
    expect(keys).toContain('subject');
    expect(keys).toContain('analyze_type');
    expect(keys).toContain('criteria');
  });

  it('Ideate has problem, current_state, goal, assumptions as task defaults', () => {
    const template = getTemplate('ideate');
    const taskDefaults = template.fields.filter(
      (f: FieldDefinition) => f.scope === 'task' && f.visibility === 'default'
    );
    const keys = taskDefaults.map((f: FieldDefinition) => f.key);
    expect(keys).toContain('problem');
    expect(keys).toContain('current_state');
    expect(keys).toContain('goal');
    expect(keys).toContain('assumptions');
  });

  it('Execute has plan, goal as task defaults', () => {
    const template = getTemplate('execute');
    const taskDefaults = template.fields.filter(
      (f: FieldDefinition) => f.scope === 'task' && f.visibility === 'default'
    );
    const keys = taskDefaults.map((f: FieldDefinition) => f.key);
    expect(keys).toContain('plan');
    expect(keys).toContain('goal');
  });

  it('Ideate scopes goal and assumptions as task (not universal)', () => {
    const template = getTemplate('ideate');
    const goalField = template.fields.find((f: FieldDefinition) => f.key === 'goal');
    const assumptionsField = template.fields.find((f: FieldDefinition) => f.key === 'assumptions');
    expect(goalField?.scope).toBe('task');
    expect(assumptionsField?.scope).toBe('task');
  });

  it('Execute scopes goal as task (not universal)', () => {
    const template = getTemplate('execute');
    const goalField = template.fields.find((f: FieldDefinition) => f.key === 'goal');
    expect(goalField?.scope).toBe('task');
  });

  it('Create scopes tone as task (not universal)', () => {
    const template = getTemplate('create');
    const toneField = template.fields.find((f: FieldDefinition) => f.key === 'tone');
    expect(toneField?.scope).toBe('task');
    expect(toneField?.visibility).toBe('default');
  });
});
