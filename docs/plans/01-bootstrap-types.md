# Chunk 1: Project Bootstrap & Core IR Types

> Parent: [00-overview.md](00-overview.md)

## Task 1.1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Initialize Vite project**

```bash
npm create vite@latest . -- --template react-ts
```

> Note: Since the repo already has files, use `--template react-ts` and resolve any conflicts. Keep existing docs/, CLAUDE.md, etc.

- [ ] **Step 2: Verify dev server starts**

```bash
npm install && npm run dev
```

Expected: Dev server at http://localhost:5173 with default Vite React page.

- [ ] **Step 3: Commit scaffold**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src/ .gitignore
git commit -m "chore: scaffold Vite + React 19 + TypeScript project"
```

---

## Task 1.2: Configure Tailwind CSS + shadcn/ui

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/index.css`, `components.json`
- Modify: `package.json` (add deps)

- [ ] **Step 1: Install Tailwind CSS**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Configure Vite plugin for Tailwind**

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

- [ ] **Step 3: Set up base CSS**

`src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: TypeScript, default style, CSS variables, `@/` alias.

- [ ] **Step 5: Add essential shadcn components**

```bash
npx shadcn@latest add button card input label select textarea tabs badge separator tooltip scroll-area dialog dropdown-menu collapsible switch
```

- [ ] **Step 6: Verify Tailwind works**

Update `src/App.tsx` with a simple Tailwind-styled div, confirm styles render in browser.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure Tailwind CSS + shadcn/ui"
```

---

## Task 1.3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `src/core/ir/__tests__/smoke.test.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create Vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': '/src' },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Write smoke test**

`src/core/ir/__tests__/smoke.test.ts`:
```ts
describe('smoke test', () => {
  it('should run tests', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run test to verify setup**

```bash
npm test
```

Expected: 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/core/ir/__tests__/smoke.test.ts package.json
git commit -m "chore: configure Vitest test runner"
```

---

## Task 1.4: Define Intent IR TypeScript Types

**Files:**
- Create: `src/core/ir/types.ts`

- [ ] **Step 1: Define all IR types based on JSON Schema v0.2**

`src/core/ir/types.ts`:
```ts
/** Intent IR Schema v0.2 — canonical representation of a user's task intent */

export const SCHEMA_VERSION = '0.2' as const

export type TaskType =
  | 'production_evaluation'
  | 'mechanism_check'
  | 'problem_modeling'
  | 'quick_lookup'
  | 'code_generation'
  | 'comparison_decision'
  | 'open_exploration'
  | 'text_rewrite'

export type OutputFormat =
  | 'prose'
  | 'bullet_list'
  | 'numbered_list'
  | 'table'
  | 'code_block'
  | 'json'
  | 'markdown'

export type OutputLength = 'concise' | 'moderate' | 'detailed' | 'exhaustive'

export type Tone = 'formal' | 'casual' | 'technical' | 'instructional'

export type Verbosity = 'minimal' | 'balanced' | 'verbose'

export type Audience =
  | 'general'
  | 'technical'
  | 'senior_engineer'
  | 'manager'
  | 'non_technical'

export type SourceMode = 'manual' | 'ai_draft' | 'template'

export type CompileStatus = 'complete' | 'partial' | 'empty'

export type ConstraintPriority = 'must' | 'should' | 'nice_to_have'

export type ConstraintSource = 'user' | 'template' | 'ai'

/** Constraint can be a simple string or a detailed object */
export type ConstraintItem =
  | string
  | {
      text: string
      priority?: ConstraintPriority
      source?: ConstraintSource
    }

export interface IRContext {
  background?: string
  current_state?: string
  inputs?: string[]
  max_tokens?: number
  summary_strategy?: string
}

export interface IRConstraints {
  must_consider: ConstraintItem[]
  must_not: ConstraintItem[]
}

export interface IROutputSpec {
  format: OutputFormat
  shape: string[]
  length: OutputLength
}

export interface IRAnswerMode {
  production_aware?: boolean
  challenge_assumptions?: boolean
  recommend_first?: boolean
  explore_alternatives?: boolean
  step_by_step?: boolean
}

export interface IRStyle {
  tone: Tone
  verbosity: Verbosity
}

export interface IRMetadata {
  source_mode: SourceMode
  template_id?: string
  created_at: string
  compile_status: CompileStatus
}

/** The canonical Intent IR document */
export interface IntentIR {
  schema_version: typeof SCHEMA_VERSION
  task_type: TaskType
  objective: string
  context: IRContext
  constraints: IRConstraints
  output_spec: IROutputSpec
  answer_mode: IRAnswerMode
  style: IRStyle
  audience: Audience
  metadata: IRMetadata
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/core/ir/types.ts
git commit -m "feat: define Intent IR v0.2 TypeScript types"
```

