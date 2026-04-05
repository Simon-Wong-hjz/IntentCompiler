# Chunk 5: Template System

> Parent: [00-overview.md](00-overview.md) | Depends on: [02-compiler-validator.md](02-compiler-validator.md)

## Task 5.1: Define Template Types

**Files:**
- Create: `src/core/template/types.ts`

- [ ] **Step 1: Define template definition types**

`src/core/template/types.ts`:
```ts
import type { BuilderFormState } from '../ir/form-types'
import type { TaskType } from '../ir/types'

/** Which fields to show in the builder form for this template */
export interface FieldVisibility {
  context_background: boolean
  context_current_state: boolean
  context_inputs: boolean
  constraints: boolean
  output_format: boolean
  output_shape: boolean
  output_length: boolean
  answer_mode: boolean
  style: boolean
  audience: boolean
}

/** A system template definition for a task type */
export interface TemplateDefinition {
  id: string
  task_type: TaskType
  name: string                    // display name (i18n key)
  description: string             // short description (i18n key)
  icon: string                    // lucide icon name
  defaults: Partial<BuilderFormState>  // pre-filled values
  field_visibility: FieldVisibility    // which optional fields to show
  placeholder_objective: string        // placeholder text for objective field
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/template/types.ts
git commit -m "feat: define TemplateDefinition types"
```

---

## Task 5.2: Create 8 Task Type Presets (TDD)

Per PRD `docs/prd/07-information-architecture.md`, the 8 MVP task types are:
1. production_evaluation
2. mechanism_check
3. problem_modeling
4. quick_lookup
5. code_generation
6. comparison_decision
7. open_exploration
8. text_rewrite

**Files:**
- Create: `src/core/template/presets/*.ts`, `src/core/template/presets/index.ts`, `src/core/template/__tests__/presets.test.ts`

- [ ] **Step 1: Write failing tests for presets**

