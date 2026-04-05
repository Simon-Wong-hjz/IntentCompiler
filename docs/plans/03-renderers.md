# Chunk 3: Renderers

> Parent: [00-overview.md](00-overview.md) | Depends on: [02-compiler-validator.md](02-compiler-validator.md)

Implements 4 render modes per PRD `docs/prd/11-rendering-strategy.md`:
1. Pure NL — natural language paragraphs
2. Hybrid JSON — NL task framing + JSON constraint block (default)
3. Hybrid Text — NL + structured bullet/key-value text
4. Pure JSON — full IR as JSON (advanced users)

Key design: **Field-Tiered Rendering** — high-impact behavior fields are promoted to NL, discrete constraints stay in structured blocks.

---

## Task 3.1: Define Renderer Interface & Types

**Files:**
- Create: `src/core/renderer/types.ts`

- [ ] **Step 1: Define renderer types**

`src/core/renderer/types.ts`:
```ts
import type { IntentIR } from '../ir/types'

export type RenderMode = 'natural-language' | 'hybrid-json' | 'hybrid-text' | 'pure-json'

export interface RenderResult {
  mode: RenderMode
  output: string
}

export interface Renderer {
  mode: RenderMode
  render(ir: IntentIR): RenderResult
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/renderer/types.ts
git commit -m "feat: define Renderer interface and types"
```

---

## Task 3.2: Implement Field Promotion Logic (TDD)

Field promotion determines which IR fields go into the NL paragraph vs the structured block. This is the core of the hybrid rendering strategy.

**Files:**
- Create: `src/core/renderer/field-promotion.ts`, `src/core/renderer/__tests__/field-promotion.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/renderer/__tests__/field-promotion.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { promoteFields, type PromotedFields } from '../field-promotion'
import type { IntentIR } from '../../ir/types'
import { compileToIR } from '../../ir/compiler'
import type { BuilderFormState } from '../../ir/form-types'

function buildIR(form: BuilderFormState): IntentIR {
  return compileToIR(form)
}

describe('promoteFields', () => {
  it('should promote objective into NL', () => {
    const ir = buildIR({
      task_type: 'production_evaluation',
      objective: 'Evaluate this caching strategy',
    })
    const result = promoteFields(ir)
    expect(result.nlParagraph).toContain('Evaluate this caching strategy')
  })

  it('should promote production_aware into NL', () => {
    const ir = buildIR({
      task_type: 'production_evaluation',
      objective: 'Evaluate design',
      production_aware: true,
    })
    const result = promoteFields(ir)
    expect(result.nlParagraph).toMatch(/生产|production/i)
  })

  it('should promote recommend_first into NL', () => {
    const ir = buildIR({
      task_type: 'comparison_decision',
      objective: 'Compare A vs B',
      recommend_first: true,
    })
    const result = promoteFields(ir)
    expect(result.nlParagraph).toMatch(/结论|推荐|recommend|conclusion/i)
  })

  it('should promote challenge_assumptions into NL', () => {
    const ir = buildIR({
      task_type: 'mechanism_check',
      objective: 'Check logic',
      challenge_assumptions: true,
    })
    const result = promoteFields(ir)
    expect(result.nlParagraph).toMatch(/前提|质疑|assumption|challenge/i)
  })

  it('should keep constraints in residual JSON', () => {
    const ir = buildIR({
      task_type: 'code_generation',
      objective: 'Write a component',
      must_consider: ['TypeScript', 'Accessible'],
      must_not: ['No class components'],
      output_format: 'code_block',
      output_length: 'moderate',
      audience: 'senior_engineer',
    })
    const result = promoteFields(ir)
    expect(result.residualJSON.constraints).toBeDefined()
    expect(result.residualJSON.output_spec).toBeDefined()
    expect(result.residualJSON.audience).toBe('senior_engineer')
  })

  it('should omit empty/default fields from residual JSON', () => {
    const ir = buildIR({
      task_type: 'quick_lookup',
      objective: 'What is X?',
    })
    const result = promoteFields(ir)
    // Empty constraints should be omitted
    expect(result.residualJSON.constraints).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/core/renderer/__tests__/field-promotion.test.ts
```

