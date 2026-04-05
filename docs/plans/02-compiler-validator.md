# Chunk 2: IR Compiler & Validator

> Parent: [00-overview.md](00-overview.md) | Depends on: [01-bootstrap-types.md](01-bootstrap-types.md)

## Task 2.1: Define Builder Form State Types

**Files:**
- Create: `src/core/ir/form-types.ts`

- [ ] **Step 1: Define form state types**

`src/core/ir/form-types.ts`:
```ts
/**
 * Builder form state — the raw user input before compilation to IR.
 * All fields are optional because the form supports partial filling.
 */
import type { TaskType, OutputFormat, OutputLength, Tone, Verbosity, Audience, ConstraintItem } from './types'

export interface BuilderFormState {
  task_type?: TaskType
  objective?: string

  // Context
  context_background?: string
  context_current_state?: string
  context_inputs?: string[]
  context_max_tokens?: number
  context_summary_strategy?: string

  // Constraints
  must_consider?: ConstraintItem[]
  must_not?: ConstraintItem[]

  // Output
  output_format?: OutputFormat
  output_shape?: string[]
  output_length?: OutputLength

  // Answer mode
  production_aware?: boolean
  challenge_assumptions?: boolean
  recommend_first?: boolean
  explore_alternatives?: boolean
  step_by_step?: boolean

  // Style
  tone?: Tone
  verbosity?: Verbosity
  audience?: Audience
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/core/ir/form-types.ts
git commit -m "feat: define BuilderFormState types for form-to-IR pipeline"
```

---

## Task 2.2: Implement IR Compiler (TDD)

**Files:**
- Create: `src/core/ir/compiler.ts`, `src/core/ir/__tests__/compiler.test.ts`

- [ ] **Step 1: Write failing tests for compiler**

`src/core/ir/__tests__/compiler.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { compileToIR } from '../compiler'
import type { BuilderFormState } from '../form-types'

describe('compileToIR', () => {
  it('should compile a complete form state to a valid IR', () => {
    const form: BuilderFormState = {
      task_type: 'code_generation',
      objective: 'Build a login form with validation',
      context_background: 'React SPA project',
      must_consider: ['TypeScript strict', 'Accessible'],
      must_not: ['No class components'],
      output_format: 'code_block',
      output_shape: ['component', 'test'],
      output_length: 'moderate',
      production_aware: true,
      step_by_step: false,
      tone: 'technical',
      verbosity: 'balanced',
      audience: 'senior_engineer',
    }

    const ir = compileToIR(form)

    expect(ir.schema_version).toBe('0.2')
    expect(ir.task_type).toBe('code_generation')
    expect(ir.objective).toBe('Build a login form with validation')
    expect(ir.context.background).toBe('React SPA project')
    expect(ir.constraints.must_consider).toEqual(['TypeScript strict', 'Accessible'])
    expect(ir.output_spec.format).toBe('code_block')
    expect(ir.answer_mode.production_aware).toBe(true)
    expect(ir.metadata.compile_status).toBe('complete')
    expect(ir.metadata.source_mode).toBe('manual')
  })

  it('should produce partial IR when objective is missing', () => {
    const form: BuilderFormState = { task_type: 'quick_lookup' }
    const ir = compileToIR(form)

    expect(ir.metadata.compile_status).toBe('partial')
    expect(ir.task_type).toBe('quick_lookup')
    expect(ir.objective).toBe('')
  })

  it('should produce empty IR from empty form', () => {
    const ir = compileToIR({})
    expect(ir.metadata.compile_status).toBe('empty')
  })

  it('should apply default values for missing optional fields', () => {
    const form: BuilderFormState = {
      task_type: 'open_exploration',
      objective: 'Explore options for caching',
    }
    const ir = compileToIR(form)

    expect(ir.style.tone).toBe('formal')
    expect(ir.style.verbosity).toBe('balanced')
    expect(ir.audience).toBe('general')
    expect(ir.output_spec.format).toBe('prose')
    expect(ir.output_spec.length).toBe('moderate')
    expect(ir.constraints.must_consider).toEqual([])
  })

  it('should be idempotent (except timestamps)', () => {
    const form: BuilderFormState = {
      task_type: 'mechanism_check',
      objective: 'Check retry logic',
    }
    const ir1 = compileToIR(form)
    const ir2 = compileToIR(form)

    const { metadata: m1, ...rest1 } = ir1
    const { metadata: m2, ...rest2 } = ir2
    expect(rest1).toEqual(rest2)
    expect(m1.compile_status).toBe(m2.compile_status)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/core/ir/__tests__/compiler.test.ts
```

Expected: FAIL — `../compiler` module not found.

