# Chunk 4: Data Layer (Dexie + Zustand)

> Parent: [00-overview.md](00-overview.md) | Depends on: [02-compiler-validator.md](02-compiler-validator.md)

## Task 4.1: Set Up Dexie Database

**Files:**
- Create: `src/shared/db/index.ts`

- [ ] **Step 1: Install Dexie**

```bash
npm install dexie
```

- [ ] **Step 2: Define DB schema**

`src/shared/db/index.ts`:
```ts
import Dexie, { type EntityTable } from 'dexie'
import type { IntentIR } from '@/core/ir/types'
import type { BuilderFormState } from '@/core/ir/form-types'

export interface DraftRecord {
  id?: number
  form_state: BuilderFormState
  ir?: IntentIR
  updated_at: string
  title?: string  // derived from objective or task_type
}

export interface PresetRecord {
  id?: number
  name: string
  description?: string
  template_id?: string    // links to a system template
  form_state: BuilderFormState
  ir: IntentIR
  created_at: string
  updated_at: string
}

export interface SettingRecord {
  key: string
  value: unknown
}

const db = new Dexie('IntentCompiler') as Dexie & {
  drafts: EntityTable<DraftRecord, 'id'>
  presets: EntityTable<PresetRecord, 'id'>
  settings: EntityTable<SettingRecord, 'key'>
}

db.version(1).stores({
  drafts: '++id, updated_at',
  presets: '++id, name, template_id, updated_at',
  settings: 'key',
})

export { db }
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/db/index.ts package.json package-lock.json
git commit -m "feat: set up Dexie database with drafts, presets, settings tables"
```

---

## Task 4.2: Implement DB Operations (TDD)

**Files:**
- Create: `src/shared/db/operations.ts`, `src/shared/db/__tests__/operations.test.ts`

- [ ] **Step 1: Write failing tests**

`src/shared/db/__tests__/operations.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../index'
import { saveDraft, loadDraft, deleteDraft, listDrafts, savePreset, listPresets, deletePreset } from '../operations'

// Use Dexie's fake-indexeddb for tests
import 'fake-indexeddb/auto'

beforeEach(async () => {
  await db.drafts.clear()
  await db.presets.clear()
})

describe('draft operations', () => {
  it('should save and load a draft', async () => {
    const id = await saveDraft({
      form_state: { task_type: 'quick_lookup', objective: 'Test' },
    })
    expect(id).toBeGreaterThan(0)

    const draft = await loadDraft(id)
    expect(draft?.form_state.objective).toBe('Test')
  })

  it('should update an existing draft', async () => {
    const id = await saveDraft({
      form_state: { task_type: 'quick_lookup', objective: 'V1' },
    })
    await saveDraft({
      id,
      form_state: { task_type: 'quick_lookup', objective: 'V2' },
    })
    const draft = await loadDraft(id)
    expect(draft?.form_state.objective).toBe('V2')
  })

  it('should list drafts ordered by updated_at desc', async () => {
    await saveDraft({ form_state: { objective: 'First' } })
    await saveDraft({ form_state: { objective: 'Second' } })

    const drafts = await listDrafts()
    expect(drafts).toHaveLength(2)
    expect(drafts[0].form_state.objective).toBe('Second')
  })

  it('should delete a draft', async () => {
    const id = await saveDraft({ form_state: { objective: 'Delete me' } })
    await deleteDraft(id)
    const draft = await loadDraft(id)
    expect(draft).toBeUndefined()
  })
})

describe('preset operations', () => {
  it('should save and list presets', async () => {
    await savePreset({
      name: 'My Template',
      form_state: { task_type: 'code_generation', objective: 'Write code' },
      ir: {} as any, // simplified for test
    })

    const presets = await listPresets()
    expect(presets).toHaveLength(1)
    expect(presets[0].name).toBe('My Template')
  })

  it('should delete a preset', async () => {
    const id = await savePreset({
      name: 'Temp',
      form_state: { objective: 'X' },
      ir: {} as any,
    })
    await deletePreset(id!)
    const presets = await listPresets()
    expect(presets).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Install fake-indexeddb for tests**

```bash
npm install -D fake-indexeddb
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- src/shared/db/__tests__/operations.test.ts
```

- [ ] **Step 4: Implement operations**

`src/shared/db/operations.ts`:
```ts
import { db, type DraftRecord, type PresetRecord } from './index'