- [ ] **Step 3: Implement field promotion**

`src/core/renderer/field-promotion.ts`:
```ts
import type { IntentIR, TaskType } from '../ir/types'

export interface PromotedFields {
  nlParagraph: string
  residualJSON: Record<string, unknown>
}

/** Map task_type to a human-readable action phrase */
const TASK_TYPE_PHRASES: Record<TaskType, string> = {
  production_evaluation: '请从生产落地视角评估',
  mechanism_check: '请验证以下技术机制的正确性',
  problem_modeling: '请帮我定义和分析以下问题',
  quick_lookup: '请快速查找',
  code_generation: '请编写以下代码',
  comparison_decision: '请对比分析以下选项',
  open_exploration: '请围绕以下方向自由探索',
  text_rewrite: '请改写以下内容',
}

export function promoteFields(ir: IntentIR): PromotedFields {
  // Build NL paragraph from promoted fields
  const nlParts: string[] = []

  // 1. Task type + objective (always promoted)
  const taskPhrase = TASK_TYPE_PHRASES[ir.task_type] || '请处理'
  nlParts.push(`${taskPhrase}：${ir.objective}`)

  // 2. Answer mode behaviors (high-impact, promoted to NL)
  const modeParts: string[] = []
  if (ir.answer_mode.production_aware) {
    modeParts.push('从生产环境实际可行性角度出发')
  }
  if (ir.answer_mode.recommend_first) {
    modeParts.push('先给结论和推荐，再给依据')
  }
  if (ir.answer_mode.challenge_assumptions) {
    modeParts.push('如果前提本身有漏洞，请直接指出并修正')
  }
  if (ir.answer_mode.step_by_step) {
    modeParts.push('请逐步推导')
  }
  if (ir.answer_mode.explore_alternatives) {
    modeParts.push('请横向对比备选方案')
  }
  if (modeParts.length > 0) {
    nlParts.push(modeParts.join('；') + '。')
  }

  // 3. Context background (promoted if present)
  if (ir.context.background) {
    nlParts.push(`背景信息：${ir.context.background}`)
  }
  if (ir.context.current_state) {
    nlParts.push(`当前状态：${ir.context.current_state}`)
  }

  // Build residual JSON from non-promoted fields
  const residual: Record<string, unknown> = {}

  // Constraints — only include if non-empty
  const hasConstraints =
    ir.constraints.must_consider.length > 0 || ir.constraints.must_not.length > 0
  if (hasConstraints) {
    residual.constraints = {
      ...(ir.constraints.must_consider.length > 0 && { must_consider: ir.constraints.must_consider }),
      ...(ir.constraints.must_not.length > 0 && { must_not: ir.constraints.must_not }),
    }
  }

  // Output spec — only include non-default values
  const outputSpec: Record<string, unknown> = {}
  if (ir.output_spec.format !== 'prose') outputSpec.format = ir.output_spec.format
  if (ir.output_spec.shape.length > 0) outputSpec.shape = ir.output_spec.shape
  if (ir.output_spec.length !== 'moderate') outputSpec.length = ir.output_spec.length
  if (Object.keys(outputSpec).length > 0) residual.output_spec = outputSpec

  // Style — only include non-default
  const style: Record<string, unknown> = {}
  if (ir.style.verbosity !== 'balanced') style.verbosity = ir.style.verbosity
  if (ir.style.tone !== 'formal') style.tone = ir.style.tone
  if (Object.keys(style).length > 0) residual.style = style

  // Audience — only include non-default
  if (ir.audience !== 'general') residual.audience = ir.audience

  // Context inputs — discrete, stay in JSON
  if (ir.context.inputs && ir.context.inputs.length > 0) {
    residual.inputs = ir.context.inputs
  }

  return {
    nlParagraph: nlParts.join('\n\n'),
    residualJSON: residual,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- src/core/renderer/__tests__/field-promotion.test.ts
```

