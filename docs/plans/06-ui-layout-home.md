# Chunk 6: i18n, Routing, Layout & Home Page

> Parent: [00-overview.md](00-overview.md) | Depends on: [01-bootstrap-types.md](01-bootstrap-types.md)

## Task 6.1: Set Up i18n

**Files:**
- Create: `src/shared/i18n/index.ts`, `src/shared/i18n/zh.json`, `src/shared/i18n/en.json`

- [ ] **Step 1: Install i18next**

```bash
npm install react-i18next i18next
```

- [ ] **Step 2: Create Chinese translation file**

`src/shared/i18n/zh.json`:
```json
{
  "app": {
    "title": "Intent Compiler",
    "nav": {
      "home": "首页",
      "builder": "构建",
      "templates": "模板"
    }
  },
  "home": {
    "title": "选择任务类型",
    "subtitle": "选择一个模板开始构建你的意图",
    "recent_drafts": "最近草稿"
  },
  "builder": {
    "objective": "任务目标",
    "objective_placeholder": "请描述你想让 AI 完成的任务...",
    "context": "背景信息",
    "background": "背景",
    "current_state": "当前状态",
    "inputs": "输入数据",
    "constraints": "约束条件",
    "must_consider": "必须考虑",
    "must_not": "禁止事项",
    "output": "输出要求",
    "format": "格式",
    "shape": "输出结构",
    "length": "篇幅",
    "answer_mode": "回答模式",
    "production_aware": "生产视角",
    "challenge_assumptions": "质疑前提",
    "recommend_first": "先给推荐",
    "explore_alternatives": "探索备选",
    "step_by_step": "逐步推导",
    "style": "风格",
    "tone": "语调",
    "verbosity": "详细程度",
    "audience": "目标受众",
    "preview": "预览",
    "copy": "复制",
    "save_template": "保存为模板",
    "copied": "已复制"
  },
  "template": {
    "production_evaluation": { "name": "生产评估", "description": "从上线落地视角评估方案" },
    "mechanism_check": { "name": "机制检查", "description": "验证技术逻辑的正确性" },
    "problem_modeling": { "name": "问题建模", "description": "定义和分析问题框架" },
    "quick_lookup": { "name": "快速查找", "description": "快速获取信息" },
    "code_generation": { "name": "代码生成", "description": "编写或调试代码" },
    "comparison_decision": { "name": "对比决策", "description": "对比选项并做出决定" },
    "open_exploration": { "name": "开放探索", "description": "自由头脑风暴" },
    "text_rewrite": { "name": "文本改写", "description": "编辑、精简或重新格式化文本" }
  },
  "render_mode": {
    "hybrid-json": "混合 JSON",
    "natural-language": "自然语言",
    "hybrid-text": "混合文本",
    "pure-json": "纯 JSON"
  }
}
```

- [ ] **Step 3: Create English translation file**

`src/shared/i18n/en.json`:
```json
{
  "app": {
    "title": "Intent Compiler",
    "nav": {
      "home": "Home",
      "builder": "Builder",
      "templates": "Templates"
    }
  },
  "home": {
    "title": "Choose Task Type",
    "subtitle": "Select a template to start building your intent",
    "recent_drafts": "Recent Drafts"
  },
  "builder": {
    "objective": "Objective",
    "objective_placeholder": "Describe the task you want AI to complete...",
    "context": "Context",
    "background": "Background",
    "current_state": "Current State",
    "inputs": "Inputs",
    "constraints": "Constraints",
    "must_consider": "Must Consider",
    "must_not": "Must Not",
    "output": "Output",
    "format": "Format",
    "shape": "Output Shape",
    "length": "Length",
    "answer_mode": "Answer Mode",
    "production_aware": "Production Aware",
    "challenge_assumptions": "Challenge Assumptions",
    "recommend_first": "Recommend First",
    "explore_alternatives": "Explore Alternatives",
    "step_by_step": "Step by Step",
    "style": "Style",
    "tone": "Tone",
    "verbosity": "Verbosity",
    "audience": "Audience",
    "preview": "Preview",
    "copy": "Copy",
    "save_template": "Save as Template",
    "copied": "Copied"
  },
  "template": {
    "production_evaluation": { "name": "Production Evaluation", "description": "Evaluate designs from a go-live perspective" },
    "mechanism_check": { "name": "Mechanism Check", "description": "Verify technical logic correctness" },
    "problem_modeling": { "name": "Problem Modeling", "description": "Define and analyze problem framing" },
    "quick_lookup": { "name": "Quick Lookup", "description": "Fast information retrieval" },
    "code_generation": { "name": "Code Generation", "description": "Write or debug code" },
    "comparison_decision": { "name": "Comparison & Decision", "description": "Compare options and decide" },
    "open_exploration": { "name": "Open Exploration", "description": "Unconstrained brainstorming" },
    "text_rewrite": { "name": "Text Rewrite", "description": "Edit, condense, or reformat text" }
  },
  "render_mode": {
    "hybrid-json": "Hybrid JSON",
    "natural-language": "Natural Language",
    "hybrid-text": "Hybrid Text",
    "pure-json": "Pure JSON"
  }
}
```

