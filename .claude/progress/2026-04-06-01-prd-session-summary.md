# Intent Compiler — PRD Session Summary

## Current Status

**PRD 已完成并通过 review 修复**，位于 `docs/prd/intent-compiler-prd.md`。

待完成：前端视觉/交互设计（frontend-design），完成后可进入 plan 和实现阶段。

## What Was Decided

### Product Core

Intent Compiler 是一个纯前端 Web 工具，帮助用户将模糊意图"编译"成结构化 prompt，降低与 AI 交互时的心智负担。

- **无 AI 模式（默认）**：用户手动填写模板字段，工具格式化组装输出
- **AI 增强模式（可选）**：用户提供 API Key（OpenAI / Anthropic），AI 根据 Intent 字段自动填充其他模板字段

### 6 Task Types (Core Identity)

每种任务类型对应一个动词和用户心智模型，这是产品的核心导航方式：

| Type | Verb | Mental Model |
|------|------|-------------|
| Ask | 提问 | "I want to know something" |
| Create | 创作 | "I want to make something" |
| Transform | 转化 | "I have content, change its form" |
| Analyze | 分析 | "Help me judge / understand" |
| Ideate | 构思 | "Help me think / design" |
| Execute | 执行 | "Do a multi-step task for me" |

### Field Classification Model

每个字段有两个独立属性：
- **Scope**: Universal（全局） / Task（任务专属）
- **Visibility**: Default（默认展示） / Optional（可选添加）

两者独立配置，一个全局字段可被重新归属到 Task（如 `goal` 在 Ideate/Execute 中为 Task），但不自动改变 Visibility。

### Progressive Disclosure

- 选中任务类型后展示所有 Visibility=Default 的字段
- "添加字段"面板分两组：Task Optional → Universal Optional
- 每个可添加字段附带描述和使用场景提示

### Editor Layout (Core Area Only)

```
[Task Type Selector]
[Intent Input (elevated, standalone)] [AI Fill Button]
  ☐ Allow AI to add fields
[Other default fields]
[+ Add field]
                                      [Live Preview]
```

- Intent 有独立、突出的输入位置
- AI 按钮紧邻 Intent 输入框
- 页面级元素（历史、API Key、语言切换、偏好）不在编辑器范围内，视觉布局待 frontend-design 定义

### Output

- 4 种平等格式：Markdown / JSON / YAML / XML
- 所有格式统一按重要性排列字段（intent → core → optional → custom）
- 实时预览 + 一键复制

### AI Enhancement

- 功能：AI 辅助填充输入（不是优化输出）
- 默认模式：只填当前编辑器中展示的字段
- 可选模式："Allow AI to add fields" — AI 自行发现并添加可选字段
- v1 支持 OpenAI + Anthropic，抽象接口预留扩展

### i18n

- UI 中英双语
- 编译输出跟随 UI 语言
- `output_language` 是输出中的字段（指定 AI 回复语言），与项目 UI 语言无关

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | react-i18next |
| Storage | IndexedDB via Dexie.js |
| Serialization | js-yaml, fast-xml-parser |
| Deployment | Static build → Alibaba Cloud Nginx |

### Modules

1. **Template Registry** — 模板 schema 定义、字段关系管理
2. **Compiler** — 字段数据 → 编译输出（格式化组装）
3. **Output Formatter** — MD/JSON/YAML/XML 四种序列化策略
4. **Editor UI** — 混合编辑器核心区域
5. **i18n** — 国际化
6. **AI Connector** — 可选 AI 填充模块
7. **Storage (Dexie.js)** — 模板、偏好、历史持久化

## What's NOT Decided Yet

- **页面整体布局**：编辑器之外的元素（导航、设置面板、历史视图、API Key 管理）的视觉位置和交互 → 需要 frontend-design
- **实现分阶段策略**：review 建议拆 Phase 1（核心编辑器+编译器+格式化+i18n）和 Phase 2（持久化+AI+页面布局），但尚未确认
- **AI 填充的 prompt 构造细节**：发给 AI 的具体 prompt 模板未设计

## Key Files

- `docs/prd/intent-compiler-prd.md` — 完整 PRD（32 条 User Stories, 详细字段表, 模块设计, 测试策略）

## Next Steps

1. **Frontend Design** — 定义页面整体布局、视觉风格、组件交互细节
2. **Plan** — 基于 PRD + 前端设计，制定分阶段实施计划
3. **Implementation** — 按 plan 逐步实现