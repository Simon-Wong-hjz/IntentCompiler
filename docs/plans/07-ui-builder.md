# Chunk 7: Builder Page

> Parent: [00-overview.md](00-overview.md) | Depends on: [04-data-layer.md](04-data-layer.md), [05-template-system.md](05-template-system.md), [06-ui-layout-home.md](06-ui-layout-home.md)

The Builder is the core page. Per PRD `docs/prd/09-interaction-design.md`:
- Left-right split layout (form left, preview right)
- "先任务后细节" — task type + objective first, details after
- Template controls which optional fields are visible
- 300ms debounce triggers real-time preview on the right

---

## Task 7.1: Implement BuilderForm Component

**Files:**
- Create: `src/features/builder/components/BuilderForm.tsx`, `src/features/builder/components/FieldGroup.tsx`

- [ ] **Step 1: Install react-hook-form**

```bash
npm install react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Implement FieldGroup (collapsible section)**

`src/features/builder/components/FieldGroup.tsx`:
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function FieldGroup({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-accent transition-colors">
        {title}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
```

- [ ] **Step 3: Implement BuilderForm**

`src/features/builder/components/BuilderForm.tsx`:
```tsx
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FieldGroup } from './FieldGroup'
import type { FieldVisibility } from '@/core/template/types'
import type { BuilderFormState } from '@/core/ir/form-types'

interface Props {
  visibility: FieldVisibility
  placeholder?: string
}

export function BuilderForm({ visibility, placeholder }: Props) {
  const { t } = useTranslation()
  const formState = useBuilderStore((s) => s.formState)
  const updateField = useBuilderStore((s) => s.updateField)

  return (
    <div className="space-y-4">
      {/* Objective — always visible, always first */}
      <div className="space-y-2">
        <Label htmlFor="objective">{t('builder.objective')}</Label>
        <Textarea
          id="objective"
          placeholder={placeholder || t('builder.objective_placeholder')}
          value={formState.objective ?? ''}
          onChange={(e) => updateField('objective', e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Context section */}
      {(visibility.context_background || visibility.context_current_state || visibility.context_inputs) && (
        <FieldGroup title={t('builder.context')}>
          {visibility.context_background && (
            <div className="space-y-1">
              <Label htmlFor="bg">{t('builder.background')}</Label>
              <Textarea
                id="bg"
                value={formState.context_background ?? ''}
                onChange={(e) => updateField('context_background', e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          )}
          {visibility.context_current_state && (
            <div className="space-y-1">
              <Label htmlFor="state">{t('builder.current_state')}</Label>
              <Textarea
                id="state"
                value={formState.context_current_state ?? ''}
                onChange={(e) => updateField('context_current_state', e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          )}
          {visibility.context_inputs && (
            <div className="space-y-1">
              <Label htmlFor="inputs">{t('builder.inputs')}</Label>
              <Input
                id="inputs"
                placeholder="Comma-separated values"
                value={formState.context_inputs?.join(', ') ?? ''}
                onChange={(e) =>
                  updateField('context_inputs', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                }
              />
            </div>
          )}
        </FieldGroup>
      )}

      {/* Constraints */}
      {visibility.constraints && (
        <FieldGroup title={t('builder.constraints')}>
          <div className="space-y-1">
            <Label>{t('builder.must_consider')}</Label>
            <Textarea
              placeholder="One per line"
              value={formState.must_consider?.map(c => typeof c === 'string' ? c : c.text).join('\n') ?? ''}
              onChange={(e) =>
                updateField('must_consider', e.target.value.split('\n').filter(Boolean))
              }
              className="min-h-[60px]"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('builder.must_not')}</Label>
            <Textarea
              placeholder="One per line"
              value={formState.must_not?.map(c => typeof c === 'string' ? c : c.text).join('\n') ?? ''}
              onChange={(e) =>
                updateField('must_not', e.target.value.split('\n').filter(Boolean))
              }
              className="min-h-[60px]"
            />
          </div>
        </FieldGroup>
      )}

      {/* Output spec */}
      {(visibility.output_format || visibility.output_shape || visibility.output_length) && (
        <FieldGroup title={t('builder.output')}>
          {visibility.output_format && (
            <div className="space-y-1">
              <Label>{t('builder.format')}</Label>
              <select
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                value={formState.output_format ?? 'prose'}
                onChange={(e) => updateField('output_format', e.target.value as any)}
              >
                <option value="prose">Prose</option>
                <option value="bullet_list">Bullet List</option>
                <option value="numbered_list">Numbered List</option>
                <option value="table">Table</option>
                <option value="code_block">Code Block</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
          )}
          {visibility.output_shape && (
            <div className="space-y-1">
              <Label>{t('builder.shape')}</Label>
              <Input
                placeholder="Comma-separated: conclusion, evidence, caveats"
                value={formState.output_shape?.join(', ') ?? ''}
                onChange={(e) =>
                  updateField('output_shape', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                }
              />
            </div>
          )}
          {visibility.output_length && (
            <div className="space-y-1">
              <Label>{t('builder.length')}</Label>
              <select
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                value={formState.output_length ?? 'moderate'}
                onChange={(e) => updateField('output_length', e.target.value as any)}
              >
                <option value="concise">Concise</option>
                <option value="moderate">Moderate</option>
                <option value="detailed">Detailed</option>
                <option value="exhaustive">Exhaustive</option>
              </select>
            </div>
          )}
        </FieldGroup>
      )}

      {/* Answer mode */}
      {visibility.answer_mode && (
        <FieldGroup title={t('builder.answer_mode')}>
          {(['production_aware', 'challenge_assumptions', 'recommend_first', 'explore_alternatives', 'step_by_step'] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{t(`builder.${key}`)}</Label>
              <Switch
                checked={formState[key] ?? false}
                onCheckedChange={(checked) => updateField(key, checked)}
              />
            </div>
          ))}
        </FieldGroup>
      )}

      {/* Style */}
      {visibility.style && (
        <FieldGroup title={t('builder.style')}>
          <div className="space-y-1">
            <Label>{t('builder.tone')}</Label>
            <select
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              value={formState.tone ?? 'formal'}
              onChange={(e) => updateField('tone', e.target.value as any)}
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="instructional">Instructional</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t('builder.verbosity')}</Label>
            <select
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              value={formState.verbosity ?? 'balanced'}
              onChange={(e) => updateField('verbosity', e.target.value as any)}
            >
              <option value="minimal">Minimal</option>
              <option value="balanced">Balanced</option>
              <option value="verbose">Verbose</option>
            </select>
          </div>
        </FieldGroup>
      )}

      {/* Audience */}
      {visibility.audience && (
        <div className="space-y-1">
          <Label>{t('builder.audience')}</Label>
          <select
            className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            value={formState.audience ?? 'general'}
            onChange={(e) => updateField('audience', e.target.value as any)}
          >
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="senior_engineer">Senior Engineer</option>
            <option value="manager">Manager</option>
            <option value="non_technical">Non-technical</option>
          </select>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/builder/components/BuilderForm.tsx src/features/builder/components/FieldGroup.tsx package.json package-lock.json
git commit -m "feat: implement BuilderForm with template-driven field visibility"
```