- [ ] **Step 4: Configure i18next**

`src/shared/i18n/index.ts`:
```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './zh.json'
import en from './en.json'

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
})

export default i18n
```

- [ ] **Step 5: Import i18n in main.tsx**

Add `import '@/shared/i18n'` at the top of `src/main.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/shared/i18n/ src/main.tsx package.json package-lock.json
git commit -m "feat: set up i18n with Chinese and English translations"
```

---

## Task 6.2: Configure React Router

**Files:**
- Create: `src/router.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install React Router**

```bash
npm install react-router
```

- [ ] **Step 2: Create router config**

`src/router.tsx`:
```tsx
import { createBrowserRouter } from 'react-router'
import { Layout } from '@/shared/components/Layout'
import { HomePage } from '@/features/home/HomePage'
import { BuilderPage } from '@/features/builder/BuilderPage'
import { TemplatesPage } from '@/features/templates/TemplatesPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/build/:id?', element: <BuilderPage /> },
      { path: '/templates', element: <TemplatesPage /> },
    ],
  },
])
```

- [ ] **Step 3: Update App.tsx**

`src/App.tsx`:
```tsx
import { RouterProvider } from 'react-router'
import { router } from './router'

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 4: Create placeholder page components**

Create minimal placeholder exports so the router compiles:

`src/features/home/HomePage.tsx`:
```tsx
export function HomePage() {
  return <div>Home</div>
}
```

`src/features/builder/BuilderPage.tsx`:
```tsx
export function BuilderPage() {
  return <div>Builder</div>
}
```

`src/features/templates/TemplatesPage.tsx`:
```tsx
export function TemplatesPage() {
  return <div>Templates</div>
}
```

- [ ] **Step 5: Commit**

```bash
git add src/router.tsx src/App.tsx src/features/ package.json package-lock.json
git commit -m "feat: configure React Router with 3 routes"
```

---

## Task 6.3: Build Layout Shell & Navigation

**Files:**
- Create: `src/shared/components/Layout.tsx`, `src/shared/components/AppNav.tsx`

- [ ] **Step 1: Implement AppNav**

`src/shared/components/AppNav.tsx`:
```tsx
import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', label: 'app.nav.home' },
  { path: '/build', label: 'app.nav.builder' },
  { path: '/templates', label: 'app.nav.templates' },
] as const

export function AppNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <nav className="flex items-center gap-6 border-b px-6 h-14">
      <span className="font-semibold text-lg mr-4">{t('app.title')}</span>
      {NAV_ITEMS.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            'text-sm transition-colors hover:text-foreground',
            pathname === path ? 'text-foreground font-medium' : 'text-muted-foreground',
          )}
        >
          {t(label)}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Implement Layout**

`src/shared/components/Layout.tsx`:
```tsx
import { Outlet } from 'react-router'
import { AppNav } from './AppNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: App shell renders with nav bar, clicking links switches content area.

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/Layout.tsx src/shared/components/AppNav.tsx
git commit -m "feat: build Layout shell with navigation"
```

---

## Task 6.4: Implement Home Page

Per PRD `docs/prd/08-user-flows.md`: Home shows template cards for selecting task type + recent drafts.

**Files:**
- Create: `src/features/home/components/TemplateCard.tsx`, `src/features/home/components/RecentDrafts.tsx`
- Modify: `src/features/home/HomePage.tsx`

- [ ] **Step 1: Implement TemplateCard**

`src/features/home/components/TemplateCard.tsx`:
```tsx
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { TemplateDefinition } from '@/core/template/types'

interface Props {
  template: TemplateDefinition
}

export function TemplateCard({ template }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/build?template=${template.task_type}`)}
    >
      <CardHeader>
        <CardTitle className="text-base">
          {t(`template.${template.task_type}.name`)}
        </CardTitle>
        <CardDescription>
          {t(`template.${template.task_type}.description`)}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
```

- [ ] **Step 2: Implement RecentDrafts**

`src/features/home/components/RecentDrafts.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { listDrafts } from '@/shared/db/operations'
import type { DraftRecord } from '@/shared/db/index'

export function RecentDrafts() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<DraftRecord[]>([])

  useEffect(() => {
    listDrafts(5).then(setDrafts)
  }, [])

  if (drafts.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-medium mb-3">{t('home.recent_drafts')}</h2>
      <div className="space-y-2">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-accent transition-colors"
            onClick={() => navigate(`/build?draft=${draft.id}`)}
          >
            <span className="text-sm">{draft.title || 'Untitled'}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(draft.updated_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Implement HomePage**

`src/features/home/HomePage.tsx`:
```tsx
import { useTranslation } from 'react-i18next'
import { ALL_PRESETS } from '@/core/template/presets'
import { TemplateCard } from './components/TemplateCard'
import { RecentDrafts } from './components/RecentDrafts'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-1">{t('home.title')}</h1>
        <p className="text-muted-foreground mb-4">{t('home.subtitle')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_PRESETS.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      </section>
      <RecentDrafts />
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Expected: 8 template cards displayed in a grid, clicking a card navigates to `/build?template=<type>`.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/
git commit -m "feat: implement Home page with template cards and recent drafts"
```