- [ ] **Step 3: Implement the compiler**

`src/core/ir/compiler.ts`:
```ts
import type { BuilderFormState } from './form-types'
import type { IntentIR, CompileStatus } from './types'
import { SCHEMA_VERSION } from './types'

function determineCompileStatus(form: BuilderFormState): CompileStatus {
  const hasTaskType = !!form.task_type
  const hasObjective = !!form.objective?.trim()

  if (!hasTaskType && !hasObjective) return 'empty'
  if (hasTaskType && hasObjective) return 'complete'
  return 'partial'
}

export function compileToIR(form: BuilderFormState): IntentIR {
  return {
    schema_version: SCHEMA_VERSION,
    task_type: form.task_type ?? 'open_exploration',
    objective: form.objective?.trim() ?? '',
    context: {
      background: form.context_background || undefined,
      current_state: form.context_current_state || undefined,
      inputs: form.context_inputs?.length ? form.context_inputs : undefined,
      max_tokens: form.context_max_tokens || undefined,
      summary_strategy: form.context_summary_strategy || undefined,
    },
    constraints: {
      must_consider: form.must_consider ?? [],
      must_not: form.must_not ?? [],
    },
    output_spec: {
      format: form.output_format ?? 'prose',
      shape: form.output_shape ?? [],
      length: form.output_length ?? 'moderate',
    },
    answer_mode: {
      production_aware: form.production_aware ?? undefined,
      challenge_assumptions: form.challenge_assumptions ?? undefined,
      recommend_first: form.recommend_first ?? undefined,
      explore_alternatives: form.explore_alternatives ?? undefined,
      step_by_step: form.step_by_step ?? undefined,
    },
    style: {
      tone: form.tone ?? 'formal',
      verbosity: form.verbosity ?? 'balanced',
    },
    audience: form.audience ?? 'general',
    metadata: {
      source_mode: 'manual',
      created_at: new Date().toISOString(),
      compile_status: determineCompileStatus(form),
    },
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- src/core/ir/__tests__/compiler.test.ts
```

Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/core/ir/compiler.ts src/core/ir/__tests__/compiler.test.ts
git commit -m "feat: implement IR compiler with TDD"
```

---

## Task 2.3: Implement IR Validator (TDD)

Implements validation rules R-002, R-003, R-004, R-006 from PRD appendix `docs/prd/17-appendix-contracts.md`. R-001 (semantic overlap) and R-005 (token estimation) are deferred — they require keyword matching / token counting that can be added later as new rules.

**Files:**
- Create: `src/core/ir/validator.ts`, `src/core/ir/__tests__/validator.test.ts`

- [ ] **Step 1: Write failing tests for validator**

`src/core/ir/__tests__/validator.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { validateIR, type ValidationResult } from '../validator'
import { compileToIR } from '../compiler'
import type { BuilderFormState } from '../form-types'

function compileAndValidate(form: BuilderFormState): ValidationResult[] {
  return validateIR(compileToIR(form))
}

