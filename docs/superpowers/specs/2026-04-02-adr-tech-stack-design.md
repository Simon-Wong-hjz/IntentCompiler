# ADR: Intent Compiler 技术选型与架构设计

> 日期：2026-04-02
> 状态：Accepted
> 决策者：Simon Huang（solo developer）

---

## 1. 背景与目标

Intent Compiler 是一个面向高频 AI 用户的意图编译产品，以模板为入口、Prompt IR 为内核、Renderer 为出口，将用户任务意图编译为稳定可复用的 prompt。

本 ADR 记录 MVP 阶段的所有技术选型与架构决策，作为后续开发的约束基线。

### 项目约束

- **一人团队**：所有选型必须以开发效率和维护简单度为第一优先级
- **MVP 优先**：避免过度工程化，只解决当前已确认的需求
- **纯前端**：MVP 阶段无后端服务，零运维成本

---

## 2. 技术选型决策

### 2.1 产品形态：Web App (SPA)

**决策：** 浏览器访问的单页应用。

**理由：**
- 最低分发门槛，天然跨平台
- MVP 阶段迭代最快
- 不依赖特定 AI 平台
- 浏览器插件可作为 Phase 2+ 扩展

**否决方案：** 桌面应用（Electron/Tauri 增加构建复杂度）、浏览器插件（绑定特定平台）。

### 2.2 前端框架：React + Vite

**决策：** React 作为 UI 框架，Vite 作为构建工具。

**理由：**
- Intent Compiler 是工具型 SPA，不需要 SSR/SSG，Next.js 的服务端能力是多余复杂度
- React 生态有大量成熟的表单库、JSON editor 组件、实时预览方案
- Vite 开发体验快、配置轻，与 Vitest 零配置集成

**否决方案：** Next.js（SSR 不需要）、Vue 3（生态略小）、Svelte（生态和社区资源少）。

### 2.3 表单库：react-hook-form

**决策：** react-hook-form 作为表单管理方案。

**理由：**
- 产品核心交互是表单驱动，表单库是关键依赖
- react-hook-form 性能优异（非受控组件，最小化 re-render）
- 支持 schema 验证（配合 zod）、动态字段、嵌套对象
- 与 shadcn/ui 组件无缝集成（官方有适配示例）

### 2.4 路由：React Router v7

**决策：** React Router 作为客户端路由方案。

**理由：**
- React 生态最成熟的路由库，文档和社区资源丰富
- 支持 URL 参数和 search params，满足 `/build?template=code_gen` 等路由需求
- 一人项目选最稳定、最熟悉的方案

**否决方案：** TanStack Router（功能更强但生态较新）。

### 2.5 后端：无（纯前端）

**决策：** MVP 阶段不设后端服务。

**理由：**
- PRD 明确 MVP 只做个人模板，不涉及团队共享和云同步
- 一人团队同时维护前后端是不必要的负担
- IR 编译、渲染、模板管理全部可在浏览器端完成
- 后续需要云端时可接入 Supabase 等 BaaS

### 2.6 UI 组件库：shadcn/ui + Tailwind CSS

**决策：** shadcn/ui 作为组件库，Tailwind CSS 作为样式方案。

**理由：**
- 表单组件、Select、Dialog、Tabs 等开箱即有
- 组件代码在项目中可完全控制，不被框架锁定
- 社区模板和示例丰富
- 对 i18n 中性——组件无内置文案，不阻碍多语言

**否决方案：** Ant Design（样式重、定制成本高）、纯 Tailwind 手撸（一人团队造轮子成本高）。

### 2.7 国际化：react-i18next

**决策：** react-i18next 管理中英双语。

**理由：**
- React 生态最成熟的 i18n 方案
- JSON 文件管理翻译，结构清晰
- 与 shadcn/ui 无冲突
- 支持模板句式，可用于 Renderer 的自然语言段生成

**i18n 范围：**
- UI 文案（字段标签、按钮、提示）
- 模板名称和描述
- Renderer 自然语言句式模板
- 校验规则提示信息

### 2.8 数据持久化：IndexedDB + Dexie.js

**决策：** Dexie.js 封装 IndexedDB 作为本地持久化方案。