---

## Task 1.5: Create IR Zod Schema for Runtime Validation

**Files:**
- Create: `src/core/ir/schema.ts`, `src/core/ir/__tests__/schema.test.ts`

- [ ] **Step 1: Install zod**

```bash
npm install zod
```

- [ ] **Step 2: Write failing test for schema validation**

`src/core/ir/__tests__/schema.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { intentIRSchema } from '../schema'
import type { IntentIR } from '../types'

const validIR: IntentIR = {
  schema_version: '0.2',
  task_type: 'code_generation',
  objective: 'Write a React component for user profile',
  context: {
    background: 'Building a SaaS dashboard',
    inputs: ['user data from API'],
  },
  constraints: {
    must_consider: ['TypeScript strict mode', { text: 'Accessible', priority: 'must' }],
    must_not: ['No class components'],
  },
  output_spec: {
    format: 'code_block',
    shape: ['component file', 'test file'],
    length: 'moderate',
  },
  answer_mode: {
    production_aware: true,
    step_by_step: true,
  },
  style: { tone: 'technical', verbosity: 'balanced' },
  audience: 'senior_engineer',
  metadata: {
    source_mode: 'manual',
    created_at: '2026-04-05T00:00:00Z',
    compile_status: 'complete',
  },
}

describe('intentIRSchema', () => {
  it('should accept a valid IR document', () => {
    const result = intentIRSchema.safeParse(validIR)
    expect(result.success).toBe(true)
  })

  it('should reject missing objective', () => {
    const invalid = { ...validIR, objective: '' }
    const result = intentIRSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject invalid task_type', () => {
    const invalid = { ...validIR, task_type: 'unknown_type' }
    const result = intentIRSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should accept constraint as string or object', () => {
    const withMixed = {
      ...validIR,
      constraints: {
        must_consider: ['simple string', { text: 'detailed', priority: 'should', source: 'user' }],
        must_not: [],
      },
    }
    const result = intentIRSchema.safeParse(withMixed)
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- src/core/ir/__tests__/schema.test.ts
```

Expected: FAIL — `../schema` module not found.

- [ ] **Step 4: Implement Zod schema**

`src/core/ir/schema.ts`:
```ts
import { z } from 'zod'

const taskTypeSchema = z.enum([
  'production_evaluation',
  'mechanism_check',
  'problem_modeling',
  'quick_lookup',
  'code_generation',
  'comparison_decision',
  'open_exploration',
  'text_rewrite',
])

const constraintItemSchema = z.union([
  z.string().min(1),
  z.object({
    text: z.string().min(1),
    priority: z.enum(['must', 'should', 'nice_to_have']).optional(),
    source: z.enum(['user', 'template', 'ai']).optional(),
  }),
])

export const intentIRSchema = z.object({
  schema_version: z.literal('0.2'),
  task_type: taskTypeSchema,
  objective: z.string().min(1, 'Objective is required'),
  context: z.object({
    background: z.string().optional(),
    current_state: z.string().optional(),
    inputs: z.array(z.string()).optional(),
    max_tokens: z.number().positive().optional(),
    summary_strategy: z.string().optional(),
  }),
  constraints: z.object({
    must_consider: z.array(constraintItemSchema),
    must_not: z.array(constraintItemSchema),
  }),
  output_spec: z.object({
    format: z.enum(['prose', 'bullet_list', 'numbered_list', 'table', 'code_block', 'json', 'markdown']),
    shape: z.array(z.string()),
    length: z.enum(['concise', 'moderate', 'detailed', 'exhaustive']),
  }),
  answer_mode: z.object({
    production_aware: z.boolean().optional(),
    challenge_assumptions: z.boolean().optional(),
    recommend_first: z.boolean().optional(),
    explore_alternatives: z.boolean().optional(),
    step_by_step: z.boolean().optional(),
  }),
  style: z.object({
    tone: z.enum(['formal', 'casual', 'technical', 'instructional']),
    verbosity: z.enum(['minimal', 'balanced', 'verbose']),
  }),
  audience: z.enum(['general', 'technical', 'senior_engineer', 'manager', 'non_technical']),
  metadata: z.object({
    source_mode: z.enum(['manual', 'ai_draft', 'template']),
    template_id: z.string().optional(),
    created_at: z.string(),
    compile_status: z.enum(['complete', 'partial', 'empty']),
  }),
})

export type ValidatedIntentIR = z.infer<typeof intentIRSchema>
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/core/ir/__tests__/schema.test.ts
```

Expected: 4 tests passed.

- [ ] **Step 6: Commit**

```bash
git add src/core/ir/schema.ts src/core/ir/__tests__/schema.test.ts
git commit -m "feat: add Zod schema for Intent IR runtime validation"
```