describe('validateIR', () => {
  describe('R-002: answer_mode tension', () => {
    it('should warn when recommend_first + challenge_assumptions', () => {
      const warnings = compileAndValidate({
        task_type: 'production_evaluation',
        objective: 'Evaluate caching strategy',
        recommend_first: true,
        challenge_assumptions: true,
      })
      expect(warnings).toContainEqual(expect.objectContaining({ rule_id: 'R-002', severity: 'warning' }))
    })

    it('should not warn when only one is set', () => {
      const warnings = compileAndValidate({
        task_type: 'production_evaluation',
        objective: 'Evaluate caching',
        recommend_first: true,
      })
      expect(warnings.find(w => w.rule_id === 'R-002')).toBeUndefined()
    })
  })

  describe('R-003: answer_mode redundancy', () => {
    it('should warn when recommend_first + step_by_step', () => {
      const warnings = compileAndValidate({
        task_type: 'mechanism_check',
        objective: 'Check retry logic',
        recommend_first: true,
        step_by_step: true,
      })
      expect(warnings).toContainEqual(expect.objectContaining({ rule_id: 'R-003', severity: 'warning' }))
    })
  })

  describe('R-004: output length vs expand mode', () => {
    it('should warn when concise + step_by_step', () => {
      const warnings = compileAndValidate({
        task_type: 'mechanism_check',
        objective: 'Check something',
        output_length: 'concise',
        step_by_step: true,
      })
      expect(warnings).toContainEqual(expect.objectContaining({ rule_id: 'R-004', severity: 'warning' }))
    })

    it('should warn when concise + explore_alternatives', () => {
      const warnings = compileAndValidate({
        task_type: 'comparison_decision',
        objective: 'Compare A vs B',
        output_length: 'concise',
        explore_alternatives: true,
      })
      expect(warnings).toContainEqual(expect.objectContaining({ rule_id: 'R-004', severity: 'warning' }))
    })
  })

  describe('R-006: too many critical constraints', () => {
    it('should warn when >5 must-priority constraints', () => {
      const criticals = Array.from({ length: 6 }, (_, i) => ({
        text: `Critical rule ${i}`,
        priority: 'must' as const,
      }))
      const warnings = compileAndValidate({
        task_type: 'code_generation',
        objective: 'Generate code',
        must_consider: criticals,
      })
      expect(warnings).toContainEqual(expect.objectContaining({ rule_id: 'R-006', severity: 'warning' }))
    })

    it('should not warn when <=5', () => {
      const criticals = Array.from({ length: 5 }, (_, i) => ({
        text: `Rule ${i}`,
        priority: 'must' as const,
      }))
      const warnings = compileAndValidate({
        task_type: 'code_generation',
        objective: 'Generate code',
        must_consider: criticals,
      })
      expect(warnings.find(w => w.rule_id === 'R-006')).toBeUndefined()
    })
  })

  describe('no false positives', () => {
    it('should return empty for a clean IR', () => {
      const warnings = compileAndValidate({
        task_type: 'quick_lookup',
        objective: 'What is the capital of France?',
        output_length: 'concise',
        tone: 'casual',
        verbosity: 'minimal',
      })
      expect(warnings).toEqual([])
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/core/ir/__tests__/validator.test.ts
```

Expected: FAIL — `../validator` module not found.

- [ ] **Step 3: Implement the validator**

`src/core/ir/validator.ts`:
```ts
import type { IntentIR, ConstraintItem } from './types'

export interface ValidationResult {
  rule_id: string
  severity: 'error' | 'warning'
  message: string
  resolution: string
}

type ValidationRule = (ir: IntentIR) => ValidationResult | null

const r002TensionDetection: ValidationRule = (ir) => {
  if (ir.answer_mode.recommend_first && ir.answer_mode.challenge_assumptions) {
    return {
      rule_id: 'R-002',
      severity: 'warning',
      message: '「先给推荐」与「质疑前提」存在张力——系统将先检验前提有效性，再在有效范围内给出推荐',
      resolution: '如果您希望无条件质疑前提，建议关闭「先给推荐」',
    }
  }
  return null
}

const r003RedundancyDetection: ValidationRule = (ir) => {
  if (ir.answer_mode.recommend_first && ir.answer_mode.step_by_step) {
    return {
      rule_id: 'R-003',
      severity: 'warning',
      message: '「先给推荐」与「逐步推导」的阅读顺序不同，系统将以先给推荐为主',
      resolution: '如果您更需要完整推导过程，建议关闭「先给推荐」',
    }
  }
  return null
}

const r004LengthExpandConflict: ValidationRule = (ir) => {
  if (ir.output_spec.length === 'concise' &&
      (ir.answer_mode.step_by_step || ir.answer_mode.explore_alternatives)) {
    return {
      rule_id: 'R-004',
      severity: 'warning',
      message: '输出要求「简短」，但回答模式要求展开，实际输出可能超出预期长度',
      resolution: '将输出长度调整为 moderate 或 detailed，或关闭展开类回答模式',
    }
  }
  return null
}

function countMustConstraints(items: ConstraintItem[]): number {
  return items.filter((c) => typeof c === 'object' && c.priority === 'must').length
}

const r006CriticalOverload: ValidationRule = (ir) => {
  const count = countMustConstraints(ir.constraints.must_consider) +
                countMustConstraints(ir.constraints.must_not)
  if (count > 5) {
    return {
      rule_id: 'R-006',
      severity: 'warning',
      message: `标记为「关键」的约束过多（${count} 项），可能导致 renderer 无法有效区分优先级`,
      resolution: '将部分约束降级为 should，仅保留最核心的 3-5 项为 must',
    }
  }
  return null
}

const rules: ValidationRule[] = [
  r002TensionDetection,
  r003RedundancyDetection,
  r004LengthExpandConflict,
  r006CriticalOverload,
]

export function validateIR(ir: IntentIR): ValidationResult[] {
  return rules.map((rule) => rule(ir)).filter((r): r is ValidationResult => r !== null)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- src/core/ir/__tests__/validator.test.ts
```

Expected: 7 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/core/ir/validator.ts src/core/ir/__tests__/validator.test.ts
git commit -m "feat: implement IR validator with rules R-002/R-003/R-004/R-006"
```