**理由：**
- 模板和 IR 是结构化数据，IndexedDB 天然适合
- Dexie 提供类 ORM 的 API，开发体验接近操作数据库
- 内置 schema 版本迁移，对应 IR 的 `schema_version` 演进需求
- 容量充裕（几百 MB+），不用担心模板积累后撑爆
- 后续加云同步时 `dexie-cloud-addon` 提供平滑迁移路径

**否决方案：** localStorage（5-10MB 上限，无结构化查询）、直接用 IndexedDB（原生 API 极难用）。

### 2.9 状态管理：Zustand

**决策：** Zustand 作为全局状态管理方案。

**理由：**
- 极简，几乎无 boilerplate
- 表单状态 → IR 编译 → 渲染预览的数据流用 `subscribe` + selector 很自然
- 支持 `persist` 中间件，可与 Dexie 配合
- 调试有 devtools 中间件

**否决方案：** Redux Toolkit（boilerplate 过重）、Jotai（学习曲线高）、React Context（复杂度上来后 re-render 难管理）。

### 2.10 AI Assist 接入：用户自带 API Key + 抽象接口（Phase 2 预留）

**决策：** 抽象 `AIService` 接口作为 Phase 2 预留。MVP 可选择性支持用户自带 OpenAI/Anthropic API Key 直连。

**注意：AI Assist 是 Phase 2 功能，不属于 MVP 核心交付范围。** 以下接口定义仅为架构预留，确保 MVP 代码结构不阻碍后续接入。

**理由：**
- PRD 明确 AI Assist 是 Phase 2，但预留抽象接口成本极低（一个 TypeScript interface）
- 目标用户（高频 AI 用户）大概率已有 API Key
- 不引入任何后端依赖
- 接口抽象后，后续换成托管服务只需新增实现类

### 2.11 部署：阿里云 + Nginx + GitHub Actions

**决策：** 使用现有阿里云服务器，Nginx 托管静态文件，GitHub Actions 自动部署。

**理由：**
- 已有基础设施，零额外成本
- 纯静态文件部署，Nginx 配置极简
- GitHub Actions 实现 push 即部署

### 2.12 测试：Vitest，聚焦核心模块

**决策：** Vitest 作为测试框架，MVP 阶段只测核心编译/渲染逻辑。

**理由：**
- 一人项目全覆盖测试不现实
- IR 编译器和 Renderer 是产品核心，必须有回归保护
- Renderer 使用 snapshot 测试防止渲染回归
- Vitest 与 Vite 零配置集成
- UI 层和 E2E 测试后续稳定后再补

---

## 3. 应用架构设计

### 3.1 代码组织：按领域模块

```
src/
  core/
    ir/                # IR 类型定义、编译器、校验器
      types.ts         # PromptIR, CompileResult 等类型
      compiler.ts      # IR Compiler 实现
      validator.ts     # 校验引擎
      rules/           # 声明式校验规则
    renderer/          # Renderer 实现
      types.ts         # RenderOptions, FieldPromotionRule 等
      hybrid-json.ts   # 混合 JSON Renderer (MVP 默认)
      natural-lang.ts  # 纯自然语言 Renderer (MVP)
      hybrid-text.ts   # 混合文本 Renderer (Phase 2)
      pure-json.ts     # 纯 JSON Renderer (Phase 2，高级用户)
      promotion.ts     # 字段分层投放逻辑
    template/          # 模板系统
      types.ts         # TemplateDefinition, FieldConfig 等
      presets/         # 系统内置模板 JSON 文件
  features/
    builder/           # 构建页（表单、预览、导出）
    templates/         # 模板管理页
    home/              # 首页
  shared/
    components/        # 通用 UI 组件
    hooks/             # 通用 hooks
    i18n/              # 翻译文件 (zh.json, en.json)
    db/                # Dexie schema 与数据操作
    stores/            # Zustand stores
    services/          # AIService 接口与实现
```

**原则：** `core/` 是纯逻辑层，不依赖 React；`features/` 是 UI 层；`shared/` 是胶水层。

### 3.2 核心数据流

```
用户选择模板 → 表单填写 → Form State (Zustand)
                                ↓
                        IR Compiler (debounced 300ms)
                                ↓
                          Prompt IR (canonical JSON)
                           ↓              ↓
                     Validator        Renderer
                     (冲突校验)     (字段分层投放)
                           ↓              ↓
                     校验提示 ←    Rendered Prompt
                     (UI 警告)     (实时预览 + 导出)
```

