# Phase 1: Project Setup + Single-Task Compile Loop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the entire project and deliver the thinnest possible end-to-end compile loop — a user selects Ask, fills fields, sees live Markdown preview, and copies the result.

**Architecture:** Pure frontend SPA with no backend. The Template Registry defines task type schemas and field configurations. The Compiler engine receives field data and produces ordered output through a pluggable Formatter interface. The editor and preview are connected via React state, updating in real-time.

**Tech Stack:** Vite + React 18 + TypeScript, Tailwind CSS v3 + shadcn/ui, Vitest + React Testing Library + jsdom

---

## File Structure

All files created in this phase:

```
index.html                              # Vite entry HTML
vite.config.ts                          # Vite configuration
tsconfig.json                           # Root TypeScript config (references)
tsconfig.app.json                       # App TypeScript config
tsconfig.node.json                      # Node TypeScript config (vite.config)
tailwind.config.ts                      # Tailwind with custom design tokens
postcss.config.js                       # PostCSS for Tailwind
package.json                            # Dependencies and scripts
components.json                         # shadcn/ui configuration
src/
├── main.tsx                            # React DOM entry point
├── App.tsx                             # Root component: state + layout composition
├── index.css                           # Tailwind directives + global styles
├── lib/utils.ts                        # cn() utility for Tailwind class merging
├── components/
│   ├── ui/button.tsx                   # shadcn Button component
│   ├── layout/TopBar.tsx               # Fixed top bar with logo + placeholder nav
│   ├── layout/PageLayout.tsx           # Full page layout: top bar + selector + split
│   ├── task-selector/TaskSelector.tsx  # Grid of 6 task cards
│   ├── task-selector/TaskCard.tsx      # Single task card with states
│   ├── editor/EditorArea.tsx           # Left panel: intent + fields
│   ├── editor/IntentField.tsx          # Elevated intent textarea
│   ├── editor/FieldRenderer.tsx        # Routes field defs to input components
│   ├── editor/fields/TextareaField.tsx # Multi-line auto-expanding textarea
│   ├── editor/fields/TextField.tsx     # Single-line text input
│   ├── preview/PreviewArea.tsx         # Right panel: monospace preview
│   └── preview/CopyButton.tsx         # Copy to clipboard with states
├── registry/
│   ├── types.ts                        # Core shared types: TaskType, FieldDefinition, etc.
│   ├── template-registry.ts            # Registry: getTemplate(), getAllTaskTypes()
│   └── task-types/ask.ts              # Ask task type field definitions
├── compiler/
│   ├── types.ts                        # Compiler types: OrderedField, Formatter
│   └── compiler.ts                     # Compiler engine: order + filter fields
├── formatters/
│   ├── index.ts                        # Formatter barrel export
│   └── markdown.ts                     # Markdown formatter implementation
├── hooks/
│   ├── useCompiler.ts                  # Hook: field data -> compiled output
│   └── useClipboard.ts                # Hook: copy to clipboard with status
└── types/
    └── index.ts                        # App-wide type re-exports
tests/
├── setup.ts                            # Vitest setup with jsdom + RTL
├── registry/template-registry.test.ts  # Template registry tests
├── compiler/compiler.test.ts           # Compiler engine tests
└── formatters/markdown.test.ts         # Markdown formatter tests
```

---

### Task 1: Project Scaffolding — Vite + React + TypeScript

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Create Vite project**
```bash
cd /Users/simhuang/VSCodeProjects/IntentCompiler/.worktrees/clean-start
npm create vite@latest . -- --template react-ts
```
Select the current directory; this generates the default Vite + React + TS scaffold.

- [ ] **Step 2: Install dependencies**
```bash
npm install
```

- [ ] **Step 3: Verify dev server starts**
```bash
npm run dev
```
Expected: Vite dev server starts on localhost, default React page renders.

- [ ] **Step 4: Clean up default boilerplate**
Remove `src/App.css`, `src/assets/`, and the default counter content from `src/App.tsx`. Replace `src/App.tsx` with:
```tsx
function App() {
  return (
    <div className="min-h-screen">
      <h1>Intent Compiler</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src/main.tsx src/App.tsx src/vite-env.d.ts
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Tailwind CSS + shadcn/ui Setup

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/index.css`, `src/lib/utils.ts`, `components.json`

- [ ] **Step 1: Install Tailwind CSS**
```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

- [ ] **Step 2: Create `postcss.config.js`**
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 3: Create `src/index.css`** with Tailwind directives and custom design tokens
```css
@import "tailwindcss";

@theme {
  --color-bg-page: #fffdf5;
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f5f3ef;
  --color-bg-accent-light: #fff3cd;
  --color-bg-accent-warm: #fff8e1;
  --color-accent-primary: #f5c518;
  --color-accent-primary-shadow: rgba(245, 197, 24, 0.1);
  --color-ink-primary: #1a1a1a;
  --color-ink-secondary: #555555;
  --color-ink-muted: #999999;
  --color-ink-hint: #bbbbbb;
  --color-ink-disabled: #cccccc;
  --color-border-default: #e8e2d8;
  --color-border-light: #f0ebe4;
  --color-border-accent: #f0e6c8;
  --color-status-success: #44aa99;
  --color-status-danger: #ee5555;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

- [ ] **Step 4: Update `src/main.tsx`** to import the CSS
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Install shadcn/ui dependencies and initialize**
```bash
npm install tailwind-merge clsx class-variance-authority lucide-react
npx shadcn@latest init
```
When prompted: select "New York" style, default color, CSS variables yes.

- [ ] **Step 6: Create `src/lib/utils.ts`** (if not created by shadcn init)
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Add shadcn Button component**
```bash
npx shadcn@latest add button
```

- [ ] **Step 8: Verify Tailwind works** — Update `src/App.tsx`:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-bg-page">
      <h1 className="text-xl font-extrabold text-ink-primary p-5">
        Intent Compiler
      </h1>
    </div>
  );
}

