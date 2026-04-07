# Phase 2: Complete Task Types + All Input Types + Progressive Disclosure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Intent Compiler from a single-task-type MVP to a fully functional multi-task editor with all 6 task types, all 8 input type renderers, field labels, and a progressive disclosure panel for optional fields.

**Architecture:** The Template Registry gains 5 new task type modules (create, transform, analyze, ideate, execute) each exporting a `TaskTemplate` with complete field arrays matching the PRD tables. Six new field components (SelectField, ComboField, ListField, ToggleField, NumberField, KeyValueField) implement the remaining `InputType` variants. A FieldLabel component standardizes the label pattern across all fields. An AddFieldPanel manages progressive disclosure of optional fields grouped by scope.

**Tech Stack:** React 19.2, TypeScript 6, Vite 8, Tailwind CSS v4, shadcn/ui (uses unscoped `radix-ui` package), Vitest 4.1 + React Testing Library + jsdom, @dnd-kit/sortable (for list drag-to-reorder)

> **Phase 1 Audit Note:** Phase 1 installed newer versions than originally planned. See `.claude/progress/2026-04-07-02-phase-plan-audit.md` for full details. Key differences: Tailwind v4 uses `@theme {}` block in `src/index.css` instead of `tailwind.config.ts`; TypeScript 6 has no `baseUrl`; shadcn/ui uses unscoped `radix-ui` package (not `@radix-ui/react-*`).

---

## File Structure

```
Files to CREATE:
  src/registry/task-types/create.ts
  src/registry/task-types/transform.ts
  src/registry/task-types/analyze.ts
  src/registry/task-types/ideate.ts
  src/registry/task-types/execute.ts
  src/components/editor/FieldLabel.tsx
  src/components/editor/fields/SelectField.tsx
  src/components/editor/fields/ComboField.tsx
  src/components/editor/fields/ListField.tsx
  src/components/editor/fields/ToggleField.tsx
  src/components/editor/fields/NumberField.tsx
  src/components/editor/fields/KeyValueField.tsx
  src/components/editor/AddFieldPanel.tsx
  tests/registry/all-task-types.test.ts
  tests/components/SelectField.test.tsx
  tests/components/ListField.test.tsx
  tests/components/AddFieldPanel.test.tsx

Files to MODIFY:
  src/registry/template-registry.ts       — import and register all 5 new task types
  src/components/editor/FieldRenderer.tsx  — add dispatch cases for new input types
  src/components/editor/EditorArea.tsx     — integrate FieldLabel, AddFieldPanel, task-switch reset
  src/components/editor/IntentField.tsx    — use FieldLabel
  src/components/editor/fields/TextareaField.tsx — use FieldLabel
  src/components/editor/fields/TextField.tsx     — use FieldLabel
```

---

### Task 1: Create Task Type Definition

**Files:**
- Create: `src/registry/task-types/create.ts`

- [ ] **Step 1: Create the Create task type module**

```typescript
// src/registry/task-types/create.ts
import type { TaskTemplate } from '../types';

export const createTemplate: TaskTemplate = {
  type: 'create',
  verb: { en: 'Create', zh: '创作' },
  mentalModel: { en: 'I want to make something', zh: '我想做出一样东西' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'content_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['email', 'article', 'doc', 'code', 'script'] },
    { key: 'key_points', inputType: 'list', scope: 'task', visibility: 'default' },
    { key: 'tone', inputType: 'combo', scope: 'task', visibility: 'default', options: ['formal', 'casual', 'technical', 'friendly'] },
    // --- Task Optional fields ---
    { key: 'tech_stack', inputType: 'text', scope: 'task', visibility: 'optional' },
    { key: 'target_length', inputType: 'text', scope: 'task', visibility: 'optional' },
    { key: 'structure', inputType: 'textarea', scope: 'task', visibility: 'optional' },
    { key: 'include_tests', inputType: 'toggle', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'assumptions', inputType: 'list', scope: 'universal', visibility: 'optional' },
    { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
    { key: 'detail_level', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
    { key: 'thinking_style', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
    { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
  ],
};
```

- [ ] **Step 2: Verify module compiles**

Run: `npx tsc --noEmit src/registry/task-types/create.ts`
Expected: No errors

- [ ] **Step 3: Commit**

---

### Task 2: Transform Task Type Definition

**Files:**
- Create: `src/registry/task-types/transform.ts`

- [ ] **Step 1: Create the Transform task type module**

```typescript
// src/registry/task-types/transform.ts
import type { TaskTemplate } from '../types';

export const transformTemplate: TaskTemplate = {
  type: 'transform',
  verb: { en: 'Transform', zh: '转化' },
  mentalModel: { en: 'I have content, change its form', zh: '我有内容，换一种形式' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'source_content', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'transform_type', inputType: 'select', scope: 'task', visibility: 'default', options: ['summarize', 'translate', 'rewrite', 'simplify', 'format convert'] },
    // --- Task Optional fields ---
    { key: 'preserve', inputType: 'list', scope: 'task', visibility: 'optional' },
    { key: 'target_length', inputType: 'text', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'assumptions', inputType: 'list', scope: 'universal', visibility: 'optional' },
    { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
    { key: 'detail_level', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
    { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
    { key: 'thinking_style', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
    { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
  ],
};
```

- [ ] **Step 2: Verify module compiles**

Run: `npx tsc --noEmit src/registry/task-types/transform.ts`
Expected: No errors

- [ ] **Step 3: Commit**

---

### Task 3: Analyze Task Type Definition

**Files:**
- Create: `src/registry/task-types/analyze.ts`

- [ ] **Step 1: Create the Analyze task type module**