**关键约束：**
1. **单向数据流** — Form State → IR → Rendered Output，无反向依赖
2. **IR 是唯一 source of truth** — 存储、导出、渲染都基于 IR
3. **编译是 debounced 的** — 300ms 防抖后批量编译
4. **校验和渲染并行** — IR 产出后同时触发，互不阻塞

### 3.3 核心模块接口

#### IR Compiler

```ts
interface IRCompiler {
  compile(formState: FormState, template: TemplateDefinition): CompileResult
}

interface CompileResult {
  ir: PromptIR | null
  status: 'complete' | 'partial' | 'failed'
  warnings: CompileWarning[]
}
```

#### Validator

```ts
interface Validator {
  validate(ir: PromptIR, rules: ValidationRule[]): ValidationResult[]
}

interface ValidationRule {
  id: string                      // e.g. "R-001"
  when: (ir: PromptIR) => boolean
  severity: 'error' | 'warning' | 'info'
  message_key: string             // i18n key
}
```

#### Renderer

```ts
interface Renderer {
  render(ir: PromptIR, options: RenderOptions): string
}

// MVP 实现 hybrid_json 和 natural_language 两种
// hybrid_text 和 pure_json 在 Phase 2 扩展
type RenderVariant = 'hybrid_json' | 'natural_language' | 'hybrid_text' | 'pure_json'

interface RenderOptions {
  variant: RenderVariant
  preset: 'concise' | 'rigorous'
  promotionRules: FieldPromotionRule[]
}

interface FieldPromotionRule {
  field_path: string              // e.g. "answer_mode.recommend_first"
  condition?: (ir: PromptIR) => boolean
  nl_template_key: string         // i18n key for NL sentence generation
}
```

#### AI Service（Phase 2 预留）

```ts
// Phase 2 预留接口，MVP 阶段仅定义 interface，不实现
interface AIService {
  generateDraft(input: string): Promise<AIServiceResult>
}

interface AIServiceResult {
  ir: Partial<PromptIR>
  confidence: number
  inferred_task_type: TaskType | null
  uncertain_fields: string[]
}
```

### 3.4 Zustand Store 结构

```ts
// FormState 按模板类型参数化，核心字段有类型约束
// 仅 additional_notes 等自由文本字段为 string
interface FormState {
  task_type: TaskType
  objective: string
  constraints: ConstraintItem[]
  output_spec: Partial<OutputSpec>
  answer_mode: Partial<AnswerMode>
  style: Partial<StyleConfig>
  context?: ContextConfig
  forbidden?: string[]
  additional_notes?: string
  [key: string]: unknown            // 模板自定义扩展字段
}

interface AppState {
  // 当前编辑状态
  currentTemplateId: string | null
  formState: FormState | null
  compiledIR: PromptIR | null

  // 渲染输出
  renderedOutput: string
  renderVariant: RenderVariant

  // 校验
  validationErrors: ValidationResult[]

  // Actions
  selectTemplate: (id: string) => void
  updateField: (key: string, value: unknown) => void
  switchRenderVariant: (variant: RenderVariant) => void
  saveAsPreset: () => Promise<void>
}
```

### 3.5 Dexie 数据库设计

```ts
const db = new Dexie('IntentCompiler')

db.version(1).stores({
  presets: '++id, template_id, task_type, name, updated_at',
  drafts: '++id, template_id, updated_at',
  settings: 'key'
})
```

| 表 | 用途 | 关键索引 |
|---|------|---------|
| `presets` | 用户保存的模板实例 | task_type, updated_at |
| `drafts` | 自动保存的编辑中草稿 | template_id, updated_at |
| `settings` | 用户配置（API Key、语言等） | key |

**系统模板加载策略：**
- 系统模板以 TypeScript 模块形式定义在 `core/template/presets/` 目录中（非 Dexie 存储）
- 应用启动时通过静态 import 加载，注册到内存中的 template registry
- 系统模板通过代码版本控制（git），不通过 Dexie 版本迁移
- 用户保存的 preset 引用系统模板的 `template_id`；当系统模板升级时，preset 保留原 `ir_schema_version` 并在加载时触发 migration adapter