---

## Task 7.2: Implement Preview Panel

**Files:**
- Create: `src/features/builder/components/PreviewPanel.tsx`, `src/features/builder/components/RendererSelector.tsx`, `src/features/builder/components/ValidationWarnings.tsx`, `src/features/builder/components/CopyExportBar.tsx`

- [ ] **Step 1: Implement RendererSelector**

`src/features/builder/components/RendererSelector.tsx`:
```tsx
import { useTranslation } from 'react-i18next'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { getAvailableModes } from '@/core/renderer'
import type { RenderMode } from '@/core/renderer/types'

export function RendererSelector() {
  const { t } = useTranslation()
  const mode = useBuilderStore((s) => s.renderMode)
  const setMode = useBuilderStore((s) => s.setRenderMode)

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-md">
      {getAvailableModes().map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            mode === m ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t(`render_mode.${m}`)}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Implement ValidationWarnings**

`src/features/builder/components/ValidationWarnings.tsx`:
```tsx
import { useBuilderStore } from '@/shared/stores/builder-store'
import { Badge } from '@/components/ui/badge'

export function ValidationWarnings() {
  const warnings = useBuilderStore((s) => s.warnings)

  if (warnings.length === 0) return null

  return (
    <div className="space-y-2">
      {warnings.map((w) => (
        <div
          key={w.rule_id}
          className="flex items-start gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-sm"
        >
          <Badge variant="outline" className="shrink-0 text-yellow-700">
            {w.rule_id}
          </Badge>
          <div>
            <p>{w.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{w.resolution}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Implement CopyExportBar**

`src/features/builder/components/CopyExportBar.tsx`:
```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { savePreset } from '@/shared/db/operations'
import { Button } from '@/components/ui/button'

export function CopyExportBar() {
  const { t } = useTranslation()
  const renderResult = useBuilderStore((s) => s.renderResult)
  const formState = useBuilderStore((s) => s.formState)
  const ir = useBuilderStore((s) => s.ir)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!renderResult) return
    await navigator.clipboard.writeText(renderResult.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveTemplate = async () => {
    if (!ir) return
    const name = formState.objective?.slice(0, 50) || 'Untitled'
    await savePreset({ name, form_state: formState, ir })
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleCopy} disabled={!renderResult} size="sm">
        {copied ? t('builder.copied') : t('builder.copy')}
      </Button>
      <Button onClick={handleSaveTemplate} disabled={!ir} variant="outline" size="sm">
        {t('builder.save_template')}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Implement PreviewPanel**

`src/features/builder/components/PreviewPanel.tsx`:
```tsx
import { useTranslation } from 'react-i18next'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RendererSelector } from './RendererSelector'
import { ValidationWarnings } from './ValidationWarnings'
import { CopyExportBar } from './CopyExportBar'

export function PreviewPanel() {
  const { t } = useTranslation()
  const renderResult = useBuilderStore((s) => s.renderResult)

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{t('builder.preview')}</h2>
        <RendererSelector />
      </div>

      <ValidationWarnings />

      <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/30">
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {renderResult?.output || ''}
        </pre>
      </ScrollArea>

      <CopyExportBar />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/builder/components/PreviewPanel.tsx src/features/builder/components/RendererSelector.tsx src/features/builder/components/ValidationWarnings.tsx src/features/builder/components/CopyExportBar.tsx
git commit -m "feat: implement preview panel with renderer selector, warnings, copy/export"
```

---

## Task 7.3: Wire Up BuilderPage

**Files:**
- Modify: `src/features/builder/BuilderPage.tsx`

- [ ] **Step 1: Implement BuilderPage with template loading and split layout**

`src/features/builder/BuilderPage.tsx`:
```tsx
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useBuilderStore } from '@/shared/stores/builder-store'
import { useCompiler } from '@/shared/hooks/useCompiler'
import { useDraft } from '@/shared/hooks/useDraft'
import { getPreset } from '@/core/template/presets'
import { loadDraft } from '@/shared/db/operations'
import { BuilderForm } from './components/BuilderForm'
import { PreviewPanel } from './components/PreviewPanel'
import type { TaskType } from '@/core/ir/types'

/** Default field visibility when no template is loaded */
const DEFAULT_VISIBILITY = {
  context_background: true,
  context_current_state: true,
  context_inputs: true,
  constraints: true,
  output_format: true,
  output_shape: true,
  output_length: true,
  answer_mode: true,
  style: true,
  audience: true,
}

export function BuilderPage() {
  const [searchParams] = useSearchParams()
  const setFormState = useBuilderStore((s) => s.setFormState)
  const setDraftId = useBuilderStore((s) => s.setDraftId)
  const formState = useBuilderStore((s) => s.formState)

  // Activate pipeline hooks
  useCompiler()
  useDraft()

  // Load from template or draft on mount
  useEffect(() => {
    const templateType = searchParams.get('template') as TaskType | null
    const draftIdParam = searchParams.get('draft')

    if (templateType) {
      const preset = getPreset(templateType)
      if (preset) {
        setFormState({ ...preset.defaults })
      }
    } else if (draftIdParam) {
      loadDraft(Number(draftIdParam)).then((draft) => {
        if (draft) {
          setFormState(draft.form_state)
          setDraftId(draft.id!)
        }
      })
    }
  }, [searchParams, setFormState, setDraftId])

  // Determine active template for field visibility
  const preset = formState.task_type ? getPreset(formState.task_type) : undefined
  const visibility = preset?.field_visibility ?? DEFAULT_VISIBILITY
  const placeholder = preset?.placeholder_objective

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      <div className="overflow-y-auto pr-2">
        <BuilderForm visibility={visibility} placeholder={placeholder} />
      </div>
      <div className="overflow-hidden">
        <PreviewPanel />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/?template=code_generation`. Expected: Form loads with code_generation defaults, right panel shows live preview.

- [ ] **Step 3: Commit**

```bash
git add src/features/builder/BuilderPage.tsx
git commit -m "feat: wire up BuilderPage with template loading and split layout"
```