export default App;
```
Run `npm run dev` and verify the golden/warm page background and styled heading render.

- [ ] **Step 9: Commit**
```bash
git add tailwind.config.ts postcss.config.js src/index.css src/lib/utils.ts components.json src/main.tsx src/App.tsx src/components/ui/
git commit -m "feat: configure Tailwind CSS with design tokens and shadcn/ui"
```

---

### Task 3: Vitest + Testing Setup

**Files:**
- Create: `tests/setup.ts`
- Modify: `vite.config.ts`, `package.json`

- [ ] **Step 1: Install testing dependencies**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

- [ ] **Step 2: Create `tests/setup.ts`**
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Update `vite.config.ts`** to include Vitest config
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
  },
});
```

- [ ] **Step 4: Add test script to `package.json`**
Ensure `package.json` has:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Verify Vitest runs** (no tests yet, should exit cleanly)
```bash
npx vitest run
```
Expected: "No test files found" or clean exit.

- [ ] **Step 6: Commit**
```bash
git add vite.config.ts tests/setup.ts package.json package-lock.json
git commit -m "chore: configure Vitest with jsdom and React Testing Library"
```

---

### Task 4: Core Shared Types

**Files:**
- Create: `src/registry/types.ts`, `src/compiler/types.ts`, `src/types/index.ts`

- [ ] **Step 1: Create `src/registry/types.ts`**
```ts
export type InputType =
  | 'textarea'
  | 'text'
  | 'select'
  | 'combo'
  | 'list'
  | 'toggle'
  | 'number'
  | 'key-value';

export type TaskType =
  | 'ask'
  | 'create'
  | 'transform'
  | 'analyze'
  | 'ideate'
  | 'execute';

export type FieldScope = 'universal' | 'task';

export type FieldVisibility = 'default' | 'optional';

export interface FieldDefinition {
  key: string;
  inputType: InputType;
  scope: FieldScope;
  visibility: FieldVisibility;
  options?: string[];
  required?: boolean;
}

export interface TaskTemplate {
  type: TaskType;
  verb: { en: string; zh: string };
  mentalModel: { en: string; zh: string };
  fields: FieldDefinition[];
}
```

- [ ] **Step 2: Create `src/compiler/types.ts`**
```ts
export type OutputFormat = 'markdown' | 'json' | 'yaml' | 'xml';

export type Language = 'en' | 'zh';

export interface OrderedField {
  key: string;
  label: string;
  value: unknown;
}

export interface Formatter {
  format(fields: OrderedField[]): string;
}
```

- [ ] **Step 3: Create `src/types/index.ts`** as a barrel re-export
```ts
export type {
  InputType,
  TaskType,
  FieldScope,
  FieldVisibility,
  FieldDefinition,
  TaskTemplate,
} from '@/registry/types';

export type {
  OutputFormat,
  Language,
  OrderedField,
  Formatter,
} from '@/compiler/types';
```

- [ ] **Step 4: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**
```bash
git add src/registry/types.ts src/compiler/types.ts src/types/index.ts
git commit -m "feat: define core shared types for registry and compiler"
```

---

### Task 5: Template Registry — Ask Task Type

**Files:**
- Create: `src/registry/task-types/ask.ts`, `src/registry/template-registry.ts`
- Test: `tests/registry/template-registry.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/registry/template-registry.test.ts`
```ts
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
    expect(template).toBeDefined();
    expect(template!.type).toBe('ask');

    const defaultFields = template!.fields.filter(
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
    const intent = template!.fields.find((f) => f.key === 'intent');
    expect(intent).toBeDefined();
    expect(intent!.required).toBe(true);
    expect(intent!.inputType).toBe('textarea');
    expect(intent!.scope).toBe('universal');
  });

  it('returns correct input types for Ask fields', () => {
    const template = getTemplate('ask');
    const fieldMap = new Map(
      template!.fields.map((f) => [f.key, f])
    );

    expect(fieldMap.get('context')!.inputType).toBe('textarea');
    expect(fieldMap.get('requirements')!.inputType).toBe('list');
    expect(fieldMap.get('constraints')!.inputType).toBe('list');
    expect(fieldMap.get('output_format')!.inputType).toBe('combo');
    expect(fieldMap.get('question_type')!.inputType).toBe('select');
    expect(fieldMap.get('audience')!.inputType).toBe('text');
  });

  it('returns undefined for non-ask templates (not yet implemented)', () => {
    const template = getTemplate('create');
    expect(template).toBeDefined();
    expect(template!.type).toBe('create');
    // Create has no fields yet — only verb/mental model
    expect(template!.fields).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/registry/template-registry.test.ts
```
Expected: FAIL — cannot resolve `@/registry/template-registry`.