**数据生命周期：**
- 用户选模板 → 创建 draft（自动保存到 Dexie）
- 编辑中 → draft 每 5s 自动更新
- 点击"保存模板" → 写入 presets，删除对应 draft
- 点击"复制 prompt" → 不写 presets，draft 保留
- 关闭页面 → draft 保留，下次可恢复

### 3.6 页面路由

```
/                → 首页（模板选择 + 最近使用 + AI 入口）
/build/:id?      → 构建页（核心页面）
/templates       → 模板管理页
```

**路由参数：**
- `/build?template=code_gen` — 选择系统模板直接进入
- `/build?draft=123` — 恢复未完成的草稿
- `/build?preset=456` — 加载已保存的模板实例

### 3.7 构建页布局

```
┌─────────────────────────────────────────────┐
│  Header: 模板名称 / 任务类型 / 语言切换      │
├────────────────────┬────────────────────────┤
│                    │                        │
│   左侧：输入区      │   右侧：预览区          │
│                    │                        │
│   - 核心字段        │   - 渲染风格切换         │
│   - 高级字段(折叠)   │   - Prompt 实时预览     │
│   - 补充说明        │   - 复制按钮            │
│   - 校验提示        │   - 保存模板按钮         │
│                    │                        │
├────────────────────┴────────────────────────┤
│  Footer: 导出 IR JSON (高级入口，低调)        │
└─────────────────────────────────────────────┘
```

移动端响应式：左右布局变为上下布局（输入在上，预览在下可折叠）。

---

## 4. 测试策略

### 4.1 测试分层

| 优先级 | 测试范围 | 时机 |
|--------|---------|------|
| P0 | `core/ir/compiler.test.ts` — IR 编译器 | MVP |
| P0 | `core/ir/validator.test.ts` — 校验规则 | MVP |
| P0 | `core/renderer/*.test.ts` — Renderer + snapshot | MVP |
| P1 | `core/template/presets/*.test.ts` — 模板默认值完整性 | MVP |
| P1 | `db/migrations.test.ts` — Dexie 版本迁移 | MVP |
| P2 | `features/` UI 组件测试 | 稳定后 |
| P2 | E2E 测试 | 稳定后 |

### 4.2 Renderer Snapshot 测试

```ts
test('production_eval template renders hybrid_json correctly', () => {
  const ir = compileFromTemplate('production_eval', sampleFormState)
  const output = renderer.render(ir, {
    variant: 'hybrid_json',
    preset: 'concise'
  })
  expect(output).toMatchSnapshot()
})
```

每个模板 × 每种渲染模式 = 一个 snapshot。模板或 Renderer 变更时差异一目了然。

---

## 5. 部署架构

### 5.1 部署流程

```
本地 push → GitHub Actions → pnpm build → rsync dist/ → 阿里云服务器
                                                              ↓
                                                    Nginx 托管静态文件
```

### 5.2 Nginx 配置

**HTTPS 要求：** 产品会在浏览器端存储用户 API Key（Dexie settings 表），HTTPS 是基线安全要求。使用 certbot (Let's Encrypt) 自动签发和续期 TLS 证书。

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    root /var/www/intent-compiler;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        try_files $uri /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 6. 开发工具链

| 工具 | 用途 |
|------|------|
| pnpm | 包管理 |
| Vite | 构建 + HMR |
| TypeScript (strict) | 类型安全 |
| React Router v7 | 客户端路由 |
| react-hook-form + zod | 表单管理 + schema 验证 |
| react-i18next | 国际化（中/英） |
| ESLint + Prettier | 代码规范 |
| Vitest | 单元测试 + snapshot |
| GitHub Actions | CI/CD |
| certbot (Let's Encrypt) | TLS 证书自动签发 |

---

## 7. 演进路径

| 阶段 | 架构变化 |
|------|---------|
| MVP | 纯前端 SPA，本地存储，用户自带 API Key |
| Phase 2 | 接入 Supabase/Dexie Cloud 实现云同步，AI Assist 正式上线 |
| Phase 3 | 团队模板共享，需要用户认证和权限 |
| Phase 4 | API/SDK 对外，可能需要独立后端服务 |

每个阶段的架构变化都不需要推翻前一阶段的决策——纯前端 → BaaS → 独立后端是渐进演进路径。