```typescript
// src/registry/task-types/analyze.ts
import type { TaskTemplate } from '../types';

export const analyzeTemplate: TaskTemplate = {
  type: 'analyze',
  verb: { en: 'Analyze', zh: '分析' },
  mentalModel: { en: 'Help me judge / understand', zh: '帮我判断/理解' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'subject', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'analyze_type', inputType: 'select', scope: 'task', visibility: 'default', options: ['evaluate', 'compare', 'data interpretation'] },
    { key: 'criteria', inputType: 'list', scope: 'task', visibility: 'default' },
    // --- Task Optional fields ---
    { key: 'compared_subjects', inputType: 'list', scope: 'task', visibility: 'optional' },
    { key: 'benchmark', inputType: 'textarea', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'assumptions', inputType: 'list', scope: 'universal', visibility: 'optional' },
    { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
    { key: 'detail_level', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
    { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
    { key: 'thinking_style', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
    { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
  ],
};
```

- [ ] **Step 2: Verify module compiles**

Run: `npx tsc --noEmit src/registry/task-types/analyze.ts`
Expected: No errors

- [ ] **Step 3: Commit**

---

### Task 4: Ideate Task Type Definition

**Files:**
- Create: `src/registry/task-types/ideate.ts`

- [ ] **Step 1: Create the Ideate task type module**

```typescript
// src/registry/task-types/ideate.ts
import type { TaskTemplate } from '../types';

export const ideateTemplate: TaskTemplate = {
  type: 'ideate',
  verb: { en: 'Ideate', zh: '构思' },
  mentalModel: { en: 'Help me think / design', zh: '帮我想办法' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'problem', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'current_state', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'goal', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'assumptions', inputType: 'list', scope: 'task', visibility: 'default' },
    // --- Task Optional fields ---
    { key: 'idea_count', inputType: 'number', scope: 'task', visibility: 'optional' },
    { key: 'evaluation_criteria', inputType: 'list', scope: 'task', visibility: 'optional' },
    { key: 'tradeoff_preference', inputType: 'text', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
    { key: 'detail_level', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
    { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
    { key: 'thinking_style', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
    { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
  ],
};
```

- [ ] **Step 2: Verify module compiles**

Run: `npx tsc --noEmit src/registry/task-types/ideate.ts`
Expected: No errors

- [ ] **Step 3: Commit**

---

### Task 5: Execute Task Type Definition

**Files:**
- Create: `src/registry/task-types/execute.ts`

- [ ] **Step 1: Create the Execute task type module**

```typescript
// src/registry/task-types/execute.ts
import type { TaskTemplate } from '../types';

export const executeTemplate: TaskTemplate = {
  type: 'execute',
  verb: { en: 'Execute', zh: '执行' },
  mentalModel: { en: 'Do a multi-step task for me', zh: '帮我做一个多步骤任务' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'plan', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'goal', inputType: 'textarea', scope: 'task', visibility: 'default' },
    // --- Task Optional fields ---
    { key: 'tools_to_use', inputType: 'list', scope: 'task', visibility: 'optional' },
    { key: 'checkpoints', inputType: 'list', scope: 'task', visibility: 'optional' },
    { key: 'error_handling', inputType: 'textarea', scope: 'task', visibility: 'optional' },
    { key: 'success_criteria', inputType: 'list', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'assumptions', inputType: 'list', scope: 'universal', visibility: 'optional' },
    { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
    { key: 'detail_level', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
    { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
    { key: 'thinking_style', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
    { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
  ],
};
```

- [ ] **Step 2: Verify module compiles**

Run: `npx tsc --noEmit src/registry/task-types/execute.ts`
Expected: No errors

- [ ] **Step 3: Commit**

---

### Task 6: Register All Task Types + Test Coverage

**Files:**
- Modify: `src/registry/template-registry.ts`
- Test: `tests/registry/all-task-types.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/registry/all-task-types.test.ts
import { describe, it, expect } from 'vitest';
import { getTemplate } from '../../src/registry/template-registry';
import type { TaskType, FieldDefinition } from '../../src/registry/types';

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
    // Every task type shares these universal defaults
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
    if (firstOptionalIndex === -1) return; // no optionals, skip
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/registry/all-task-types.test.ts`
Expected: FAIL — getTemplate('create') etc. return templates with empty field arrays

- [ ] **Step 3: Register all 5 new task types in the template registry**

Update `src/registry/template-registry.ts` to import and register the 5 new modules. The existing file registers task types in a map — add the new imports and entries:

```typescript
// Add these imports at the top of src/registry/template-registry.ts
import { createTemplate } from './task-types/create';
import { transformTemplate } from './task-types/transform';
import { analyzeTemplate } from './task-types/analyze';
import { ideateTemplate } from './task-types/ideate';
import { executeTemplate } from './task-types/execute';

// In the templates map/array, replace the stub entries for create/transform/analyze/ideate/execute
// with the imported templates. The exact modification depends on Phase 1's registry structure —
// replace the stub objects (that have empty fields arrays) with the full template objects:
//   'create': createTemplate,
//   'transform': transformTemplate,
//   'analyze': analyzeTemplate,
//   'ideate': ideateTemplate,
//   'execute': executeTemplate,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/registry/all-task-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

---

### Task 7: FieldLabel Component

**Files:**
- Create: `src/components/editor/FieldLabel.tsx`

- [ ] **Step 1: Create the FieldLabel component**

This is a pure UI/styling component — visual verification applies.

```tsx
// src/components/editor/FieldLabel.tsx
import type { InputType } from '../../registry/types';

const OPERATION_HINTS: Record<InputType, string> = {
  textarea: 'Enter text freely',
  text: 'Enter text freely',
  select: 'Click to select one',
  combo: 'Select or type custom',
  list: 'Add items to list',
  toggle: 'Toggle on/off',
  number: 'Click +/− or type number',
  'key-value': 'Add key-value pairs',
};

interface FieldLabelProps {
  fieldKey: string;
  inputType: InputType;
}