- [ ] **Step 3: Create `src/registry/task-types/ask.ts`**
```ts
import type { FieldDefinition } from '@/registry/types';

export const askFields: FieldDefinition[] = [
  {
    key: 'intent',
    inputType: 'textarea',
    scope: 'universal',
    visibility: 'default',
    required: true,
  },
  {
    key: 'context',
    inputType: 'textarea',
    scope: 'universal',
    visibility: 'default',
  },
  {
    key: 'requirements',
    inputType: 'list',
    scope: 'universal',
    visibility: 'default',
  },
  {
    key: 'constraints',
    inputType: 'list',
    scope: 'universal',
    visibility: 'default',
  },
  {
    key: 'output_format',
    inputType: 'combo',
    scope: 'universal',
    visibility: 'default',
    options: ['paragraph', 'list', 'table', 'code', 'step-by-step'],
  },
  {
    key: 'question_type',
    inputType: 'select',
    scope: 'task',
    visibility: 'default',
    options: ['factual', 'conceptual', 'how-to', 'opinion'],
  },
  {
    key: 'audience',
    inputType: 'text',
    scope: 'task',
    visibility: 'default',
  },
];
```

- [ ] **Step 4: Create `src/registry/template-registry.ts`**
```ts
import type { TaskTemplate, TaskType } from '@/registry/types';
import { askFields } from '@/registry/task-types/ask';

const templates: TaskTemplate[] = [
  {
    type: 'ask',
    verb: { en: 'Ask', zh: '提问' },
    mentalModel: { en: 'I want to know something', zh: '我想知道一件事' },
    fields: askFields,
  },
  {
    type: 'create',
    verb: { en: 'Create', zh: '创作' },
    mentalModel: { en: 'I want to make something', zh: '我想做出一样东西' },
    fields: [],
  },
  {
    type: 'transform',
    verb: { en: 'Transform', zh: '转化' },
    mentalModel: {
      en: 'I have content, change its form',
      zh: '我有内容，换一种形式',
    },
    fields: [],
  },
  {
    type: 'analyze',
    verb: { en: 'Analyze', zh: '分析' },
    mentalModel: {
      en: 'Help me judge / understand',
      zh: '帮我判断/理解',
    },
    fields: [],
  },
  {
    type: 'ideate',
    verb: { en: 'Ideate', zh: '构思' },
    mentalModel: { en: 'Help me think / design', zh: '帮我想办法' },
    fields: [],
  },
  {
    type: 'execute',
    verb: { en: 'Execute', zh: '执行' },
    mentalModel: {
      en: 'Do a multi-step task for me',
      zh: '帮我做一个多步骤任务',
    },
    fields: [],
  },
];

export function getTemplate(type: TaskType): TaskTemplate | undefined {
  return templates.find((t) => t.type === type);
}

export function getAllTaskTypes(): TaskTemplate[] {
  return templates;
}
```

- [ ] **Step 5: Run test to verify it passes**
```bash
npx vitest run tests/registry/template-registry.test.ts
```
Expected: PASS — all 4 tests pass.

- [ ] **Step 6: Commit**
```bash
git add src/registry/task-types/ask.ts src/registry/template-registry.ts tests/registry/template-registry.test.ts
git commit -m "feat: implement template registry with Ask task type fields"
```

---

### Task 6: Compiler Engine

**Files:**
- Create: `src/compiler/compiler.ts`
- Test: `tests/compiler/compiler.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/compiler/compiler.test.ts`
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/compiler/compiler.test.ts
```
Expected: FAIL — cannot resolve `@/compiler/compiler`.

- [ ] **Step 3: Write implementation** — `src/compiler/compiler.ts`
```ts
import type { FieldDefinition } from '@/registry/types';
import type { OrderedField } from '@/compiler/types';

/**
 * Convert a snake_case key to a Title Case label.
 * e.g. "output_format" -> "Output Format"
 */
function keyToLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a field value is non-empty.
 */
function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Compile field data into ordered fields for formatting.
 * - Fields are ordered according to the field definitions order (intent first).
 * - Empty optional fields are omitted.
 */
export function compileFields(
  fieldDefinitions: FieldDefinition[],
  fieldValues: Record<string, unknown>,
): OrderedField[] {
  const result: OrderedField[] = [];

  for (const def of fieldDefinitions) {
    const value = fieldValues[def.key];
    if (!hasValue(value)) continue;

    result.push({
      key: def.key,
      label: keyToLabel(def.key),
      value,
    });
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npx vitest run tests/compiler/compiler.test.ts
```
Expected: PASS — all 5 tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/compiler/compiler.ts tests/compiler/compiler.test.ts
git commit -m "feat: implement compiler engine with field ordering and empty-field omission"
```

---

### Task 7: Markdown Formatter

**Files:**
- Create: `src/formatters/markdown.ts`, `src/formatters/index.ts`
- Test: `tests/formatters/markdown.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/formatters/markdown.test.ts`
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/formatters/markdown.test.ts
```
Expected: FAIL — cannot resolve `@/formatters/markdown`.

- [ ] **Step 3: Write implementation** — `src/formatters/markdown.ts`
```ts
import type { OrderedField, Formatter } from '@/compiler/types';

export class MarkdownFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) return '';

    return fields
      .map((field) => {
        const value =
          typeof field.value === 'string'
            ? field.value
            : String(field.value);
        return `# ${field.label}\n${value}`;
      })
      .join('\n\n');
  }
}
```

- [ ] **Step 4: Create `src/formatters/index.ts`**
```ts
import { MarkdownFormatter } from '@/formatters/markdown';
import type { Formatter, OutputFormat } from '@/compiler/types';

