# Chunk 8: Template Management & Final Polish

> Parent: [00-overview.md](00-overview.md) | Depends on: [07-ui-builder.md](07-ui-builder.md)

---

## Task 8.1: Implement Templates Page

**Files:**
- Create: `src/features/templates/components/TemplateList.tsx`, `src/features/templates/components/TemplateDetail.tsx`
- Modify: `src/features/templates/TemplatesPage.tsx`

- [ ] **Step 1: Implement TemplateList**

`src/features/templates/components/TemplateList.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { listPresets, deletePreset } from '@/shared/db/operations'
import type { PresetRecord } from '@/shared/db/index'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Props {
  onSelect: (preset: PresetRecord) => void
}

export function TemplateList({ onSelect }: Props) {
  const { t } = useTranslation()
  const [presets, setPresets] = useState<PresetRecord[]>([])

  const refresh = () => listPresets().then(setPresets)

  useEffect(() => { refresh() }, [])

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await deletePreset(id)
    refresh()
  }

  if (presets.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>No saved templates yet.</p>
        <p className="text-sm mt-1">Build an intent and save it as a template to see it here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {presets.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(p)}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{p.name}</CardTitle>
              <CardDescription>
                {p.form_state.task_type} &middot; {new Date(p.updated_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDelete(p.id!, e)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Implement TemplateDetail**

`src/features/templates/components/TemplateDetail.tsx`:
```tsx
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { render } from '@/core/renderer'
import type { PresetRecord } from '@/shared/db/index'

interface Props {
  preset: PresetRecord
  onBack: () => void
}

export function TemplateDetail({ preset, onBack }: Props) {
  const navigate = useNavigate()
  const rendered = render(preset.ir)

  const handleUse = () => {
    navigate(`/build?preset=${preset.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
        <h2 className="text-lg font-medium">{preset.name}</h2>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4 bg-muted/30">
        <pre className="whitespace-pre-wrap text-sm font-mono">{rendered.output}</pre>
      </ScrollArea>

      <Button onClick={handleUse}>Use this template</Button>
    </div>
  )
}
```

- [ ] **Step 3: Implement TemplatesPage**

`src/features/templates/TemplatesPage.tsx`:
```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TemplateList } from './components/TemplateList'
import { TemplateDetail } from './components/TemplateDetail'
import type { PresetRecord } from '@/shared/db/index'

export function TemplatesPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<PresetRecord | null>(null)

  if (selected) {
    return <TemplateDetail preset={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('app.nav.templates')}</h1>
      <TemplateList onSelect={setSelected} />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/templates/
git commit -m "feat: implement Templates management page"
```

---

## Task 8.2: Support Loading Presets in Builder

When navigating to `/build?preset=123`, load the saved preset's form_state into the builder.

**Files:**
- Modify: `src/features/builder/BuilderPage.tsx`

- [ ] **Step 1: Add preset loading to the useEffect in BuilderPage**

In the existing `useEffect`, add an `else if` branch after the `draftIdParam` check:

```ts
else if (presetIdParam) {
  // Load from a saved preset — import loadPreset or use db.presets.get
  import('@/shared/db/index').then(({ db }) => {
    db.presets.get(Number(presetIdParam)).then((preset) => {
      if (preset) {
        setFormState(preset.form_state)
      }
    })
  })
}
```

Also read `presetIdParam` from search params:
```ts
const presetIdParam = searchParams.get('preset')
```

- [ ] **Step 2: Verify flow end-to-end**

1. Go to Home → click a template card → lands on Builder with defaults
2. Fill in objective → right panel shows live preview
3. Click "Save as Template" → navigate to Templates page → see saved template
4. Click saved template → click "Use this template" → Builder loads with that form state

- [ ] **Step 3: Commit**

```bash
git add src/features/builder/BuilderPage.tsx
git commit -m "feat: support loading saved presets in Builder page"
```

---

## Task 8.3: Install lucide-react Icons

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install lucide-react
```

> lucide-react is required by shadcn/ui and FieldGroup's ChevronDown icon. It may already be installed during shadcn init; verify first.

- [ ] **Step 2: Commit if new dependency**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react icons"
```

---

## Task 8.4: Cleanup & Verify Full App

- [ ] **Step 1: Remove Vite default boilerplate**

Delete `src/App.css`, `src/assets/react.svg`, and any leftover default content. Ensure `src/index.css` only contains Tailwind imports + shadcn CSS variables.

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Fix any remaining type errors.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass (IR schema, compiler, validator, presets, DB operations).

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```

Verify:
- [ ] Home page shows 8 template cards
- [ ] Clicking a card navigates to Builder with pre-filled form
- [ ] Typing in objective triggers live preview (300ms debounce)
- [ ] Switching render mode changes preview format
- [ ] Validation warnings appear for conflicting answer_mode combos
- [ ] Copy button copies rendered output to clipboard
- [ ] Save template persists to IndexedDB
- [ ] Templates page shows saved templates
- [ ] Draft auto-saves after 5s of inactivity

- [ ] **Step 5: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove boilerplate, verify full app integration"
```

---

## Task 8.5: Configure Cloudflare Pages Deployment

**Files:**
- Create: `wrangler.toml` (or use Cloudflare dashboard)

- [ ] **Step 1: Add build command to package.json**

Verify `"build": "tsc && vite build"` exists in scripts.

- [ ] **Step 2: Create wrangler config (optional — can use dashboard instead)**

`wrangler.toml`:
```toml
name = "intent-compiler"
compatibility_date = "2026-04-05"

[site]
bucket = "./dist"
```

- [ ] **Step 3: Test production build locally**

```bash
npm run build && npx wrangler pages dev dist
```

Expected: Production build works, SPA routing functions correctly.

- [ ] **Step 4: Commit**

```bash
git add wrangler.toml package.json
git commit -m "chore: configure Cloudflare Pages deployment"
```