export function FieldLabel({ fieldKey, inputType }: FieldLabelProps) {
  const hint = OPERATION_HINTS[inputType];
  const displayName = fieldKey.replace(/_/g, ' ');

  return (
    <div className="flex items-center gap-1 mb-1.5">
      <span
        className="text-xs uppercase font-semibold tracking-wide"
        style={{ color: '#999999', letterSpacing: '0.5px' }}
      >
        {displayName}
      </span>
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium flex-shrink-0"
        style={{ backgroundColor: '#f5f3ef', color: '#999999' }}
        aria-label={`Help for ${displayName}`}
      >
        ?
      </span>
      <span
        className="text-xs ml-1"
        style={{ color: '#bbbbbb' }}
      >
        {hint}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Visually confirm: The label renders as "FIELD NAME [?] operation hint" with correct sizing and colors. (Integration into fields happens in Task 8.)

- [ ] **Step 3: Commit**

---

### Task 8: Integrate FieldLabel into Existing Field Components

**Files:**
- Modify: `src/components/editor/IntentField.tsx`
- Modify: `src/components/editor/fields/TextareaField.tsx`
- Modify: `src/components/editor/fields/TextField.tsx`

- [ ] **Step 1: Update IntentField to use FieldLabel**

In `src/components/editor/IntentField.tsx`, import and render `FieldLabel` in the label area. IntentField already has elevated styling — insert `FieldLabel` where the current label text is:

```tsx
// At the top of IntentField.tsx, add:
import { FieldLabel } from './FieldLabel';

// Replace the existing label rendering with:
<FieldLabel fieldKey="intent" inputType="textarea" />
```

Remove any existing inline label markup that FieldLabel replaces. Keep the elevated golden border, box shadow, and AI Fill button positioning intact.

- [ ] **Step 2: Update TextareaField to use FieldLabel**

In `src/components/editor/fields/TextareaField.tsx`, import and render `FieldLabel`:

```tsx
// At the top of TextareaField.tsx, add:
import { FieldLabel } from '../FieldLabel';

// In the component render, replace any existing label with:
// <FieldLabel fieldKey={field.key} inputType="textarea" />
// before the <textarea> element
```

The component receives a `field: FieldDefinition` prop (or equivalent from Phase 1). Use `field.key` for the fieldKey prop and `field.inputType` for the inputType prop.

- [ ] **Step 3: Update TextField to use FieldLabel**

In `src/components/editor/fields/TextField.tsx`, apply the same pattern:

```tsx
// At the top of TextField.tsx, add:
import { FieldLabel } from '../FieldLabel';

// In the component render, replace any existing label with:
// <FieldLabel fieldKey={field.key} inputType="text" />
// before the <input> element
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Select Ask task type. Verify all fields show the label pattern: FIELD_NAME [?] operation hint.

- [ ] **Step 5: Commit**

---

### Task 9: SelectField Component

**Files:**
- Create: `src/components/editor/fields/SelectField.tsx`
- Test: `tests/components/SelectField.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/SelectField.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from '../../src/components/editor/fields/SelectField';

describe('SelectField', () => {
  const defaultProps = {
    field: {
      key: 'question_type',
      inputType: 'select' as const,
      scope: 'task' as const,
      visibility: 'default' as const,
      options: ['factual', 'conceptual', 'how-to', 'opinion'],
    },
    value: '',
    onChange: vi.fn(),
  };

  it('renders all options as pill buttons', () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText('factual')).toBeInTheDocument();
    expect(screen.getByText('conceptual')).toBeInTheDocument();
    expect(screen.getByText('how-to')).toBeInTheDocument();
    expect(screen.getByText('opinion')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<SelectField {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('conceptual'));
    expect(onChange).toHaveBeenCalledWith('conceptual');
  });

  it('highlights the selected option', () => {
    render(<SelectField {...defaultProps} value="how-to" />);
    const selected = screen.getByText('how-to');
    // Selected pill should have font-semibold class
    expect(selected.closest('button')).toHaveClass('font-semibold');
  });

  it('deselects when clicking the already-selected option', () => {
    const onChange = vi.fn();
    render(<SelectField {...defaultProps} value="factual" onChange={onChange} />);
    fireEvent.click(screen.getByText('factual'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders the field label', () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText(/question type/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/SelectField.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the SelectField component**

```tsx
// src/components/editor/fields/SelectField.tsx
import { FieldLabel } from '../FieldLabel';
import type { FieldDefinition } from '../../../registry/types';

interface SelectFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function SelectField({ field, value, onChange }: SelectFieldProps) {
  const options = field.options ?? [];

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="select" />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(isSelected ? '' : option)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isSelected
                  ? 'font-semibold'
                  : ''
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: '#fff3cd',
                      color: '#1a1a1a',
                      border: '1.5px solid #f5c518',
                      fontWeight: 600,
                    }
                  : {
                      backgroundColor: '#ffffff',
                      color: '#999999',
                      border: '1px solid #e8e2d8',
                    }
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/SelectField.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

---

### Task 10: ComboField Component

**Files:**
- Create: `src/components/editor/fields/ComboField.tsx`

- [ ] **Step 1: Create the ComboField component**

This component has coupled UI behavior (pill selection clears text input, text input clears pill selection) — visual verification is the primary approach.

```tsx
// src/components/editor/fields/ComboField.tsx
import { useState, useEffect } from 'react';
import { FieldLabel } from '../FieldLabel';
import type { FieldDefinition } from '../../../registry/types';

interface ComboFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function ComboField({ field, value, onChange }: ComboFieldProps) {
  const options = field.options ?? [];
  const isOptionSelected = options.includes(value);
  const [customText, setCustomText] = useState(isOptionSelected ? '' : value);

  useEffect(() => {
    if (options.includes(value)) {
      setCustomText('');
    } else {
      setCustomText(value);
    }
  }, [value, options]);

  const handlePillClick = (option: string) => {
    if (value === option) {
      onChange('');
    } else {
      onChange(option);
    }
  };

  const handleTextChange = (text: string) => {
    setCustomText(text);
    onChange(text);
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="combo" />
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid #e8e2d8' }}
      >
        {/* Pills section */}
        <div className="flex flex-wrap gap-2 p-2">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handlePillClick(option)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isSelected ? 'font-semibold' : ''
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: '#fff3cd',
                        color: '#1a1a1a',
                        border: '1.5px solid #f5c518',
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: '#ffffff',
                        color: '#999999',
                        border: '1px solid #e8e2d8',
                      }
                }
              >
                {option}
              </button>
            );
          })}
        </div>
        {/* Divider */}
        <div style={{ borderTop: '1px solid #f0ebe4' }} />
        {/* Text input section */}
        <input
          type="text"
          value={customText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="or type custom value..."
          className="w-full px-3 py-2 text-sm border-0 outline-none"
          style={{
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Verify: The combo field renders pills on top, divider, text input below. Selecting a pill clears the text input. Typing in the text input deselects any pill. Both update the field value correctly.

- [ ] **Step 3: Commit**

---

### Task 11: ListField Component

**Files:**
- Create: `src/components/editor/fields/ListField.tsx`
- Test: `tests/components/ListField.test.tsx`

- [ ] **Step 1: Install @dnd-kit dependencies**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] **Step 2: Write the failing test**

```tsx
// tests/components/ListField.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListField } from '../../src/components/editor/fields/ListField';

describe('ListField', () => {
  const defaultProps = {
    field: {
      key: 'requirements',
      inputType: 'list' as const,
      scope: 'universal' as const,
      visibility: 'default' as const,
    },
    value: ['item one', 'item two'],
    onChange: vi.fn(),
  };

  it('renders existing items', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByDisplayValue('item one')).toBeInTheDocument();
    expect(screen.getByDisplayValue('item two')).toBeInTheDocument();
  });

  it('renders the add item row', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByPlaceholderText('Add item...')).toBeInTheDocument();
  });

  it('adds an item when typing in the add row and pressing Enter', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    const addInput = screen.getByPlaceholderText('Add item...');
    fireEvent.change(addInput, { target: { value: 'new item' } });
    fireEvent.keyDown(addInput, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['item one', 'item two', 'new item']);
  });

  it('removes an item when delete button is clicked', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    const deleteButtons = screen.getAllByLabelText('Delete item');
    fireEvent.click(deleteButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['item two']);
  });

  it('updates an item when its text is edited', () => {
    const onChange = vi.fn();
    render(<ListField {...defaultProps} onChange={onChange} />);
    const input = screen.getByDisplayValue('item one');
    fireEvent.change(input, { target: { value: 'edited item' } });
    expect(onChange).toHaveBeenCalledWith(['edited item', 'item two']);
  });

  it('renders the field label', () => {
    render(<ListField {...defaultProps} />);
    expect(screen.getByText(/requirements/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/components/ListField.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 4: Write the ListField component**

```tsx
// src/components/editor/fields/ListField.tsx
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FieldLabel } from '../FieldLabel';
import type { FieldDefinition } from '../../../registry/types';

interface ListFieldProps {
  field: FieldDefinition;
  value: string[];
  onChange: (value: string[]) => void;
}

interface SortableItemProps {
  id: string;
  index: number;
  text: string;
  onUpdate: (index: number, text: string) => void;
  onDelete: (index: number) => void;
}

function SortableItem({ id, index, text, onUpdate, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-sm select-none flex-shrink-0"
        style={{ color: '#cccccc' }}
        aria-label="Drag handle"
      >
        ⠿
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => onUpdate(index, e.target.value)}
        className="flex-1 text-sm outline-none bg-transparent"
        style={{ color: '#1a1a1a' }}
      />
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="flex-shrink-0 text-sm transition-colors hover:text-red-500"
        style={{ color: '#cccccc' }}
        aria-label="Delete item"
      >
        ✕
      </button>
    </div>
  );
}

export function ListField({ field, value, onChange }: ListFieldProps) {
  const [newItem, setNewItem] = useState('');
  const items = value.map((text, i) => ({ id: `item-${i}`, text }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(value, oldIndex, newIndex);
      onChange(reordered);
    }
  };

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...value, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleUpdate = (index: number, text: string) => {
    const updated = [...value];
    updated[index] = text;
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="list" />
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e8e2d8' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && (
                  <div style={{ borderTop: '1px solid #f0ebe4' }} />
                )}
                <SortableItem
                  id={item.id}
                  index={index}
                  text={item.text}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
        {/* Add item row */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #f0ebe4' }} />
        )}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="text-sm flex-shrink-0" style={{ color: '#cccccc' }}>+</span>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add item..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: '#1a1a1a' }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/components/ListField.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

---

### Task 12: ToggleField Component

**Files:**
- Create: `src/components/editor/fields/ToggleField.tsx`

- [ ] **Step 1: Create the ToggleField component**

Pure UI/styling component — visual verification.

```tsx
// src/components/editor/fields/ToggleField.tsx
import { FieldLabel } from '../FieldLabel';
import type { FieldDefinition } from '../../../registry/types';

interface ToggleFieldProps {
  field: FieldDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleField({ field, value, onChange }: ToggleFieldProps) {
  const displayName = field.key.replace(/_/g, ' ');

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="toggle" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className="relative flex-shrink-0 rounded-full transition-colors duration-200"
          style={{
            width: '36px',
            height: '20px',
            backgroundColor: value ? '#f5c518' : 'transparent',
            border: value ? '1.5px solid #f5c518' : '1.5px solid #e8e2d8',
          }}
        >
          <span
            className="absolute top-[1px] rounded-full transition-transform duration-200"
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: value ? '#1a1a1a' : '#999999',
              transform: value ? 'translateX(17px)' : 'translateX(1px)',
            }}
          />
        </button>
        <span className="text-sm" style={{ color: '#555555' }}>
          {value ? 'Yes' : 'No'} — {displayName}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Verify: Toggle track is 36x20px. Off: muted circle on the left, border-default track. On: accent-primary track, ink-primary circle on the right. Clicking toggles state. Descriptive label appears to the right.

- [ ] **Step 3: Commit**

---

### Task 13: NumberField Component

**Files:**
- Create: `src/components/editor/fields/NumberField.tsx`

- [ ] **Step 1: Create the NumberField component**

Pure UI/styling component — visual verification.

```tsx
// src/components/editor/fields/NumberField.tsx
import { FieldLabel } from '../FieldLabel';
import type { FieldDefinition } from '../../../registry/types';

interface NumberFieldProps {
  field: FieldDefinition;
  value: number;
  onChange: (value: number) => void;
}

export function NumberField({ field, value, onChange }: NumberFieldProps) {
  const handleDecrement = () => {
    onChange(Math.max(0, value - 1));
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="number" />
      <div className="flex items-center gap-0">
        {/* Minus button */}
        <button
          type="button"
          onClick={handleDecrement}
          className="flex items-center justify-center w-9 h-9 rounded-l-lg text-lg transition-colors"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e2d8',
            color: '#999999',
          }}
        >
          −
        </button>
        {/* Value display / direct input */}
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleDirectInput}
          className="h-9 text-center text-sm font-semibold outline-none"
          style={{
            minWidth: '40px',
            width: '56px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e8e2d8',
            borderBottom: '1px solid #e8e2d8',
            borderLeft: 'none',
            borderRight: 'none',
            color: '#1a1a1a',
          }}
        />
        {/* Plus button */}
        <button
          type="button"
          onClick={handleIncrement}
          className="flex items-center justify-center w-9 h-9 rounded-r-lg text-lg transition-colors"
          style={{
            backgroundColor: '#1a1a1a',
            color: '#f5c518',
            border: '1px solid #1a1a1a',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Verify: Stepper renders [−] + value + [+]. Minus button is bg-surface with ink-muted. Plus button is ink-primary bg with accent-primary text. Value is centered, font-weight 600. Clicking +/- changes the number. Direct input works.

- [ ] **Step 3: Commit**

---

### Task 14: KeyValueField Component

**Files:**
- Create: `src/components/editor/fields/KeyValueField.tsx`

- [ ] **Step 1: Create the KeyValueField component**

Pure UI/styling component — visual verification.

```tsx
// src/components/editor/fields/KeyValueField.tsx
import { useState } from 'react';
import { FieldLabel } from '../FieldLabel';
import type { FieldDefinition } from '../../../registry/types';

export interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueFieldProps {
  field: FieldDefinition;
  value: KeyValuePair[];
  onChange: (value: KeyValuePair[]) => void;
}

export function KeyValueField({ field, value, onChange }: KeyValueFieldProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey.trim()) {
      onChange([...value, { key: newKey.trim(), value: newValue.trim() }]);
      setNewKey('');
      setNewValue('');
    }
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="key-value" />
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e8e2d8' }}>
        {/* Existing pairs */}
        {value.map((pair, index) => (
          <div key={index}>
            {index > 0 && (
              <div style={{ borderTop: '1px solid #f0ebe4' }} />
            )}
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded flex-shrink-0"
                style={{ backgroundColor: '#f5f3ef', color: '#1a1a1a' }}
              >
                {pair.key}
              </span>
              <span className="text-sm flex-1" style={{ color: '#1a1a1a' }}>
                {pair.value}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="flex-shrink-0 text-sm transition-colors hover:text-red-500"
                style={{ color: '#cccccc' }}
                aria-label="Delete pair"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {/* Add pair row */}
        {value.length > 0 && (
          <div style={{ borderTop: '1px solid #f0ebe4' }} />
        )}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="text-sm flex-shrink-0" style={{ color: '#cccccc' }}>+</span>
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="key"
            className="text-sm outline-none bg-transparent font-semibold"
            style={{ color: '#1a1a1a', width: '80px' }}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="value"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: '#1a1a1a' }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Verify: Pairs display as key badge + value text + delete button. New pair row shows "+" + key/value placeholders. Adding a pair via Enter appends it. Deleting a pair removes it.

- [ ] **Step 3: Commit**

---

### Task 15: Update FieldRenderer to Dispatch All Input Types

**Files:**
- Modify: `src/components/editor/FieldRenderer.tsx`

- [ ] **Step 1: Add imports and dispatch cases for all new field types**

Update `src/components/editor/FieldRenderer.tsx` to import and render the 6 new components:

```tsx
// Add these imports at the top of FieldRenderer.tsx:
import { SelectField } from './fields/SelectField';
import { ComboField } from './fields/ComboField';
import { ListField } from './fields/ListField';
import { ToggleField } from './fields/ToggleField';
import { NumberField } from './fields/NumberField';
import { KeyValueField } from './fields/KeyValueField';
import type { KeyValuePair } from './fields/KeyValueField';

// Replace the existing switch/if-else dispatch. The full dispatch should be:
// (Adapt to match Phase 1's FieldRenderer prop interface — the key idea is adding the 6 new cases)

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  switch (field.inputType) {
    case 'textarea':
      return <TextareaField field={field} value={value as string} onChange={onChange} />;
    case 'text':
      return <TextField field={field} value={value as string} onChange={onChange} />;
    case 'select':
      return <SelectField field={field} value={value as string} onChange={onChange} />;
    case 'combo':
      return <ComboField field={field} value={value as string} onChange={onChange} />;
    case 'list':
      return (
        <ListField
          field={field}
          value={(value as string[]) ?? []}
          onChange={onChange}
        />
      );
    case 'toggle':
      return (
        <ToggleField
          field={field}
          value={(value as boolean) ?? false}
          onChange={onChange}
        />
      );
    case 'number':
      return (
        <NumberField
          field={field}
          value={(value as number) ?? 0}
          onChange={onChange}
        />
      );
    case 'key-value':
      return (
        <KeyValueField
          field={field}
          value={(value as KeyValuePair[]) ?? []}
          onChange={onChange}
        />
      );
    default:
      return <TextField field={field} value={value as string} onChange={onChange} />;
  }
}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Select the Ask task type. Fields like `question_type` (select) should now render as pill buttons instead of a text input. Verify output_format (combo) renders correctly. Select Create — `key_points` (list), `content_type` (combo), `tone` (combo) should render with their proper components.

- [ ] **Step 3: Commit**

---

### Task 16: AddFieldPanel Component

**Files:**
- Create: `src/components/editor/AddFieldPanel.tsx`
- Test: `tests/components/AddFieldPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/AddFieldPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddFieldPanel } from '../../src/components/editor/AddFieldPanel';
import type { FieldDefinition } from '../../src/registry/types';

const taskOptionalFields: FieldDefinition[] = [
  { key: 'tech_stack', inputType: 'text', scope: 'task', visibility: 'optional' },
  { key: 'target_length', inputType: 'text', scope: 'task', visibility: 'optional' },
];

const universalOptionalFields: FieldDefinition[] = [
  { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
  { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
];

describe('AddFieldPanel', () => {
  const defaultProps = {
    taskOptionalFields,
    universalOptionalFields,
    onAddField: vi.fn(),
  };

  it('renders collapsed state with "+ Add Field" button', () => {
    render(<AddFieldPanel {...defaultProps} />);
    expect(screen.getByText('+ Add Field')).toBeInTheDocument();
  });

  it('expands when button is clicked', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Add Field'));
    expect(screen.getByText(/Recommended/)).toBeInTheDocument();
    expect(screen.getByText(/Others/)).toBeInTheDocument();
  });

  it('shows task optional fields under Recommended section', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Add Field'));
    expect(screen.getByText(/tech stack/i)).toBeInTheDocument();
    expect(screen.getByText(/target length/i)).toBeInTheDocument();
  });

  it('shows universal optional fields under Others section', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Add Field'));
    expect(screen.getByText(/^goal$/i)).toBeInTheDocument();
    expect(screen.getByText(/^role$/i)).toBeInTheDocument();
  });

  it('shows custom_fields section at the bottom', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Add Field'));
    expect(screen.getByText(/custom.fields/i)).toBeInTheDocument();
  });

  it('calls onAddField when a field "+" button is clicked', () => {
    const onAddField = vi.fn();
    render(<AddFieldPanel {...defaultProps} onAddField={onAddField} />);
    fireEvent.click(screen.getByText('+ Add Field'));
    // Find the add button for tech_stack
    const addButtons = screen.getAllByLabelText(/Add field/);
    fireEvent.click(addButtons[0]);
    expect(onAddField).toHaveBeenCalledWith(taskOptionalFields[0]);
  });

  it('collapses when clicking the header area again', () => {
    render(<AddFieldPanel {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Add Field'));
    expect(screen.getByText(/Recommended/)).toBeInTheDocument();
    // Click collapse button
    fireEvent.click(screen.getByText('− Collapse'));
    expect(screen.getByText('+ Add Field')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/AddFieldPanel.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the AddFieldPanel component**

```tsx
// src/components/editor/AddFieldPanel.tsx
import { useState } from 'react';
import type { FieldDefinition } from '../../registry/types';

/** Field descriptions used in the add panel — maps field key to a one-line description. */
const FIELD_DESCRIPTIONS: Record<string, string> = {
  // Task-specific fields
  tech_stack: 'Language, framework, libraries (code scenarios)',
  target_length: 'Expected length or scale',
  structure: 'Expected structure or outline',
  include_tests: 'Whether to include tests (code scenarios)',
  preserve: 'Information or characteristics that must be preserved',
  compared_subjects: 'Comparison items (supports multiple)',
  benchmark: 'Reference standard or baseline',
  idea_count: 'How many ideas or options to generate',
  evaluation_criteria: 'How to judge idea quality',
  tradeoff_preference: 'Trade-off preference (e.g., speed vs quality)',
  tools_to_use: 'Tools the agent must use in this task',
  checkpoints: 'Where to pause for confirmation',
  error_handling: 'Strategy when errors occur',
  success_criteria: 'How to determine task completion',
  knowledge_level: "User's existing knowledge on the topic",
  // Universal optional fields
  goal: 'Desired end state or outcome',
  role: 'Role the AI should assume',
  audience: 'Target audience for the output',
  assumptions: 'Premises AI should take as given',
  scope: 'Boundary of what to cover',
  priority: 'What matters most when trade-offs arise',
  output_language: 'Language the AI should respond in',
  detail_level: 'Summary / standard / in-depth',
  tone: 'Formal / casual / technical',
  thinking_style: 'Direct answer / step-by-step / pros-and-cons',
  examples: 'Reference examples',
  anti_examples: 'Counter-examples of what is not wanted',
  references: 'Specific sources or materials',
  custom_fields: 'User-defined key-value pairs',
};

interface AddFieldPanelProps {
  taskOptionalFields: FieldDefinition[];
  universalOptionalFields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
}

function FieldRow({
  field,
  onAdd,
}: {
  field: FieldDefinition;
  onAdd: () => void;
}) {
  const displayName = field.key.replace(/_/g, ' ');
  const description = FIELD_DESCRIPTIONS[field.key] ?? '';

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span
            className="text-sm font-medium"
            style={{ color: '#1a1a1a' }}
          >
            {displayName}
          </span>
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] flex-shrink-0"
            style={{ backgroundColor: '#f5f3ef', color: '#999999' }}
          >
            ?
          </span>
        </div>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex-shrink-0 ml-3 text-lg font-bold leading-none"
        style={{ color: '#f5c518' }}
        aria-label={`Add field ${displayName}`}
      >
        +
      </button>
    </div>
  );
}