`src/core/template/__tests__/presets.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { ALL_PRESETS, getPreset } from '../presets'
import type { TemplateDefinition } from '../types'
import type { TaskType } from '../../ir/types'

const EXPECTED_TASK_TYPES: TaskType[] = [
  'production_evaluation',
  'mechanism_check',
  'problem_modeling',
  'quick_lookup',
  'code_generation',
  'comparison_decision',
  'open_exploration',
  'text_rewrite',
]

describe('template presets', () => {
  it('should have exactly 8 presets', () => {
    expect(ALL_PRESETS).toHaveLength(8)
  })

  it('should cover all 8 task types', () => {
    const types = ALL_PRESETS.map(p => p.task_type)
    for (const t of EXPECTED_TASK_TYPES) {
      expect(types).toContain(t)
    }
  })

  it('each preset should have required fields', () => {
    for (const preset of ALL_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(preset.icon).toBeTruthy()
      expect(preset.placeholder_objective).toBeTruthy()
      expect(preset.field_visibility).toBeDefined()
      expect(preset.defaults.task_type).toBe(preset.task_type)
    }
  })

  it('getPreset should return preset by task_type', () => {
    const preset = getPreset('code_generation')
    expect(preset).toBeDefined()
    expect(preset!.task_type).toBe('code_generation')
  })

  it('getPreset should return undefined for invalid type', () => {
    expect(getPreset('nonexistent' as any)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement presets**

`src/core/template/presets/production-evaluation.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const productionEvaluation: TemplateDefinition = {
  id: 'tpl-production-evaluation',
  task_type: 'production_evaluation',
  name: 'template.production_evaluation.name',
  description: 'template.production_evaluation.description',
  icon: 'ShieldCheck',
  placeholder_objective: '请描述需要评估的方案或设计...',
  defaults: {
    task_type: 'production_evaluation',
    production_aware: true,
    recommend_first: true,
    output_format: 'bullet_list',
    output_length: 'detailed',
    tone: 'technical',
    audience: 'senior_engineer',
  },
  field_visibility: {
    context_background: true,
    context_current_state: true,
    context_inputs: false,
    constraints: true,
    output_format: true,
    output_shape: true,
    output_length: true,
    answer_mode: true,
    style: false,
    audience: true,
  },
}
```

`src/core/template/presets/mechanism-check.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const mechanismCheck: TemplateDefinition = {
  id: 'tpl-mechanism-check',
  task_type: 'mechanism_check',
  name: 'template.mechanism_check.name',
  description: 'template.mechanism_check.description',
  icon: 'Cog',
  placeholder_objective: '请描述需要验证的技术机制...',
  defaults: {
    task_type: 'mechanism_check',
    challenge_assumptions: true,
    step_by_step: true,
    output_format: 'numbered_list',
    tone: 'technical',
    audience: 'technical',
  },
  field_visibility: {
    context_background: true,
    context_current_state: true,
    context_inputs: true,
    constraints: true,
    output_format: true,
    output_shape: true,
    output_length: true,
    answer_mode: true,
    style: false,
    audience: false,
  },
}
```

`src/core/template/presets/problem-modeling.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const problemModeling: TemplateDefinition = {
  id: 'tpl-problem-modeling',
  task_type: 'problem_modeling',
  name: 'template.problem_modeling.name',
  description: 'template.problem_modeling.description',
  icon: 'Lightbulb',
  placeholder_objective: '请描述需要建模或分析的问题...',
  defaults: {
    task_type: 'problem_modeling',
    explore_alternatives: true,
    output_format: 'bullet_list',
    output_length: 'detailed',
    tone: 'formal',
  },
  field_visibility: {
    context_background: true,
    context_current_state: true,
    context_inputs: true,
    constraints: true,
    output_format: false,
    output_shape: true,
    output_length: true,
    answer_mode: true,
    style: false,
    audience: true,
  },
}
```

`src/core/template/presets/quick-lookup.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const quickLookup: TemplateDefinition = {
  id: 'tpl-quick-lookup',
  task_type: 'quick_lookup',
  name: 'template.quick_lookup.name',
  description: 'template.quick_lookup.description',
  icon: 'Search',
  placeholder_objective: '请输入你想查找的信息...',
  defaults: {
    task_type: 'quick_lookup',
    output_length: 'concise',
    verbosity: 'minimal',
    tone: 'casual',
  },
  field_visibility: {
    context_background: false,
    context_current_state: false,
    context_inputs: false,
    constraints: false,
    output_format: true,
    output_shape: false,
    output_length: true,
    answer_mode: false,
    style: false,
    audience: false,
  },
}
```

`src/core/template/presets/code-generation.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const codeGeneration: TemplateDefinition = {
  id: 'tpl-code-generation',
  task_type: 'code_generation',
  name: 'template.code_generation.name',
  description: 'template.code_generation.description',
  icon: 'Code',
  placeholder_objective: '请描述需要编写的代码功能...',
  defaults: {
    task_type: 'code_generation',
    production_aware: true,
    output_format: 'code_block',
    tone: 'technical',
    audience: 'senior_engineer',
  },
  field_visibility: {
    context_background: true,
    context_current_state: true,
    context_inputs: true,
    constraints: true,
    output_format: false,
    output_shape: true,
    output_length: true,
    answer_mode: true,
    style: false,
    audience: false,
  },
}
```

`src/core/template/presets/comparison-decision.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const comparisonDecision: TemplateDefinition = {
  id: 'tpl-comparison-decision',
  task_type: 'comparison_decision',
  name: 'template.comparison_decision.name',
  description: 'template.comparison_decision.description',
  icon: 'Scale',
  placeholder_objective: '请描述需要对比的选项和决策目标...',
  defaults: {
    task_type: 'comparison_decision',
    recommend_first: true,
    explore_alternatives: true,
    output_format: 'table',
    output_length: 'detailed',
  },
  field_visibility: {
    context_background: true,
    context_current_state: false,
    context_inputs: true,
    constraints: true,
    output_format: true,
    output_shape: true,
    output_length: true,
    answer_mode: true,
    style: false,
    audience: true,
  },
}
```

`src/core/template/presets/open-exploration.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const openExploration: TemplateDefinition = {
  id: 'tpl-open-exploration',
  task_type: 'open_exploration',
  name: 'template.open_exploration.name',
  description: 'template.open_exploration.description',
  icon: 'Compass',
  placeholder_objective: '请描述想要探索的方向...',
  defaults: {
    task_type: 'open_exploration',
    explore_alternatives: true,
    output_format: 'prose',
    output_length: 'detailed',
    verbosity: 'verbose',
  },
  field_visibility: {
    context_background: true,
    context_current_state: false,
    context_inputs: false,
    constraints: false,
    output_format: false,
    output_shape: false,
    output_length: true,
    answer_mode: false,
    style: true,
    audience: true,
  },
}
```

`src/core/template/presets/text-rewrite.ts`:
```ts
import type { TemplateDefinition } from '../types'

export const textRewrite: TemplateDefinition = {
  id: 'tpl-text-rewrite',
  task_type: 'text_rewrite',
  name: 'template.text_rewrite.name',
  description: 'template.text_rewrite.description',
  icon: 'PenLine',
  placeholder_objective: '请描述改写目标和原文...',
  defaults: {
    task_type: 'text_rewrite',
    output_format: 'prose',
    output_length: 'moderate',
  },
  field_visibility: {
    context_background: false,
    context_current_state: false,
    context_inputs: true,
    constraints: true,
    output_format: true,
    output_shape: false,
    output_length: true,
    answer_mode: false,
    style: true,
    audience: true,
  },
}
```

- [ ] **Step 4: Create presets index**

`src/core/template/presets/index.ts`:
```ts
import type { TemplateDefinition } from '../types'
import type { TaskType } from '../../ir/types'
import { productionEvaluation } from './production-evaluation'
import { mechanismCheck } from './mechanism-check'
import { problemModeling } from './problem-modeling'
import { quickLookup } from './quick-lookup'
import { codeGeneration } from './code-generation'
import { comparisonDecision } from './comparison-decision'
import { openExploration } from './open-exploration'
import { textRewrite } from './text-rewrite'

export const ALL_PRESETS: TemplateDefinition[] = [
  productionEvaluation,
  mechanismCheck,
  problemModeling,
  quickLookup,
  codeGeneration,
  comparisonDecision,
  openExploration,
  textRewrite,
]

export function getPreset(taskType: TaskType): TemplateDefinition | undefined {
  return ALL_PRESETS.find((p) => p.task_type === taskType)
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/core/template/__tests__/presets.test.ts
```

Expected: 5 tests passed.

- [ ] **Step 6: Commit**

```bash
git add src/core/template/
git commit -m "feat: create 8 task-type template presets with field visibility config"
```