const formatters: Record<string, Formatter> = {
  markdown: new MarkdownFormatter(),
};

export function getFormatter(format: OutputFormat): Formatter {
  const formatter = formatters[format];
  if (!formatter) {
    throw new Error(`Formatter not implemented: ${format}`);
  }
  return formatter;
}

export { MarkdownFormatter } from '@/formatters/markdown';
```

- [ ] **Step 5: Run test to verify it passes**
```bash
npx vitest run tests/formatters/markdown.test.ts
```
Expected: PASS — all 5 tests pass.

- [ ] **Step 6: Commit**
```bash
git add src/formatters/markdown.ts src/formatters/index.ts tests/formatters/markdown.test.ts
git commit -m "feat: implement Markdown formatter with section headers and field ordering"
```

---

### Task 8: useCompiler Hook

**Files:**
- Create: `src/hooks/useCompiler.ts`

- [ ] **Step 1: Create `src/hooks/useCompiler.ts`**
```ts
import { useMemo } from 'react';
import type { FieldDefinition } from '@/registry/types';
import { compileFields } from '@/compiler/compiler';
import { getFormatter } from '@/formatters';
import type { OutputFormat } from '@/compiler/types';

export function useCompiler(
  fieldDefinitions: FieldDefinition[],
  fieldValues: Record<string, string>,
  format: OutputFormat = 'markdown',
) {
  const compiledOutput = useMemo(() => {
    const orderedFields = compileFields(fieldDefinitions, fieldValues);
    if (orderedFields.length === 0) return '';
    const formatter = getFormatter(format);
    return formatter.format(orderedFields);
  }, [fieldDefinitions, fieldValues, format]);

  const hasContent = compiledOutput.trim().length > 0;

  return { compiledOutput, hasContent };
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useCompiler.ts
git commit -m "feat: add useCompiler hook for reactive field compilation"
```

---

### Task 9: useClipboard Hook

**Files:**
- Create: `src/hooks/useClipboard.ts`

- [ ] **Step 1: Create `src/hooks/useClipboard.ts`**
```ts
import { useState, useCallback, useRef } from 'react';

type ClipboardStatus = 'idle' | 'success' | 'error';

export function useClipboard(resetDelay: number = 1500) {
  const [status, setStatus] = useState<ClipboardStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        await navigator.clipboard.writeText(text);
        setStatus('success');
      } catch {
        setStatus('error');
      }

      timeoutRef.current = setTimeout(() => {
        setStatus('idle');
        timeoutRef.current = null;
      }, resetDelay);
    },
    [resetDelay],
  );

  return { status, copy };
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useClipboard.ts
git commit -m "feat: add useClipboard hook with success/error states"
```

---

### Task 10: TopBar Component

**Files:**
- Create: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: Create `src/components/layout/TopBar.tsx`**
```tsx
export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border-default bg-bg-surface px-5 h-12">
      <h1
        className="text-xl font-extrabold text-ink-primary"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Intent Compiler
      </h1>

      <nav className="flex items-center gap-4">
        <button
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary cursor-not-allowed opacity-60"
          disabled
        >
          History
        </button>
        <button
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary cursor-not-allowed opacity-60"
          disabled
        >
          Settings
        </button>
        <div className="flex items-center rounded-sm border border-border-default text-sm">
          <span className="px-2 py-0.5 bg-ink-primary text-accent-primary font-medium rounded-l-sm">
            EN
          </span>
          <span className="px-2 py-0.5 text-ink-muted font-medium rounded-r-sm">
            中
          </span>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify visually** — Update `src/App.tsx` temporarily:
```tsx
import { TopBar } from '@/components/layout/TopBar';

function App() {
  return (
    <div className="min-h-screen bg-bg-page">
      <TopBar />
      <div className="pt-12 p-5">
        <p className="text-ink-secondary">Content area</p>
      </div>
    </div>
  );
}

export default App;
```
Run `npm run dev`. Expected: Fixed top bar with "Intent Compiler" logo on left, placeholder nav items on right, warm page background below.

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/TopBar.tsx src/App.tsx
git commit -m "feat: add TopBar component with logo and placeholder navigation"
```

---

### Task 11: TaskCard Component

**Files:**
- Create: `src/components/task-selector/TaskCard.tsx`

- [ ] **Step 1: Create `src/components/task-selector/TaskCard.tsx`**
```tsx
import { cn } from '@/lib/utils';
import type { TaskType } from '@/registry/types';