export function AddFieldPanel({
  taskOptionalFields,
  universalOptionalFields,
  onAddField,
}: AddFieldPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out custom_fields from universal optional — it gets its own section
  const universalWithoutCustom = universalOptionalFields.filter(
    (f) => f.key !== 'custom_fields'
  );
  const customFieldDef = universalOptionalFields.find(
    (f) => f.key === 'custom_fields'
  );

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full py-3 text-sm font-semibold rounded-lg transition-colors"
        style={{
          backgroundColor: '#ffffff',
          border: '1.5px dashed #e8e2d8',
          color: '#1a1a1a',
        }}
      >
        + Add Field
      </button>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e8e2d8' }}>
      {/* Recommended section (task-scoped optional fields) */}
      {taskOptionalFields.length > 0 && (
        <>
          <div
            className="px-3 py-1.5 text-xs font-bold"
            style={{ backgroundColor: '#1a1a1a', color: '#f5c518' }}
          >
            ★ Recommended
          </div>
          {taskOptionalFields.map((field, index) => (
            <div key={field.key}>
              {index > 0 && <div style={{ borderTop: '1px solid #f0ebe4' }} />}
              <FieldRow field={field} onAdd={() => onAddField(field)} />
            </div>
          ))}
        </>
      )}

      {/* Others section (universal optional fields, excluding custom_fields) */}
      {universalWithoutCustom.length > 0 && (
        <>
          <div
            className="px-3 py-1.5 text-xs font-bold"
            style={{ backgroundColor: '#f5f3ef', color: '#999999' }}
          >
            Others
          </div>
          {universalWithoutCustom.map((field, index) => (
            <div key={field.key}>
              {index > 0 && <div style={{ borderTop: '1px solid #f0ebe4' }} />}
              <FieldRow field={field} onAdd={() => onAddField(field)} />
            </div>
          ))}
        </>
      )}

      {/* custom_fields section (always at bottom) */}
      {customFieldDef && (
        <>
          <div
            className="px-3 py-1.5 text-xs font-bold"
            style={{
              backgroundColor: '#fff8e1',
              borderTop: '1px solid #f0e6c8',
              color: '#1a1a1a',
            }}
          >
            custom_fields
          </div>
          <FieldRow
            field={customFieldDef}
            onAdd={() => onAddField(customFieldDef)}
          />
        </>
      )}

      {/* Collapse button */}
      <div style={{ borderTop: '1px solid #f0ebe4' }}>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="w-full py-2 text-xs font-medium transition-colors"
          style={{ color: '#999999' }}
        >
          − Collapse
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/AddFieldPanel.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

---

### Task 17: Integrate AddFieldPanel into EditorArea

**Files:**
- Modify: `src/components/editor/EditorArea.tsx`

- [ ] **Step 1: Add state management for active optional fields**

Update `src/components/editor/EditorArea.tsx` to track which optional fields have been added. Import AddFieldPanel and wire it:

```tsx
// Add these imports at the top of EditorArea.tsx:
import { useState, useEffect } from 'react';
import { AddFieldPanel } from './AddFieldPanel';
import type { FieldDefinition } from '../../registry/types';

// Inside the EditorArea component, add state for added optional fields:
const [addedFields, setAddedFields] = useState<FieldDefinition[]>([]);

// Derive which fields to show in the editor:
// 1. Default fields (visibility === 'default') — always shown
// 2. addedFields — user-added optional fields
// The template comes from the selected task type via the registry.

// Compute the remaining optional fields for the AddFieldPanel:
const allFields = template.fields;
const defaultFields = allFields.filter((f: FieldDefinition) => f.visibility === 'default');
const addedFieldKeys = new Set(addedFields.map((f: FieldDefinition) => f.key));

const remainingTaskOptional = allFields.filter(
  (f: FieldDefinition) =>
    f.visibility === 'optional' &&
    f.scope === 'task' &&
    !addedFieldKeys.has(f.key)
);
const remainingUniversalOptional = allFields.filter(
  (f: FieldDefinition) =>
    f.visibility === 'optional' &&
    f.scope === 'universal' &&
    !addedFieldKeys.has(f.key)
);

// Handler to add a field:
const handleAddField = (field: FieldDefinition) => {
  setAddedFields((prev) => [...prev, field]);
};

// The editor renders fields in this order:
// 1. IntentField (always first, extracted from defaultFields)
// 2. Remaining default fields (via FieldRenderer)
// 3. Added optional fields (via FieldRenderer)
// 4. AddFieldPanel (if there are remaining optional fields)
```

```tsx
// In the JSX return, after rendering default fields and added fields:
{(remainingTaskOptional.length > 0 ||
  remainingUniversalOptional.length > 0) && (
  <AddFieldPanel
    taskOptionalFields={remainingTaskOptional}
    universalOptionalFields={remainingUniversalOptional}
    onAddField={handleAddField}
  />
)}
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
Select Create. Verify: Default fields appear (intent, context, requirements, constraints, output_format, content_type, key_points, tone). Below them, the "+ Add Field" dashed button appears. Clicking it expands the panel showing "Recommended" (tech_stack, target_length, structure, include_tests) and "Others" (goal, role, audience, etc.). Clicking "+" on a field adds it to the editor above the panel.

- [ ] **Step 3: Commit**

---

### Task 18: Task-Switch Reset Logic

**Files:**
- Modify: `src/components/editor/EditorArea.tsx`

- [ ] **Step 1: Add task-switch reset effect**

When the selected task type changes, reset the editor state: clear field values and clear addedFields.

```tsx
// In EditorArea.tsx, add an effect that resets state when taskType changes:

// The taskType prop or state that tracks the selected task type:
// (Adapt to match Phase 1's prop/state naming)

useEffect(() => {
  // Reset all field values to empty
  setFieldValues({});
  // Reset added optional fields
  setAddedFields([]);
}, [selectedTaskType]);
// selectedTaskType is the current task type — replace with actual variable name from Phase 1
```

The `setFieldValues({})` call resets the form data object that stores all field values. If Phase 1 uses a different state shape (e.g., a Map or individual state variables), adapt accordingly — the key behavior is that all field values are cleared when the task type changes.

- [ ] **Step 2: Verify visually**

Run: `npm run dev`
1. Select Ask, fill in some fields.
2. Switch to Create — editor should reset to Create's defaults with empty values.
3. Switch to Ideate — should show Ideate's defaults (problem, current_state, goal, assumptions) with empty values.
4. The preview should clear when switching.

- [ ] **Step 3: Commit**

---

### Task 19: End-to-End Visual Verification of All Task Types

**Files:** (no new files — verification only)

- [ ] **Step 1: Verify Ask task type**

Run: `npm run dev`
Select Ask. Verify default fields: intent, context, requirements (list), constraints (list), output_format (combo with paragraph/list/table/code/step-by-step), question_type (select with factual/conceptual/how-to/opinion), audience (text).
Open Add Field panel: Recommended should show knowledge_level. Others should show goal, role, assumptions, scope, priority, output_language, detail_level, tone, thinking_style, examples, anti_examples, references, custom_fields.

- [ ] **Step 2: Verify Create task type**

Select Create. Verify default fields: intent, context, requirements (list), constraints (list), output_format (combo), content_type (combo with email/article/doc/code/script), key_points (list), tone (combo with formal/casual/technical/friendly).
Open Add Field panel: Recommended should show tech_stack, target_length, structure, include_tests. Others should show goal, role, audience, assumptions, scope, priority, output_language, detail_level, thinking_style, examples, anti_examples, references, custom_fields.

- [ ] **Step 3: Verify Transform task type**

Select Transform. Verify default fields: intent, context, requirements (list), constraints (list), output_format (combo), source_content (textarea), transform_type (select with summarize/translate/rewrite/simplify/format convert).
Open Add Field panel: Recommended should show preserve, target_length. Others should show goal, role, audience, assumptions, scope, priority, output_language, detail_level, tone, thinking_style, examples, anti_examples, references, custom_fields.

- [ ] **Step 4: Verify Analyze task type**

Select Analyze. Verify default fields: intent, context, requirements (list), constraints (list), output_format (combo), subject (textarea), analyze_type (select with evaluate/compare/data interpretation), criteria (list).
Open Add Field panel: Recommended should show compared_subjects, benchmark. Others should show goal, role, audience, assumptions, scope, priority, output_language, detail_level, tone, thinking_style, examples, anti_examples, references, custom_fields.

- [ ] **Step 5: Verify Ideate task type**

Select Ideate. Verify default fields: intent, context, requirements (list), constraints (list), output_format (combo), problem (textarea), current_state (textarea), goal (textarea — note: scoped as task, not universal), assumptions (list — scoped as task).
Open Add Field panel: Recommended should show idea_count, evaluation_criteria, tradeoff_preference. Others should show role, audience, scope, priority, output_language, detail_level, tone, thinking_style, examples, anti_examples, references, custom_fields.

- [ ] **Step 6: Verify Execute task type**

Select Execute. Verify default fields: intent, context, requirements (list), constraints (list), output_format (combo), plan (textarea), goal (textarea — scoped as task).
Open Add Field panel: Recommended should show tools_to_use, checkpoints, error_handling, success_criteria. Others should show role, audience, assumptions, scope, priority, output_language, detail_level, tone, thinking_style, examples, anti_examples, references, custom_fields.

- [ ] **Step 7: Verify compiled output**

For each task type, fill in a few fields and confirm: the Markdown preview updates in real-time, field ordering matches importance order (intent first, then task-specific defaults, then universal defaults, then optionals), and empty fields are omitted.

- [ ] **Step 8: Commit**

Final commit for Phase 2. Run all tests before committing:

Run: `npx vitest run`
Expected: All tests pass (template-registry, compiler, markdown, all-task-types, SelectField, ListField, AddFieldPanel).

---

## Summary

| # | Task | Type | Approach |
|---|------|------|----------|
| 1 | Create task type definition | Create file | Type-check |
| 2 | Transform task type definition | Create file | Type-check |
| 3 | Analyze task type definition | Create file | Type-check |
| 4 | Ideate task type definition | Create file | Type-check |
| 5 | Execute task type definition | Create file | Type-check |
| 6 | Register all task types + tests | Modify + Test | TDD |
| 7 | FieldLabel component | Create file | Visual |
| 8 | Integrate FieldLabel into existing fields | Modify files | Visual |
| 9 | SelectField component | Create + Test | TDD |
| 10 | ComboField component | Create file | Visual |
| 11 | ListField component | Create + Test | TDD |
| 12 | ToggleField component | Create file | Visual |
| 13 | NumberField component | Create file | Visual |
| 14 | KeyValueField component | Create file | Visual |
| 15 | Update FieldRenderer dispatch | Modify file | Visual |
| 16 | AddFieldPanel component | Create + Test | TDD |
| 17 | Integrate AddFieldPanel into EditorArea | Modify file | Visual |
| 18 | Task-switch reset logic | Modify file | Visual |
| 19 | End-to-end visual verification | None | Visual |