// --- Drafts ---

export async function saveDraft(
  draft: Omit<DraftRecord, 'updated_at'> & { id?: number },
): Promise<number> {
  const now = new Date().toISOString()
  if (draft.id) {
    await db.drafts.update(draft.id, { ...draft, updated_at: now })
    return draft.id
  }
  return await db.drafts.add({ ...draft, updated_at: now } as DraftRecord)
}

export async function loadDraft(id: number): Promise<DraftRecord | undefined> {
  return db.drafts.get(id)
}

export async function listDrafts(limit = 20): Promise<DraftRecord[]> {
  return db.drafts.orderBy('updated_at').reverse().limit(limit).toArray()
}

export async function deleteDraft(id: number): Promise<void> {
  await db.drafts.delete(id)
}

// --- Presets ---

export async function savePreset(
  preset: Omit<PresetRecord, 'created_at' | 'updated_at'> & { id?: number },
): Promise<number | undefined> {
  const now = new Date().toISOString()
  if (preset.id) {
    await db.presets.update(preset.id, { ...preset, updated_at: now })
    return preset.id
  }
  return await db.presets.add({ ...preset, created_at: now, updated_at: now } as PresetRecord)
}

export async function listPresets(): Promise<PresetRecord[]> {
  return db.presets.orderBy('updated_at').reverse().toArray()
}