interface TaskCardProps {
  type: TaskType;
  verb: string;
  mentalModel: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TaskCard({
  verb,
  mentalModel,
  isSelected,
  onClick,
}: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start px-3 py-2 rounded-lg transition-colors text-left cursor-pointer',
        isSelected
          ? 'bg-ink-primary text-accent-primary border-2 border-accent-primary'
          : 'bg-bg-surface border-[1.5px] border-border-accent hover:bg-bg-accent-light',
      )}
    >
      <span
        className={cn(
          'text-base font-bold leading-tight',
          isSelected ? 'text-accent-primary' : 'text-ink-primary',
        )}
      >
        {verb}
      </span>
      <span
        className={cn(
          'text-xs leading-tight mt-0.5',
          isSelected ? 'text-accent-primary/70' : 'text-ink-muted',
        )}
      >
        {mentalModel}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Verify visually** — Temporarily render in `App.tsx`:
```tsx
import { TopBar } from '@/components/layout/TopBar';
import { TaskCard } from '@/components/task-selector/TaskCard';

function App() {
  return (
    <div className="min-h-screen bg-bg-page">
      <TopBar />
      <div className="pt-14 px-5 flex gap-3">
        <TaskCard
          type="ask"
          verb="Ask"
          mentalModel="I want to know something"
          isSelected={true}
          onClick={() => {}}
        />
        <TaskCard
          type="create"
          verb="Create"
          mentalModel="I want to make something"
          isSelected={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

export default App;
```
Run `npm run dev`. Expected: Two task cards — one selected (dark bg, gold text), one default (white bg, accent border, hover tints).

- [ ] **Step 3: Commit**
```bash
git add src/components/task-selector/TaskCard.tsx src/App.tsx
git commit -m "feat: add TaskCard component with default/selected/hover states"
```

---

### Task 12: TaskSelector Component

**Files:**
- Create: `src/components/task-selector/TaskSelector.tsx`

- [ ] **Step 1: Create `src/components/task-selector/TaskSelector.tsx`**
```tsx
import { TaskCard } from '@/components/task-selector/TaskCard';
import { getAllTaskTypes } from '@/registry/template-registry';
import type { TaskType } from '@/registry/types';

interface TaskSelectorProps {
  selectedType: TaskType | null;
  onSelect: (type: TaskType) => void;
}

export function TaskSelector({ selectedType, onSelect }: TaskSelectorProps) {
  const taskTypes = getAllTaskTypes();

  return (
    <div className="px-5 py-3">
      <div className="grid grid-cols-6 gap-2 min-[0px]:max-[1279px]:grid-cols-3">
        {taskTypes.map((tt) => (
          <TaskCard
            key={tt.type}
            type={tt.type}
            verb={tt.verb.en}
            mentalModel={tt.mentalModel.en}
            isSelected={selectedType === tt.type}
            onClick={() => onSelect(tt.type)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually** — Update `src/App.tsx`:
```tsx
import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { TaskSelector } from '@/components/task-selector/TaskSelector';
import type { TaskType } from '@/registry/types';

function App() {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);

  return (
    <div className="min-h-screen bg-bg-page">
      <TopBar />
      <div className="pt-12">
        <TaskSelector
          selectedType={selectedType}
          onSelect={setSelectedType}
        />
        <p className="px-5 text-ink-secondary text-sm">
          Selected: {selectedType ?? 'none'}
        </p>
      </div>
    </div>
  );
}

export default App;
```
Run `npm run dev`. Expected: 6 task cards in a row (or 3x2 on narrower screens). Clicking a card selects it with dark/gold styling; others stay default.

- [ ] **Step 3: Commit**
```bash
git add src/components/task-selector/TaskSelector.tsx src/App.tsx
git commit -m "feat: add TaskSelector with responsive grid of 6 task type cards"
```

---

### Task 13: TextareaField and TextField Components

**Files:**
- Create: `src/components/editor/fields/TextareaField.tsx`, `src/components/editor/fields/TextField.tsx`

- [ ] **Step 1: Create `src/components/editor/fields/TextareaField.tsx`**
```tsx
import { useCallback, useRef, useEffect } from 'react';