Expected: 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/core/renderer/field-promotion.ts src/core/renderer/__tests__/field-promotion.test.ts
git commit -m "feat: implement field-tiered promotion logic for renderers"
```

---

## Task 3.3: Implement Hybrid JSON Renderer (Default) (TDD)

**Files:**
- Create: `src/core/renderer/hybrid-json.ts`, `src/core/renderer/__tests__/hybrid-json.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/renderer/__tests__/hybrid-json.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { hybridJsonRenderer } from '../hybrid-json'
import { compileToIR } from '../../ir/compiler'

describe('hybridJsonRenderer', () => {
  it('should render NL paragraph followed by JSON block', () => {
    const ir = compileToIR({
      task_type: 'production_evaluation',
      objective: 'Evaluate caching strategy',
      production_aware: true,
      recommend_first: true,
      must_consider: ['latency', 'consistency'],
      must_not: ['over-engineering'],
      output_format: 'bullet_list',
      output_length: 'concise',
      audience: 'senior_engineer',
    })

    const result = hybridJsonRenderer.render(ir)

    expect(result.mode).toBe('hybrid-json')
    // NL section should contain objective and answer_mode behaviors
    expect(result.output).toContain('Evaluate caching strategy')
    expect(result.output).toContain('```json')
    // JSON block should contain constraints
    expect(result.output).toContain('"must_consider"')
    expect(result.output).toContain('"audience"')
  })

  it('should produce valid JSON in the code block', () => {
    const ir = compileToIR({
      task_type: 'code_generation',
      objective: 'Write a hook',
      must_consider: ['TypeScript'],
      output_format: 'code_block',
      audience: 'senior_engineer',
    })

    const result = hybridJsonRenderer.render(ir)
    const jsonMatch = result.output.match(/```json\n([\s\S]*?)\n```/)
    expect(jsonMatch).not.toBeNull()

    const parsed = JSON.parse(jsonMatch![1])
    expect(parsed.constraints.must_consider).toContain('TypeScript')
  })

  it('should omit JSON block when no residual fields', () => {
    const ir = compileToIR({
      task_type: 'quick_lookup',
      objective: 'What is the capital of France?',
    })

    const result = hybridJsonRenderer.render(ir)
    expect(result.output).not.toContain('```json')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/core/renderer/__tests__/hybrid-json.test.ts
```

- [ ] **Step 3: Implement hybrid JSON renderer**

`src/core/renderer/hybrid-json.ts`:
```ts
import type { Renderer, RenderResult } from './types'
import type { IntentIR } from '../ir/types'
import { promoteFields } from './field-promotion'

export const hybridJsonRenderer: Renderer = {
  mode: 'hybrid-json',

  render(ir: IntentIR): RenderResult {
    const { nlParagraph, residualJSON } = promoteFields(ir)

    const parts: string[] = [nlParagraph]

    if (Object.keys(residualJSON).length > 0) {
      parts.push('```json\n' + JSON.stringify(residualJSON, null, 2) + '\n```')
    }

    return {
      mode: 'hybrid-json',
      output: parts.join('\n\n'),
    }
  },
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- src/core/renderer/__tests__/hybrid-json.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/core/renderer/hybrid-json.ts src/core/renderer/__tests__/hybrid-json.test.ts
git commit -m "feat: implement hybrid-json renderer (default render mode)"
```

---

## Task 3.4: Implement Natural Language Renderer (TDD)

**Files:**
- Create: `src/core/renderer/natural-language.ts`, `src/core/renderer/__tests__/natural-language.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/renderer/__tests__/natural-language.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { naturalLanguageRenderer } from '../natural-language'
import { compileToIR } from '../../ir/compiler'

describe('naturalLanguageRenderer', () => {
  it('should render everything as natural language paragraphs', () => {
    const ir = compileToIR({
      task_type: 'production_evaluation',
      objective: 'Evaluate caching strategy',
      production_aware: true,
      must_consider: ['latency', 'consistency'],
      must_not: ['over-engineering'],
      audience: 'senior_engineer',
    })

    const result = naturalLanguageRenderer.render(ir)

    expect(result.mode).toBe('natural-language')
    expect(result.output).toContain('Evaluate caching strategy')
    expect(result.output).not.toContain('```json')
    expect(result.output).not.toContain('{')
    // Constraints rendered as NL
    expect(result.output).toMatch(/latency/)
    expect(result.output).toMatch(/over-engineering/)
  })

  it('should omit empty sections', () => {
    const ir = compileToIR({
      task_type: 'quick_lookup',
      objective: 'What is X?',
    })

    const result = naturalLanguageRenderer.render(ir)
    expect(result.output).not.toMatch(/约束|禁止|constraint/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement NL renderer**

`src/core/renderer/natural-language.ts`:
```ts
import type { Renderer, RenderResult } from './types'
import type { IntentIR, ConstraintItem } from '../ir/types'
import { promoteFields } from './field-promotion'

function constraintText(item: ConstraintItem): string {
  return typeof item === 'string' ? item : item.text
}

export const naturalLanguageRenderer: Renderer = {
  mode: 'natural-language',

  render(ir: IntentIR): RenderResult {
    const { nlParagraph } = promoteFields(ir)
    const parts: string[] = [nlParagraph]

    // Render constraints as NL bullets
    if (ir.constraints.must_consider.length > 0) {
      const items = ir.constraints.must_consider.map(constraintText).join('、')
      parts.push(`请务必考虑：${items}。`)
    }
    if (ir.constraints.must_not.length > 0) {
      const items = ir.constraints.must_not.map(constraintText).join('、')
      parts.push(`请避免：${items}。`)
    }

    // Render output spec as NL
    const specParts: string[] = []
    if (ir.output_spec.format !== 'prose') specParts.push(`输出格式：${ir.output_spec.format}`)
    if (ir.output_spec.shape.length > 0) specParts.push(`包含：${ir.output_spec.shape.join('、')}`)
    if (ir.output_spec.length !== 'moderate') specParts.push(`篇幅：${ir.output_spec.length}`)
    if (specParts.length > 0) parts.push(specParts.join('；') + '。')

    // Audience
    if (ir.audience !== 'general') parts.push(`目标读者：${ir.audience}。`)

    return {
      mode: 'natural-language',
      output: parts.join('\n\n'),
    }
  },
}
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add src/core/renderer/natural-language.ts src/core/renderer/__tests__/natural-language.test.ts
git commit -m "feat: implement natural-language renderer"
```

---

## Task 3.5: Implement Hybrid Text & Pure JSON Renderers (TDD)

**Files:**
- Create: `src/core/renderer/hybrid-text.ts`, `src/core/renderer/pure-json.ts`, `src/core/renderer/__tests__/hybrid-text.test.ts`, `src/core/renderer/__tests__/pure-json.test.ts`

- [ ] **Step 1: Write failing tests for both**

`src/core/renderer/__tests__/hybrid-text.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { hybridTextRenderer } from '../hybrid-text'
import { compileToIR } from '../../ir/compiler'

describe('hybridTextRenderer', () => {
  it('should render NL paragraph + structured text (no JSON)', () => {
    const ir = compileToIR({
      task_type: 'code_generation',
      objective: 'Write a component',
      must_consider: ['TypeScript', 'a11y'],
      output_format: 'code_block',
      audience: 'senior_engineer',
    })
    const result = hybridTextRenderer.render(ir)

    expect(result.mode).toBe('hybrid-text')
    expect(result.output).toContain('Write a component')
    expect(result.output).not.toContain('```json')
    // Should use bullet or key-value format
    expect(result.output).toMatch(/[-•]|：/)
  })
})
```

`src/core/renderer/__tests__/pure-json.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { pureJsonRenderer } from '../pure-json'
import { compileToIR } from '../../ir/compiler'

describe('pureJsonRenderer', () => {
  it('should render the full IR as valid JSON', () => {
    const ir = compileToIR({
      task_type: 'code_generation',
      objective: 'Write a hook',
      must_consider: ['TypeScript'],
    })
    const result = pureJsonRenderer.render(ir)

    expect(result.mode).toBe('pure-json')
    const parsed = JSON.parse(result.output)
    expect(parsed.task_type).toBe('code_generation')
    expect(parsed.objective).toBe('Write a hook')
  })

  it('should exclude metadata from output', () => {
    const ir = compileToIR({ task_type: 'quick_lookup', objective: 'X' })
    const result = pureJsonRenderer.render(ir)
    const parsed = JSON.parse(result.output)
    expect(parsed.metadata).toBeUndefined()
    expect(parsed.schema_version).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement hybrid text renderer**

`src/core/renderer/hybrid-text.ts`:
```ts
import type { Renderer, RenderResult } from './types'
import type { IntentIR, ConstraintItem } from '../ir/types'
import { promoteFields } from './field-promotion'

function constraintText(item: ConstraintItem): string {
  return typeof item === 'string' ? item : item.text
}

export const hybridTextRenderer: Renderer = {
  mode: 'hybrid-text',

  render(ir: IntentIR): RenderResult {
    const { nlParagraph } = promoteFields(ir)
    const parts: string[] = [nlParagraph]

    const structuredLines: string[] = []

    if (ir.constraints.must_consider.length > 0) {
      structuredLines.push('必须考虑：')
      ir.constraints.must_consider.forEach(c => structuredLines.push(`  - ${constraintText(c)}`))
    }
    if (ir.constraints.must_not.length > 0) {
      structuredLines.push('禁止事项：')
      ir.constraints.must_not.forEach(c => structuredLines.push(`  - ${constraintText(c)}`))
    }
    if (ir.output_spec.format !== 'prose') structuredLines.push(`输出格式：${ir.output_spec.format}`)
    if (ir.output_spec.shape.length > 0) structuredLines.push(`输出结构：${ir.output_spec.shape.join('、')}`)
    if (ir.output_spec.length !== 'moderate') structuredLines.push(`输出篇幅：${ir.output_spec.length}`)
    if (ir.audience !== 'general') structuredLines.push(`目标读者：${ir.audience}`)
    if (ir.style.verbosity !== 'balanced') structuredLines.push(`详细程度：${ir.style.verbosity}`)

    if (structuredLines.length > 0) {
      parts.push(structuredLines.join('\n'))
    }

    return { mode: 'hybrid-text', output: parts.join('\n\n') }
  },
}
```

- [ ] **Step 4: Implement pure JSON renderer**

`src/core/renderer/pure-json.ts`:
```ts
import type { Renderer, RenderResult } from './types'
import type { IntentIR } from '../ir/types'

export const pureJsonRenderer: Renderer = {
  mode: 'pure-json',

  render(ir: IntentIR): RenderResult {
    // Exclude metadata and schema_version — they're internal protocol fields
    const { metadata, schema_version, ...userFacing } = ir
    return {
      mode: 'pure-json',
      output: JSON.stringify(userFacing, null, 2),
    }
  },
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/core/renderer/__tests__/
```

- [ ] **Step 6: Commit**

```bash
git add src/core/renderer/hybrid-text.ts src/core/renderer/pure-json.ts src/core/renderer/__tests__/
git commit -m "feat: implement hybrid-text and pure-json renderers"
```

---

## Task 3.6: Create Renderer Registry

**Files:**
- Create: `src/core/renderer/index.ts`

- [ ] **Step 1: Implement registry**

`src/core/renderer/index.ts`:
```ts
import type { Renderer, RenderMode, RenderResult } from './types'
import type { IntentIR } from '../ir/types'
import { hybridJsonRenderer } from './hybrid-json'
import { naturalLanguageRenderer } from './natural-language'
import { hybridTextRenderer } from './hybrid-text'
import { pureJsonRenderer } from './pure-json'

export type { Renderer, RenderMode, RenderResult } from './types'

const renderers: Record<RenderMode, Renderer> = {
  'hybrid-json': hybridJsonRenderer,
  'natural-language': naturalLanguageRenderer,
  'hybrid-text': hybridTextRenderer,
  'pure-json': pureJsonRenderer,
}

export const DEFAULT_RENDER_MODE: RenderMode = 'hybrid-json'

export function render(ir: IntentIR, mode: RenderMode = DEFAULT_RENDER_MODE): RenderResult {
  return renderers[mode].render(ir)
}

export function getAvailableModes(): RenderMode[] {
  return Object.keys(renderers) as RenderMode[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/renderer/index.ts
git commit -m "feat: add renderer registry with factory function"
```