export async function deletePreset(id: number): Promise<void> {
  await db.presets.delete(id)
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/shared/db/__tests__/operations.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/shared/db/operations.ts src/shared/db/__tests__/operations.test.ts package.json package-lock.json
git commit -m "feat: implement Dexie CRUD operations for drafts and presets"
```

---

## Task 4.3: Create Zustand Builder Store

**Files:**
- Create: `src/shared/stores/builder-store.ts`

- [ ] **Step 1: Install Zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Implement builder store**

`src/shared/stores/builder-store.ts`:
```ts
import { create } from 'zustand'
import type { BuilderFormState } from '@/core/ir/form-types'
import type { IntentIR } from '@/core/ir/types'
import type { RenderMode, RenderResult } from '@/core/renderer/types'
import type { ValidationResult } from '@/core/ir/validator'

interface BuilderState {
  // Form
  formState: BuilderFormState
  setFormState: (state: BuilderFormState) => void
  updateField: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void
  resetForm: () => void

  // Compiled IR
  ir: IntentIR | null
  setIR: (ir: IntentIR) => void

  // Validation
  warnings: ValidationResult[]
  setWarnings: (warnings: ValidationResult[]) => void

  // Render
  renderMode: RenderMode
  setRenderMode: (mode: RenderMode) => void
  renderResult: RenderResult | null
  setRenderResult: (result: RenderResult) => void

  // Draft
  draftId: number | null
  setDraftId: (id: number | null) => void
}

const INITIAL_FORM: BuilderFormState = {}

export const useBuilderStore = create<BuilderState>((set) => ({
  formState: INITIAL_FORM,
  setFormState: (formState) => set({ formState }),
  updateField: (key, value) =>
    set((state) => ({ formState: { ...state.formState, [key]: value } })),
  resetForm: () => set({ formState: INITIAL_FORM, ir: null, warnings: [], renderResult: null, draftId: null }),

  ir: null,
  setIR: (ir) => set({ ir }),

  warnings: [],
  setWarnings: (warnings) => set({ warnings }),

  renderMode: 'hybrid-json',
  setRenderMode: (renderMode) => set({ renderMode }),
  renderResult: null,
  setRenderResult: (renderResult) => set({ renderResult }),

  draftId: null,
  setDraftId: (draftId) => set({ draftId }),
}))
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/stores/builder-store.ts package.json package-lock.json
git commit -m "feat: create Zustand builder store for form/IR/render state"
```

---

## Task 4.4: Create App Store

**Files:**
- Create: `src/shared/stores/app-store.ts`

- [ ] **Step 1: Implement app store**

`src/shared/stores/app-store.ts`:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  locale: 'zh' | 'en'
  setLocale: (locale: 'zh' | 'en') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'zh',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'intent-compiler-app' },
  ),
)
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/stores/app-store.ts
git commit -m "feat: create Zustand app store with locale persistence"
```

---

## Task 4.5: Create useCompiler Hook (Pipeline Integration)

The core hook that wires Form → Compiler → Validator → Renderer with 300ms debounce.

**Files:**
- Create: `src/shared/hooks/useDebounce.ts`, `src/shared/hooks/useCompiler.ts`

- [ ] **Step 1: Implement useDebounce**

`src/shared/hooks/useDebounce.ts`:
```ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

- [ ] **Step 2: Implement useCompiler**

`src/shared/hooks/useCompiler.ts`:
```ts
import { useEffect } from 'react'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { compileToIR } from '@/core/ir/compiler'
import { validateIR } from '@/core/ir/validator'
import { render } from '@/core/renderer'
import { useDebounce } from './useDebounce'

/**
 * Reactive pipeline: formState → (debounce 300ms) → compile → validate → render
 * Subscribes to builder store and auto-updates IR, warnings, and render result.
 */
export function useCompiler() {
  const formState = useBuilderStore((s) => s.formState)
  const renderMode = useBuilderStore((s) => s.renderMode)
  const setIR = useBuilderStore((s) => s.setIR)
  const setWarnings = useBuilderStore((s) => s.setWarnings)
  const setRenderResult = useBuilderStore((s) => s.setRenderResult)

  const debouncedForm = useDebounce(formState, 300)

  useEffect(() => {
    const ir = compileToIR(debouncedForm)
    setIR(ir)

    const warnings = validateIR(ir)
    setWarnings(warnings)

    const result = render(ir, renderMode)
    setRenderResult(result)
  }, [debouncedForm, renderMode, setIR, setWarnings, setRenderResult])
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/hooks/useDebounce.ts src/shared/hooks/useCompiler.ts
git commit -m "feat: create useCompiler hook — reactive form→IR→render pipeline"
```

---

## Task 4.6: Create useDraft Hook (Auto-Save)

Auto-saves draft to IndexedDB every 5 seconds when form changes.

**Files:**
- Create: `src/shared/hooks/useDraft.ts`

- [ ] **Step 1: Implement useDraft**

`src/shared/hooks/useDraft.ts`:
```ts
import { useEffect, useRef } from 'react'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { saveDraft } from '@/shared/db/operations'

const AUTO_SAVE_INTERVAL = 5000

export function useDraft() {
  const formState = useBuilderStore((s) => s.formState)
  const ir = useBuilderStore((s) => s.ir)
  const draftId = useBuilderStore((s) => s.draftId)
  const setDraftId = useBuilderStore((s) => s.setDraftId)
  const lastSaved = useRef<string>('')

  useEffect(() => {
    const serialized = JSON.stringify(formState)
    if (serialized === lastSaved.current) return
    if (serialized === '{}') return // don't save empty forms

    const timer = setTimeout(async () => {
      const id = await saveDraft({
        id: draftId ?? undefined,
        form_state: formState,
        ir: ir ?? undefined,
        title: formState.objective || formState.task_type || 'Untitled',
      })
      if (!draftId) setDraftId(id)
      lastSaved.current = serialized
    }, AUTO_SAVE_INTERVAL)

    return () => clearTimeout(timer)
  }, [formState, ir, draftId, setDraftId])
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/hooks/useDraft.ts
git commit -m "feat: create useDraft hook — auto-save to IndexedDB every 5s"
```