interface TextareaFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TextareaField({
  fieldKey,
  label,
  value,
  onChange,
  placeholder,
  minHeight = 36,
}: TextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [minHeight]);

  useEffect(() => {
    autoExpand();
  }, [value, autoExpand]);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldKey}
        className="text-xs uppercase text-ink-muted font-semibold tracking-wide"
      >
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoExpand}
        placeholder={placeholder}
        className="w-full bg-bg-surface border-[1.5px] border-border-default rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint resize-none focus:outline-none focus:border-accent-primary transition-colors"
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/editor/fields/TextField.tsx`**
```tsx
interface TextFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({
  fieldKey,
  label,
  value,
  onChange,
  placeholder,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldKey}
        className="text-xs uppercase text-ink-muted font-semibold tracking-wide"
      >
        {label}
      </label>
      <input
        type="text"
        id={fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border-[1.5px] border-border-default rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint focus:outline-none focus:border-accent-primary transition-colors"
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify visually** — Temporarily render in `App.tsx`:
```tsx
import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { TextareaField } from '@/components/editor/fields/TextareaField';
import { TextField } from '@/components/editor/fields/TextField';

function App() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  return (
    <div className="min-h-screen bg-bg-page">
      <TopBar />
      <div className="pt-14 px-5 max-w-md flex flex-col gap-3">
        <TextareaField
          fieldKey="context"
          label="Context"
          value={text1}
          onChange={setText1}
          placeholder="Enter text freely"
        />
        <TextField
          fieldKey="audience"
          label="Audience"
          value={text2}
          onChange={setText2}
          placeholder="Enter text freely"
        />
      </div>
    </div>
  );
}

export default App;
```
Run `npm run dev`. Expected: Textarea auto-expands as you type. Both fields have correct border/radius/padding. Labels are uppercase, muted.

- [ ] **Step 4: Commit**
```bash
git add src/components/editor/fields/TextareaField.tsx src/components/editor/fields/TextField.tsx src/App.tsx
git commit -m "feat: add TextareaField (auto-expand) and TextField input components"
```

---

### Task 14: IntentField Component

**Files:**
- Create: `src/components/editor/IntentField.tsx`

- [ ] **Step 1: Create `src/components/editor/IntentField.tsx`**
```tsx
import { useCallback, useRef, useEffect } from 'react';

interface IntentFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function IntentField({ value, onChange }: IntentFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const minHeight = 48;

  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, []);

  useEffect(() => {
    autoExpand();
  }, [value, autoExpand]);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="intent"
        className="text-xs uppercase text-ink-muted font-semibold tracking-wide"
      >
        Intent
      </label>
      <textarea
        ref={textareaRef}
        id="intent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoExpand}
        placeholder="What do you want to accomplish?"
        className="w-full bg-bg-surface border-2 border-accent-primary rounded-lg p-2 text-sm text-ink-primary placeholder:text-ink-hint resize-none focus:outline-none transition-colors"
        style={{
          minHeight: `${minHeight}px`,
          boxShadow: '0 0 0 4px var(--color-accent-primary-shadow)',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify visually** — Update `App.tsx` temporarily to include the IntentField:
```tsx
import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { IntentField } from '@/components/editor/IntentField';

function App() {
  const [intent, setIntent] = useState('');

  return (
    <div className="min-h-screen bg-bg-page">
      <TopBar />
      <div className="pt-14 px-5 max-w-md">
        <IntentField value={intent} onChange={setIntent} />
      </div>
    </div>
  );
}

export default App;
```
Run `npm run dev`. Expected: Intent field has 2px golden border, subtle golden box-shadow glow, 48px minimum height, auto-expands.

- [ ] **Step 3: Commit**
```bash
git add src/components/editor/IntentField.tsx src/App.tsx
git commit -m "feat: add IntentField with elevated golden border and shadow styling"
```

---

### Task 15: FieldRenderer Component

**Files:**
- Create: `src/components/editor/FieldRenderer.tsx`

- [ ] **Step 1: Create `src/components/editor/FieldRenderer.tsx`**
```tsx
import type { FieldDefinition } from '@/registry/types';
import { TextareaField } from '@/components/editor/fields/TextareaField';
import { TextField } from '@/components/editor/fields/TextField';

/**
 * Convert a snake_case key to a Title Case label.
 */
function keyToLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface FieldRendererProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const label = keyToLabel(field.key);

  // Phase 1: textarea and text are fully rendered.
  // select, combo, and list are rendered as temporary text/textarea fallbacks.
  switch (field.inputType) {
    case 'textarea':
      return (
        <TextareaField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter text freely"
        />
      );

    case 'text':
      return (
        <TextField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter text freely"
        />
      );

    case 'list':
      // Temporary: render as textarea (one item per line)
      return (
        <TextareaField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter items (one per line)"
        />
      );

    case 'select':
      // Temporary: render as text input
      return (
        <TextField
          fieldKey={field.key}
          label={`${label}${field.options ? ` (${field.options.join(' / ')})` : ''}`}
          value={value}
          onChange={onChange}
          placeholder={field.options ? field.options.join(', ') : 'Enter value'}
        />
      );

    case 'combo':
      // Temporary: render as text input with options hint
      return (
        <TextField
          fieldKey={field.key}
          label={`${label}${field.options ? ` (${field.options.join(' / ')})` : ''}`}
          value={value}
          onChange={onChange}
          placeholder={field.options ? `${field.options.join(', ')} or custom` : 'Select or type custom'}
        />
      );

    default:
      // Fallback for any other type
      return (
        <TextField
          fieldKey={field.key}
          label={label}
          value={value}
          onChange={onChange}
          placeholder="Enter value"
        />
      );
  }
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/components/editor/FieldRenderer.tsx
git commit -m "feat: add FieldRenderer to route field definitions to input components"
```

---

### Task 16: EditorArea Component

**Files:**
- Create: `src/components/editor/EditorArea.tsx`

- [ ] **Step 1: Create `src/components/editor/EditorArea.tsx`**
```tsx
import { IntentField } from '@/components/editor/IntentField';
import { FieldRenderer } from '@/components/editor/FieldRenderer';
import type { FieldDefinition } from '@/registry/types';

interface EditorAreaProps {
  fields: FieldDefinition[];
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}

export function EditorArea({
  fields,
  fieldValues,
  onFieldChange,
}: EditorAreaProps) {
  // Separate intent from other fields
  const intentField = fields.find((f) => f.key === 'intent');
  const otherFields = fields.filter(
    (f) => f.key !== 'intent' && f.visibility === 'default',
  );

  if (fields.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">
        Select a task type above to begin
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px] p-5 overflow-y-auto">
      {intentField && (
        <IntentField
          value={fieldValues['intent'] ?? ''}
          onChange={(v) => onFieldChange('intent', v)}
        />
      )}

      {otherFields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={fieldValues[field.key] ?? ''}
          onChange={(v) => onFieldChange(field.key, v)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/components/editor/EditorArea.tsx
git commit -m "feat: add EditorArea with intent field and dynamic field rendering"
```

---

### Task 17: PreviewArea Component

**Files:**
- Create: `src/components/preview/PreviewArea.tsx`

- [ ] **Step 1: Create `src/components/preview/PreviewArea.tsx`**
```tsx
import { CopyButton } from '@/components/preview/CopyButton';

interface PreviewAreaProps {
  compiledOutput: string;
  hasContent: boolean;
}

export function PreviewArea({ compiledOutput, hasContent }: PreviewAreaProps) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto bg-bg-surface border-[1.5px] border-border-default rounded-lg m-5 mb-0 p-4"
        style={{
          fontFamily: "'SF Mono', 'Cascadia Code', Consolas, monospace",
          fontSize: '14px',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
        }}
      >
        {hasContent ? (
          <pre className="text-ink-secondary whitespace-pre-wrap m-0 font-[inherit]">
            {compiledOutput}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">
            Select a task type and fill in fields to see the preview
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-5 py-3 border-t border-border-light">
        <CopyButton text={compiledOutput} disabled={!hasContent} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors (CopyButton will be created in the next task).

- [ ] **Step 3: Commit** (after CopyButton is created in next task)

---

### Task 18: CopyButton Component

**Files:**
- Create: `src/components/preview/CopyButton.tsx`

- [ ] **Step 1: Create `src/components/preview/CopyButton.tsx`**
```tsx
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  disabled: boolean;
}

export function CopyButton({ text, disabled }: CopyButtonProps) {
  const { status, copy } = useClipboard(1500);

  const handleClick = () => {
    if (!disabled) {
      copy(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full py-2.5 rounded-lg font-bold text-sm transition-all',
        disabled
          ? 'bg-accent-primary/40 text-ink-primary/40 cursor-not-allowed'
          : status === 'error'
            ? 'bg-status-danger text-white cursor-pointer'
            : 'bg-accent-primary text-ink-primary cursor-pointer hover:brightness-95 active:scale-[0.99]',
      )}
    >
      {status === 'success' && '\u2713 Copied!'}
      {status === 'error' && '\u2717 Copy failed'}
      {status === 'idle' && 'Copy to Clipboard'}
    </button>
  );
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit** — Include both PreviewArea and CopyButton:
```bash
git add src/components/preview/PreviewArea.tsx src/components/preview/CopyButton.tsx
git commit -m "feat: add PreviewArea with monospace rendering and CopyButton with states"
```

---

### Task 19: PageLayout Component

**Files:**
- Create: `src/components/layout/PageLayout.tsx`

- [ ] **Step 1: Create `src/components/layout/PageLayout.tsx`**
```tsx
import { TopBar } from '@/components/layout/TopBar';
import { TaskSelector } from '@/components/task-selector/TaskSelector';
import { EditorArea } from '@/components/editor/EditorArea';
import { PreviewArea } from '@/components/preview/PreviewArea';
import type { TaskType, FieldDefinition } from '@/registry/types';

interface PageLayoutProps {
  selectedType: TaskType | null;
  onSelectType: (type: TaskType) => void;
  fields: FieldDefinition[];
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  compiledOutput: string;
  hasContent: boolean;
}

export function PageLayout({
  selectedType,
  onSelectType,
  fields,
  fieldValues,
  onFieldChange,
  compiledOutput,
  hasContent,
}: PageLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-bg-page" style={{ minWidth: '1024px' }}>
      <TopBar />

      {/* Spacer for fixed top bar */}
      <div className="flex-shrink-0 h-12" />

      <TaskSelector selectedType={selectedType} onSelect={onSelectType} />

      {/* Editor + Preview split */}
      <div className="flex-1 flex min-h-0">
        {/* Editor (left 50%) */}
        <div className="w-1/2 overflow-y-auto">
          <EditorArea
            fields={fields}
            fieldValues={fieldValues}
            onFieldChange={onFieldChange}
          />
        </div>

        {/* Vertical divider */}
        <div className="w-[1.5px] bg-border-light flex-shrink-0" />

        {/* Preview (right 50%) */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          <PreviewArea
            compiledOutput={compiledOutput}
            hasContent={hasContent}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/PageLayout.tsx
git commit -m "feat: add PageLayout with fixed top bar, task selector, and 50/50 split"
```

---

### Task 20: Wire App.tsx — Full Compile Loop

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx`** to wire everything together
```tsx
import { useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { getTemplate } from '@/registry/template-registry';
import { useCompiler } from '@/hooks/useCompiler';
import type { TaskType, FieldDefinition } from '@/registry/types';

function App() {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Get the current template's field definitions
  const template = selectedType ? getTemplate(selectedType) : undefined;
  const fields: FieldDefinition[] = template?.fields ?? [];

  // Compile fields into preview output
  const { compiledOutput, hasContent } = useCompiler(
    fields,
    fieldValues,
    'markdown',
  );

  const handleSelectType = useCallback((type: TaskType) => {
    setSelectedType(type);
    setFieldValues({});
  }, []);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <PageLayout
      selectedType={selectedType}
      onSelectType={handleSelectType}
      fields={fields}
      fieldValues={fieldValues}
      onFieldChange={handleFieldChange}
      compiledOutput={compiledOutput}
      hasContent={hasContent}
    />
  );
}

export default App;
```

- [ ] **Step 2: Verify the full loop visually**

Run `npm run dev` and verify:
1. All 6 task type cards render in a row with correct styling.
2. Clicking "Ask" populates the editor with Intent (golden border/shadow) + 6 other fields.
3. Selecting any other task type shows the empty state ("Select a task type above to begin") since they have no fields.
4. Typing in Intent field updates the live preview immediately.
5. Filling multiple fields shows them all in the preview with `# Section` headers.
6. Empty fields are not shown in preview.
7. Copy to Clipboard works (success feedback for 1.5s).
8. Copy button is disabled when no content is in the preview.
9. Both panels scroll independently when content is long.

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: wire App.tsx with full compile loop — select, edit, preview, copy"
```

---

### Task 21: Empty State for Non-Ask Task Types

**Files:**
- Modify: `src/components/editor/EditorArea.tsx`

- [ ] **Step 1: Update `EditorArea` to handle non-Ask task types gracefully**

Update `src/components/editor/EditorArea.tsx`:
```tsx
import { IntentField } from '@/components/editor/IntentField';
import { FieldRenderer } from '@/components/editor/FieldRenderer';
import type { FieldDefinition, TaskType } from '@/registry/types';

interface EditorAreaProps {
  fields: FieldDefinition[];
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  selectedType?: TaskType | null;
}

export function EditorArea({
  fields,
  fieldValues,
  onFieldChange,
  selectedType,
}: EditorAreaProps) {
  // No task type selected
  if (!selectedType) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-ink-muted text-sm p-5">
        Select a task type above to begin
      </div>
    );
  }

  // Task type selected but no fields defined (coming soon)
  if (fields.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-ink-muted text-sm p-5 gap-2">
        <span className="text-2xl">🚧</span>
        <span>Coming soon</span>
      </div>
    );
  }

  // Separate intent from other fields
  const intentField = fields.find((f) => f.key === 'intent');
  const otherFields = fields.filter(
    (f) => f.key !== 'intent' && f.visibility === 'default',
  );

  return (
    <div className="flex flex-col gap-[10px] p-5 overflow-y-auto">
      {intentField && (
        <IntentField
          value={fieldValues['intent'] ?? ''}
          onChange={(v) => onFieldChange('intent', v)}
        />
      )}

      {otherFields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={fieldValues[field.key] ?? ''}
          onChange={(v) => onFieldChange(field.key, v)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Update `PageLayout` to pass `selectedType` to `EditorArea`**

In `src/components/layout/PageLayout.tsx`, update the `EditorArea` usage:
```tsx
<EditorArea
  fields={fields}
  fieldValues={fieldValues}
  onFieldChange={onFieldChange}
  selectedType={selectedType}
/>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Expected:
- No task selected: "Select a task type above to begin"
- Click Ask: editor populates with fields
- Click Create/Transform/Analyze/Ideate/Execute: shows "Coming soon" with construction emoji

- [ ] **Step 4: Commit**
```bash
git add src/components/editor/EditorArea.tsx src/components/layout/PageLayout.tsx
git commit -m "feat: add empty state and coming-soon state for non-Ask task types"
```

---

### Task 22: Load Plus Jakarta Sans Font

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Google Fonts link to `index.html`**

Add to the `<head>` of `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Set default font in `src/index.css`**

Add to the bottom of `src/index.css`:
```css
body {
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei',
    'Noto Sans SC', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: Verify visually** — Run `npm run dev`. Expected: All text renders in Plus Jakarta Sans (geometric, rounded letterforms). The logo in the top bar should be noticeably different from system default.

- [ ] **Step 4: Commit**
```bash
git add index.html src/index.css
git commit -m "feat: load Plus Jakarta Sans font for brand typography"
```

---

### Task 23: Run All Tests and Final Verification

**Files:** None new.

- [ ] **Step 1: Run all tests**
```bash
npx vitest run
```
Expected: All tests pass (template registry: 4 tests, compiler: 5 tests, markdown formatter: 5 tests).

- [ ] **Step 2: Run type check**
```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Run dev server for final visual check**
```bash
npm run dev
```

Verify all acceptance criteria:
1. Page layout: fixed top bar, task selector, 50/50 split with vertical divider.
2. All 6 task cards display with verb + mental model. Single row on wide screen, 3x2 on narrower.
3. Default/selected/hover states on task cards.
4. Ask populates editor with Intent (golden border + shadow) + 6 fields.
5. Other task types show "Coming soon".
6. Textarea auto-expands. Text inputs are single-line.
7. Live preview updates in real-time with `# Section` headers.
8. Field ordering: Intent first, then remaining fields in definition order.
9. Empty fields omitted from preview.
10. Copy to Clipboard shows success feedback (1.5s).
11. Copy button disabled when no content.
12. Both panels scroll independently.
13. Plus Jakarta Sans font renders everywhere.

- [ ] **Step 4: Build to verify production build works**
```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 5: Final commit** (only if any fixes were needed)
```bash
git add -A
git commit -m "fix: address final verification issues"
```
