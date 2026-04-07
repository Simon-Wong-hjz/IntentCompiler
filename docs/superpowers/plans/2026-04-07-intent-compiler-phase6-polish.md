# Phase 6: Help System + Edge States + Visual Polish -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the help system, implement all empty/edge states, and polish the entire UI to production-quality design spec compliance -- making the app feel finished.

**Architecture:** A new `HelpCard` component renders inline between each field's label row and its input, driven by a centralized bilingual `helpContentMap` data file keyed by field ID. Edge states are handled via conditional rendering in existing components (`EditorArea`, `PreviewArea`, `AiFillButton`, `HistoryModal`). Visual polish is applied through CSS token alignment in `index.css` and component-level Tailwind classes.

**Tech Stack:** React 19.2, TypeScript 6, Vite 8, Tailwind CSS v4, react-i18next (for UI language switching in help content), Vitest 4.1 (for help-content data integrity test).

> **Phase 1 Audit Note:** Phase 1 installed newer versions than originally planned. See `.claude/progress/2026-04-07-02-phase-plan-audit.md` for full details. Key difference for this phase: Tailwind v4 uses `@theme {}` block in `src/index.css` instead of `tailwind.config.ts` — CSS custom properties in Task 12 should be added to the `@theme` block, not a separate `:root` selector. The `@import url(...)` for Google Fonts should be placed outside the `@theme` block.

> **Chinese-First Localization Note:** CLAUDE.md establishes Chinese as the primary UI language. When implementing this phase:
> 1. **Task 1 (help content):** The `helpContentMap` already includes bilingual `{ en, zh }` objects. Chinese values are the primary user-facing text — ensure they read naturally and are not just English translations.
> 2. **Edge state strings:** Any new empty-state or placeholder strings added in this phase must be Chinese by default, with English as the i18n secondary.
> 3. **Task 12 (CSS polish):** No language-specific impact, but ensure font stack includes Chinese fallback fonts (PingFang SC → Microsoft YaHei → Noto Sans SC, already set up in Phase 1).
>
> Additionally, preserve the following Phase 1 behaviors:
> - **`canCopy` prop chain**: When polishing CopyButton disabled state, preserve the `canCopy`/`hasContent` separation.
> - **Intent field conditional glow**: When polishing IntentField, preserve the three-state glow logic (`isEmpty`/`isFocused`).
> - **Task switching preserves Intent**: When polishing task-switch edge states, preserve the `handleSelectType` logic in App.tsx.

---

## File Structure

```
CREATE:
  src/components/help/HelpCard.tsx          -- Inline expandable help card
  src/data/help-content.ts                  -- Bilingual help content for all ~45 fields
  src/data/__tests__/help-content.test.ts   -- Data integrity test

MODIFY:
  src/components/editor/FieldLabel.tsx       -- Wire [?] toggle to HelpCard
  src/components/editor/EditorArea.tsx       -- No-task-selected empty state
  src/components/editor/IntentField.tsx      -- Pass help state down
  src/components/editor/fields/*.tsx         -- Placeholder text for empty fields
  src/components/editor/AiFillButton.tsx     -- Disabled/lock states + tooltip
  src/components/preview/PreviewArea.tsx     -- Empty states (no task, skeleton)
  src/components/preview/CopyButton.tsx      -- Disabled state at 40% opacity
  src/components/modals/HistoryModal.tsx     -- Empty history state
  src/components/task-selector/TaskSelector.tsx -- Responsive 3x2 grid
  src/index.css                             -- Design token alignment + polish
```

---

## Task 1: Create help content data file with all fields

Create `src/data/help-content.ts` containing the `HelpContent` interface and `helpContentMap` covering every field in the PRD.

- [ ] Create the file with the interface and full map

```typescript
// src/data/help-content.ts

export interface HelpContent {
  whatIsThis: { en: string; zh: string };
  suggestions?: { en: string; zh: string };
  example?: { en: string; zh: string };
}

export const helpContentMap: Record<string, HelpContent> = {
  intent: {
    whatIsThis: {
      en: 'The core intent of your request, expressed in one sentence.',
      zh: '用一句话表达你请求的核心意图。',
    },
    suggestions: {
      en: 'Be specific about what you want. A clear intent leads to a much better prompt.',
      zh: '尽量具体地描述你想要什么。清晰的意图会生成更好的提示词。',
    },
    example: {
      en: 'Explain how React hooks manage component lifecycle',
      zh: '解释 React hooks 如何管理组件生命周期',
    },
  },
  context: {
    whatIsThis: {
      en: 'Background information that helps the AI understand your situation.',
      zh: '帮助 AI 理解你所处情境的背景信息。',
    },
    suggestions: {
      en: 'Include relevant details about your project, audience, or environment that affect the answer.',
      zh: '包含影响回答的项目、受众或环境相关细节。',
    },
    example: {
      en: 'I am building a React app for internal use at a mid-size company. The team has intermediate JS experience.',
      zh: '我正在为一家中型公司构建内部使用的 React 应用。团队具有中级 JS 经验。',
    },
  },
  requirements: {
    whatIsThis: {
      en: 'Specific conditions that the output must satisfy.',
      zh: '输出必须满足的具体条件。',
    },
    suggestions: {
      en: 'List hard requirements that cannot be skipped. Each item should be verifiable.',
      zh: '列出不可省略的硬性要求。每一条应是可验证的。',
    },
    example: {
      en: 'Must use TypeScript; Must include error handling; Must be under 200 lines',
      zh: '必须使用 TypeScript；必须包含错误处理；不超过 200 行',
    },
  },
  constraints: {
    whatIsThis: {
      en: 'Boundaries and things to avoid in the output.',
      zh: '输出中需要避免的边界和事项。',
    },
    suggestions: {
      en: 'Specify what the AI should NOT do, or limits it must respect.',
      zh: '指明 AI 不应做什么，或必须遵守的限制。',
    },
    example: {
      en: 'Do not use any deprecated APIs; Avoid external dependencies; No jQuery',
      zh: '不要使用已废弃的 API；避免外部依赖；不使用 jQuery',
    },
  },
  output_format: {
    whatIsThis: {
      en: 'The desired form of the AI response (paragraph, list, table, code, etc.).',
      zh: 'AI 回复的期望形式（段落、列表、表格、代码等）。',
    },
    suggestions: {
      en: 'Choose the format that best fits how you will use the output.',
      zh: '选择最适合你使用输出方式的格式。',
    },
    example: {
      en: 'step-by-step list with code snippets',
      zh: '带代码片段的分步列表',
    },
  },
  goal: {
    whatIsThis: {
      en: 'The desired end state or outcome you want to achieve.',
      zh: '你希望达成的最终状态或结果。',
    },
    suggestions: {
      en: 'Describe what success looks like when the task is done.',
      zh: '描述任务完成后成功的样子。',
    },
    example: {
      en: 'A production-ready authentication module that passes all security audits',
      zh: '一个通过所有安全审计的生产就绪认证模块',
    },
  },
  role: {
    whatIsThis: {
      en: 'The persona or role the AI should assume when responding.',
      zh: 'AI 回复时应扮演的角色或身份。',
    },
    suggestions: {
      en: 'Use when you want the AI to respond from a specific professional perspective.',
      zh: '当你希望 AI 以特定专业视角回复时使用。',
    },
    example: {
      en: 'Senior backend engineer with 10 years of experience',
      zh: '拥有 10 年经验的高级后端工程师',
    },
  },
  audience: {
    whatIsThis: {
      en: 'Who will read or use the output.',
      zh: '谁将阅读或使用输出内容。',
    },
    suggestions: {
      en: 'Specifying the audience helps the AI calibrate complexity and tone.',
      zh: '指定受众有助于 AI 调整复杂度和语气。',
    },
    example: {
      en: 'Junior developers new to React',
      zh: '刚接触 React 的初级开发者',
    },
  },
  assumptions: {
    whatIsThis: {
      en: 'Premises the AI should take as given without questioning.',
      zh: 'AI 应视为既定事实而不质疑的前提。',
    },
    suggestions: {
      en: 'Use to skip unnecessary clarification and keep the AI focused.',
      zh: '用于跳过不必要的澄清，让 AI 保持专注。',
    },
    example: {
      en: 'The user already has Node.js 20+ installed; The database is PostgreSQL',
      zh: '用户已安装 Node.js 20+；数据库是 PostgreSQL',
    },
  },
  scope: {
    whatIsThis: {
      en: 'The boundary of what the response should cover.',
      zh: '回复应涵盖的范围边界。',
    },
    suggestions: {
      en: 'Use to narrow or widen the AI response. Prevents the AI from going off-topic.',
      zh: '用于缩小或扩大 AI 回复范围。防止 AI 跑题。',
    },
    example: {
      en: 'Only cover the frontend layer; do not discuss backend or DevOps',
      zh: '只涵盖前端层；不讨论后端或 DevOps',
    },
  },
  priority: {
    whatIsThis: {
      en: 'What matters most when trade-offs arise.',
      zh: '当需要取舍时，什么最重要。',
    },
    suggestions: {
      en: 'Helps the AI make judgment calls when it cannot satisfy everything equally.',
      zh: '帮助 AI 在无法同时满足所有要求时做出判断。',
    },
    example: {
      en: 'Readability over performance; Correctness over brevity',
      zh: '可读性优先于性能；正确性优先于简洁',
    },
  },
  output_language: {
    whatIsThis: {
      en: 'The language the AI should use in its response.',
      zh: 'AI 回复时应使用的语言。',
    },
    suggestions: {
      en: 'Set this when the response language should differ from your prompt language.',
      zh: '当回复语言需要与提示词语言不同时设置。',
    },
    example: {
      en: 'Chinese',
      zh: '中文',
    },
  },
  detail_level: {
    whatIsThis: {
      en: 'How detailed the response should be: summary, standard, or in-depth.',
      zh: '回复的详细程度：摘要、标准或深入。',
    },
    suggestions: {
      en: 'Use "summary" for quick overviews, "in-depth" for thorough explanations.',
      zh: '用"摘要"快速概览，用"深入"获取详尽解释。',
    },
  },
  tone: {
    whatIsThis: {
      en: 'The voice and style of the AI response.',
      zh: 'AI 回复的语气和风格。',
    },
    suggestions: {
      en: 'Match the tone to the audience and context. Technical docs need a different tone than a casual email.',
      zh: '根据受众和场景匹配语气。技术文档和随意的邮件需要不同语气。',
    },
    example: {
      en: 'Professional but approachable',
      zh: '专业但平易近人',
    },
  },
  thinking_style: {
    whatIsThis: {
      en: 'How the AI should structure its reasoning: direct answer, step-by-step, or pros-and-cons.',
      zh: 'AI 应如何组织推理：直接回答、分步说明或利弊分析。',
    },
    suggestions: {
      en: 'Use "step-by-step" for tutorials, "pros-and-cons" for decisions, "direct answer" for quick facts.',
      zh: '教程用"分步说明"，决策用"利弊分析"，快速查询用"直接回答"。',
    },
  },
  examples: {
    whatIsThis: {
      en: 'Reference examples that show what good output looks like.',
      zh: '展示优质输出样貌的参考示例。',
    },
    suggestions: {
      en: 'Providing even one example dramatically improves AI output quality.',
      zh: '即使提供一个示例也能显著提升 AI 输出质量。',
    },
    example: {
      en: 'Input: "sort an array" -> Output: "Use Array.prototype.sort() with a comparator..."',
      zh: '输入："排序数组" -> 输出："使用 Array.prototype.sort() 配合比较函数..."',
    },
  },
  anti_examples: {
    whatIsThis: {
      en: 'Counter-examples showing what the output should NOT look like.',
      zh: '反面示例，展示输出不应该是什么样子。',
    },
    suggestions: {
      en: 'Use when there are common mistakes or patterns you want to explicitly avoid.',
      zh: '当有你明确想避免的常见错误或模式时使用。',
    },
    example: {
      en: 'Do NOT produce output like: "Just use a library for that" (too vague)',
      zh: '不要产生这样的输出："用个库就行了"（太笼统）',
    },
  },
  references: {
    whatIsThis: {
      en: 'Specific sources or materials the AI should consult or cite.',
      zh: 'AI 应参考或引用的特定来源或材料。',
    },
    suggestions: {
      en: 'Include URLs, paper titles, or documentation sections when accuracy matters.',
      zh: '当准确性重要时，包含 URL、论文标题或文档章节。',
    },
    example: {
      en: 'React docs: https://react.dev/reference/react/hooks',
      zh: 'React 文档：https://react.dev/reference/react/hooks',
    },
  },
  custom_fields: {
    whatIsThis: {
      en: 'User-defined key-value pairs for requirements not covered by built-in fields.',
      zh: '用户自定义的键值对，用于内置字段未涵盖的需求。',
    },
    suggestions: {
      en: 'Use sparingly -- if you frequently add the same custom field, it may deserve a built-in spot.',
      zh: '谨慎使用——如果你经常添加同一个自定义字段，它可能值得成为内置字段。',
    },
    example: {
      en: 'compliance_standard: SOC 2 Type II',
      zh: 'compliance_standard: SOC 2 Type II',
    },
  },
  question_type: {
    whatIsThis: {
      en: 'The nature of your question: factual, conceptual, how-to, or opinion.',
      zh: '问题的性质：事实性、概念性、操作指南或观点。',
    },
    suggestions: {
      en: 'Selecting a type helps the AI choose the right answering strategy.',
      zh: '选择类型有助于 AI 选择正确的回答策略。',
    },
  },
  knowledge_level: {
    whatIsThis: {
      en: 'Your existing knowledge level on the topic: beginner, intermediate, or expert.',
      zh: '你在该主题上的现有知识水平：初学者、中级或专家。',
    },
    suggestions: {
      en: 'Helps the AI calibrate explanation depth. Beginners get more context; experts get concise answers.',
      zh: '帮助 AI 校准解释深度。初学者获得更多背景；专家获得简洁回答。',
    },
  },
  content_type: {
    whatIsThis: {
      en: 'What you want to create: email, article, documentation, code, or script.',
      zh: '你想创建的内容类型：邮件、文章、文档、代码或脚本。',
    },
    suggestions: {
      en: 'Each content type has different structural expectations. Selecting one guides the AI format.',
      zh: '每种内容类型有不同的结构预期。选择一种可以引导 AI 的格式。',
    },
  },
  key_points: {
    whatIsThis: {
      en: 'Must-include points or core functionality the output should cover.',
      zh: '输出必须涵盖的要点或核心功能。',
    },
    suggestions: {
      en: 'List the non-negotiable items. The AI will build the content around these.',
      zh: '列出不可省略的项目。AI 将围绕这些构建内容。',
    },
    example: {
      en: 'Error handling; Input validation; Logging',
      zh: '错误处理；输入验证；日志记录',
    },
  },
  tech_stack: {
    whatIsThis: {
      en: 'Programming languages, frameworks, and libraries relevant to the task.',
      zh: '与任务相关的编程语言、框架和库。',
    },
    suggestions: {
      en: 'Specify versions when they matter. The AI will tailor code to your stack.',
      zh: '当版本重要时请指明。AI 将针对你的技术栈定制代码。',
    },
    example: {
      en: 'TypeScript 5, React 18, Tailwind CSS 3',
      zh: 'TypeScript 5、React 18、Tailwind CSS 3',
    },
  },
  target_length: {
    whatIsThis: {
      en: 'The expected length or scale of the output.',
      zh: '输出的预期长度或规模。',
    },
    suggestions: {
      en: 'Can be word count, page count, or relative ("brief", "comprehensive").',
      zh: '可以是字数、页数或相对描述（"简要"、"全面"）。',
    },
    example: {
      en: '500-800 words',
      zh: '500-800 字',
    },
  },
  structure: {
    whatIsThis: {
      en: 'The expected structure or outline of the output.',
      zh: '输出的预期结构或大纲。',
    },
    suggestions: {
      en: 'Provide a rough outline when you have a specific structure in mind.',
      zh: '当你心中有特定结构时，提供一个大致大纲。',
    },
    example: {
      en: '1. Introduction  2. Problem Statement  3. Solution  4. Implementation  5. Conclusion',
      zh: '1. 引言  2. 问题陈述  3. 解决方案  4. 实现  5. 结论',
    },
  },
  include_tests: {
    whatIsThis: {
      en: 'Whether to include test code alongside the main output.',
      zh: '是否在主输出旁包含测试代码。',
    },
    suggestions: {
      en: 'Toggle on when you want unit tests, integration tests, or test cases generated with the code.',
      zh: '当你希望随代码一起生成单元测试、集成测试或测试用例时开启。',
    },
  },
  source_content: {
    whatIsThis: {
      en: 'The original content you want to transform.',
      zh: '你要转换的原始内容。',
    },
    suggestions: {
      en: 'Paste or type the full source material. The more complete it is, the better the transformation.',
      zh: '粘贴或输入完整的源材料。内容越完整，转换效果越好。',
    },
  },
  transform_type: {
    whatIsThis: {
      en: 'How to transform the content: summarize, translate, rewrite, simplify, or format convert.',
      zh: '如何转换内容：摘要、翻译、改写、简化或格式转换。',
    },
    suggestions: {
      en: 'Pick the transformation that matches your goal. You can add constraints for finer control.',
      zh: '选择与你目标匹配的转换方式。你可以添加约束进行更精细的控制。',
    },
  },
  preserve: {
    whatIsThis: {
      en: 'Information or characteristics that must be preserved during transformation.',
      zh: '转换过程中必须保留的信息或特征。',
    },
    suggestions: {
      en: 'List what must survive the transformation: tone, key terms, structure, data accuracy, etc.',
      zh: '列出转换中必须保留的内容：语气、关键术语、结构、数据准确性等。',
    },
    example: {
      en: 'Technical terminology; All numerical data; Original author attributions',
      zh: '技术术语；所有数值数据；原作者署名',
    },
  },
  subject: {
    whatIsThis: {
      en: 'The object or content to analyze.',
      zh: '要分析的对象或内容。',
    },
    suggestions: {
      en: 'Provide the material for analysis. Can be text, a description of a system, data, etc.',
      zh: '提供分析材料。可以是文本、系统描述、数据等。',
    },
  },
  analyze_type: {
    whatIsThis: {
      en: 'The type of analysis: evaluate, compare, or data interpretation.',
      zh: '分析类型：评估、比较或数据解读。',
    },
    suggestions: {
      en: 'Pick "evaluate" for assessments, "compare" for side-by-side analysis, "data interpretation" for datasets.',
      zh: '评估选"评估"，并列分析选"比较"，数据集选"数据解读"。',
    },
  },
  criteria: {
    whatIsThis: {
      en: 'The dimensions or standards to evaluate against.',
      zh: '评估所依据的维度或标准。',
    },
    suggestions: {
      en: 'List specific evaluation criteria so the analysis is focused and structured.',
      zh: '列出具体的评估标准，使分析更有针对性和结构性。',
    },
    example: {
      en: 'Performance; Maintainability; Security; Cost',
      zh: '性能；可维护性；安全性；成本',
    },
  },
  compared_subjects: {
    whatIsThis: {
      en: 'The items to compare side by side.',
      zh: '要进行并列比较的项目。',
    },
    suggestions: {
      en: 'Add two or more items for the AI to compare against the criteria you set.',
      zh: '添加两个或多个项目，让 AI 根据你设定的标准进行比较。',
    },
    example: {
      en: 'React; Vue; Svelte',
      zh: 'React；Vue；Svelte',
    },
  },
  benchmark: {
    whatIsThis: {
      en: 'A reference standard or baseline to compare against.',
      zh: '用于对比的参考标准或基准线。',
    },
    suggestions: {
      en: 'Provide a known-good reference so the AI can make relative judgments.',
      zh: '提供一个已知良好的参考，以便 AI 做出相对判断。',
    },
    example: {
      en: 'Industry average response time of 200ms for API endpoints',
      zh: 'API 端点行业平均响应时间 200ms',
    },
  },
  problem: {
    whatIsThis: {
      en: 'The problem to solve or direction to explore.',
      zh: '要解决的问题或要探索的方向。',
    },
    suggestions: {
      en: 'Describe the problem clearly. Include what makes it challenging.',
      zh: '清晰描述问题。包含什么使其具有挑战性。',
    },
    example: {
      en: 'Users abandon the checkout flow at the payment step -- 40% drop-off rate',
      zh: '用户在支付步骤放弃结账流程——40% 的流失率',
    },
  },
  current_state: {
    whatIsThis: {
      en: 'Description of the current situation before solving the problem.',
      zh: '解决问题前的当前状况描述。',
    },
    suggestions: {
      en: 'Be honest about where things stand. This context helps the AI propose realistic solutions.',
      zh: '如实说明现状。这些背景有助于 AI 提出切实可行的方案。',
    },
  },
  idea_count: {
    whatIsThis: {
      en: 'How many ideas or options the AI should generate.',
      zh: 'AI 应生成多少个创意或方案。',
    },
    suggestions: {
      en: 'A higher number gives more variety but less depth per idea. 3-5 is a good default.',
      zh: '数量越多种类越丰富但每个创意的深度越浅。3-5 个是不错的默认值。',
    },
  },
  evaluation_criteria: {
    whatIsThis: {
      en: 'Standards for judging the quality of generated ideas.',
      zh: '判断所生成创意质量的标准。',
    },
    suggestions: {
      en: 'Set criteria so the AI can rank or filter its own ideas before presenting them.',
      zh: '设定标准，让 AI 在展示创意前能自行排序或筛选。',
    },
    example: {
      en: 'Feasibility; Impact; Implementation cost; Time to market',
      zh: '可行性；影响力；实施成本；上市时间',
    },
  },
  tradeoff_preference: {
    whatIsThis: {
      en: 'Your preference when trade-offs arise between competing qualities.',
      zh: '当竞争性质量之间需要取舍时的偏好。',
    },
    suggestions: {
      en: 'State which side you lean toward so the AI does not default to generic balanced answers.',
      zh: '说明你倾向哪一方，这样 AI 不会默认给出泛泛的平衡回答。',
    },
    example: {
      en: 'Prefer speed over cost; Prefer simplicity over completeness',
      zh: '速度优先于成本；简洁优先于全面',
    },
  },
  plan: {
    whatIsThis: {
      en: 'Known steps or workflow for the task. Can be left empty for AI to plan.',
      zh: '任务的已知步骤或工作流。可留空让 AI 来规划。',
    },
    suggestions: {
      en: 'Paste an existing plan or outline the rough steps. Leave empty if you want the AI to propose a plan.',
      zh: '粘贴现有计划或概述大致步骤。如果想让 AI 提出计划则留空。',
    },
    example: {
      en: '1. Set up project  2. Implement auth  3. Build API  4. Write tests  5. Deploy',
      zh: '1. 搭建项目  2. 实现认证  3. 构建 API  4. 编写测试  5. 部署',
    },
  },
  tools_to_use: {
    whatIsThis: {
      en: 'Tools or services the AI agent must use when executing the task.',
      zh: 'AI 代理执行任务时必须使用的工具或服务。',
    },
    suggestions: {
      en: 'List specific tools, APIs, or services that should be part of the execution workflow.',
      zh: '列出应成为执行工作流一部分的特定工具、API 或服务。',
    },
    example: {
      en: 'GitHub CLI; Docker; AWS S3',
      zh: 'GitHub CLI；Docker；AWS S3',
    },
  },
  checkpoints: {
    whatIsThis: {
      en: 'Points where the AI should pause for your confirmation before continuing.',
      zh: 'AI 应在此暂停并等待你确认后再继续的节点。',
    },
    suggestions: {
      en: 'Add checkpoints before irreversible actions (deployments, deletions, external calls).',
      zh: '在不可逆操作（部署、删除、外部调用）前添加检查点。',
    },
    example: {
      en: 'Before deploying to production; Before deleting old data; After generating migration script',
      zh: '部署到生产环境前；删除旧数据前；生成迁移脚本后',
    },
  },
  error_handling: {
    whatIsThis: {
      en: 'Strategy for what to do when errors occur during execution.',
      zh: '执行过程中发生错误时的处理策略。',
    },
    suggestions: {
      en: 'Specify whether to retry, skip, abort, or ask for help on different error types.',
      zh: '指定对不同类型的错误是重试、跳过、中止还是请求帮助。',
    },
    example: {
      en: 'Retry network errors up to 3 times; Abort on permission errors; Log and skip non-critical failures',
      zh: '网络错误最多重试 3 次；权限错误时中止；非关键失败记录并跳过',
    },
  },
  success_criteria: {
    whatIsThis: {
      en: 'How to determine that the task has been completed successfully.',
      zh: '如何判断任务已成功完成。',
    },
    suggestions: {
      en: 'Define observable, verifiable outcomes that confirm the task is done.',
      zh: '定义可观察、可验证的结果来确认任务已完成。',
    },
    example: {
      en: 'All tests pass; API returns 200 on health check; Data migration count matches source',
      zh: '所有测试通过；API 健康检查返回 200；数据迁移数量与源匹配',
    },
  },
};
```

**Verify:** Visually confirm the file has entries for all 45 fields listed above. Count the keys.

---

## Task 2: Write data integrity test for help content

Create `src/data/__tests__/help-content.test.ts` that verifies every field in the template registry has a corresponding help content entry, and every entry has required bilingual strings.

- [ ] Create the test file

```typescript
// src/data/__tests__/help-content.test.ts
import { describe, it, expect } from 'vitest';
import { helpContentMap } from '../help-content';

// All field keys from the PRD. This is the single source of truth for field coverage.
const ALL_FIELD_KEYS = [
  'intent', 'context', 'requirements', 'constraints', 'output_format',
  'goal', 'role', 'audience', 'assumptions', 'scope', 'priority',
  'output_language', 'detail_level', 'tone', 'thinking_style',
  'examples', 'anti_examples', 'references', 'custom_fields',
  'question_type', 'knowledge_level',
  'content_type', 'key_points', 'tech_stack', 'target_length',
  'structure', 'include_tests',
  'source_content', 'transform_type', 'preserve',
  'subject', 'analyze_type', 'criteria', 'compared_subjects', 'benchmark',
  'problem', 'current_state', 'idea_count', 'evaluation_criteria',
  'tradeoff_preference',
  'plan', 'tools_to_use', 'checkpoints', 'error_handling', 'success_criteria',
];

describe('helpContentMap', () => {
  it('has an entry for every known field', () => {
    const missingKeys = ALL_FIELD_KEYS.filter((key) => !(key in helpContentMap));
    expect(missingKeys).toEqual([]);
  });

  it('every entry has bilingual whatIsThis', () => {
    for (const [key, content] of Object.entries(helpContentMap)) {
      expect(content.whatIsThis.en, `${key}.whatIsThis.en`).toBeTruthy();
      expect(content.whatIsThis.zh, `${key}.whatIsThis.zh`).toBeTruthy();
    }
  });

  it('optional fields (suggestions, example) are bilingual when present', () => {
    for (const [key, content] of Object.entries(helpContentMap)) {
      if (content.suggestions) {
        expect(content.suggestions.en, `${key}.suggestions.en`).toBeTruthy();
        expect(content.suggestions.zh, `${key}.suggestions.zh`).toBeTruthy();
      }
      if (content.example) {
        expect(content.example.en, `${key}.example.en`).toBeTruthy();
        expect(content.example.zh, `${key}.example.zh`).toBeTruthy();
      }
    }
  });

  it('has no extra keys beyond known fields', () => {
    const extraKeys = Object.keys(helpContentMap).filter(
      (key) => !ALL_FIELD_KEYS.includes(key)
    );
    expect(extraKeys).toEqual([]);
  });
});
```

**Verify:** `npx vitest run src/data/__tests__/help-content.test.ts` -- all 4 tests pass.

---

## Task 3: Build the HelpCard component

Create `src/components/help/HelpCard.tsx` -- a presentational component that renders inline help content with expand/collapse animation.

- [ ] Create the HelpCard component

```tsx
// src/components/help/HelpCard.tsx
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HelpContent } from '@/data/help-content';

interface HelpCardProps {
  content: HelpContent;
  isOpen: boolean;
}

export function HelpCard({ content, isOpen }: HelpCardProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'zh' ? 'zh' : 'en';
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, content, lang]);

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{ maxHeight: isOpen ? `${height}px` : '0px' }}
    >
      <div
        ref={contentRef}
        className="rounded-lg border-[1.5px] border-[#f5c518] bg-[#fff8e1] px-3 py-[10px] mb-1"
      >
        {/* What is this? -- always shown */}
        <p className="text-xs text-[#1a1a1a]">
          <span className="font-semibold">
            {lang === 'en' ? 'What is this?' : '这是什么？'}
          </span>{' '}
          {content.whatIsThis[lang]}
        </p>

        {/* Suggestions -- optional */}
        {content.suggestions && (
          <p className="text-xs text-[#555555] mt-1.5">
            <span className="font-semibold">
              {lang === 'en' ? 'Suggestions:' : '建议：'}
            </span>{' '}
            {content.suggestions[lang]}
          </p>
        )}

        {/* Example -- optional */}
        {content.example && (
          <p className="text-xs text-[#555555] mt-1.5 italic">
            <span className="font-semibold not-italic">
              {lang === 'en' ? 'Example:' : '示例：'}
            </span>{' '}
            {content.example[lang]}
          </p>
        )}
      </div>
    </div>
  );
}
```

**Verify:** Import `HelpCard` in any existing field temporarily, pass it mock content with `isOpen={true}`. Confirm the yellow card renders with correct colors, border, and content sections.

---

## Task 4: Wire [?] icon in FieldLabel to toggle HelpCard

Modify `src/components/editor/FieldLabel.tsx` to manage open/close state for the help icon and render `HelpCard` inline.

- [ ] Add state and toggle logic to FieldLabel
- [ ] Render HelpCard between the label row and the input slot

```tsx
// In src/components/editor/FieldLabel.tsx -- changes to existing component

// ADD imports
import { useState } from 'react';
import { HelpCard } from '@/components/help/HelpCard';
import { helpContentMap } from '@/data/help-content';

// INSIDE the component, add state:
const [helpOpen, setHelpOpen] = useState(false);
const helpContent = helpContentMap[fieldKey]; // fieldKey is the field's ID string, e.g., 'intent'

// REPLACE the existing non-functional [?] button with:
<button
  type="button"
  onClick={() => setHelpOpen((prev) => !prev)}
  className={`
    ml-1 flex h-4 w-4 items-center justify-center rounded-full
    text-[10px] font-semibold leading-none transition-colors duration-150
    ${helpOpen
      ? 'bg-[#1a1a1a] text-[#f5c518]'
      : 'bg-[#f5f3ef] text-[#999999] hover:bg-[#e8e2d8]'
    }
  `}
  aria-expanded={helpOpen}
  aria-label={`Help for ${fieldKey}`}
>
  ?
</button>

// AFTER the label row div, BEFORE the input children/slot, render:
{helpContent && (
  <HelpCard content={helpContent} isOpen={helpOpen} />
)}
```

The exact integration depends on how FieldLabel currently passes its `children` (the input). The pattern is:

```
<div> {/* wrapper */}
  <div> {/* label row: name + [?] + hint */} </div>
  <HelpCard ... />       {/* NEW: between label and input */}
  {children}             {/* the actual input component */}
</div>
```

**Verify:** Click [?] on any field. The yellow help card expands smoothly (200ms). Click again -- it collapses. The ? icon is black+gold when active, gray when inactive.

---

## Task 5: Implement "no task selected" empty state

Modify `EditorArea` and `PreviewArea` to show a centered prompt when no task type is selected. Modify `CopyButton` to be disabled.

- [ ] Add empty state to EditorArea
- [ ] Add empty state to PreviewArea
- [ ] Disable CopyButton when no content

```tsx
// In src/components/editor/EditorArea.tsx
// At the top of the render, before field rendering:
if (!selectedTaskType) {
  return (
    <div className="flex h-full items-center justify-center px-5">
      <p className="text-sm text-[#bbbbbb] select-none">
        {t('editor.selectTaskPrompt')}
        {/* EN: "Select a task type above to begin" */}
        {/* ZH: "请在上方选择一个任务类型以开始" */}
      </p>
    </div>
  );
}
```

```tsx
// In src/components/preview/PreviewArea.tsx
// When no task type is selected:
if (!selectedTaskType) {
  return (
    <div className="flex h-full flex-col">
      {/* Preview header (format selector + output language) stays visible */}
      <PreviewHeader />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[#bbbbbb] select-none">
          {t('preview.selectTaskPrompt')}
        </p>
      </div>
      <CopyButton disabled />
    </div>
  );
}
```

```tsx
// In src/components/preview/CopyButton.tsx
// Add disabled prop and conditional styling:
interface CopyButtonProps {
  disabled?: boolean;
  // ...existing props
}

// In the button element:
<button
  disabled={disabled}
  className={`
    w-full rounded-lg border-t border-[#f0ebe4] py-2.5
    font-bold text-sm flex-shrink-0
    ${disabled
      ? 'bg-[#f5c518] text-[#1a1a1a] opacity-40 cursor-not-allowed'
      : 'bg-[#f5c518] text-[#1a1a1a] hover:brightness-105 active:brightness-95 cursor-pointer'
    }
  `}
>
  {/* ...existing content */}
</button>
```

Add i18n keys:

```json
{
  "editor": { "selectTaskPrompt": "Select a task type above to begin" },
  "preview": { "selectTaskPrompt": "Select a task type above to begin" }
}
```
```json
{
  "editor": { "selectTaskPrompt": "请在上方选择一个任务类型以开始" },
  "preview": { "selectTaskPrompt": "请在上方选择一个任务类型以开始" }
}
```

**Verify:** On page load with no task selected -- editor and preview both show the centered message. Copy button has 40% opacity and is not clickable. Switch UI language -- text updates.

---

## Task 6: Implement "task selected, no fields filled" skeleton in preview

When a task is selected but all fields are empty, the preview shows a template skeleton with placeholders.

- [ ] Add skeleton rendering logic to PreviewArea or the Compiler

```tsx
// In the Compiler or PreviewArea -- add a function to generate skeleton output.
// This runs when the task type is selected but all text fields are empty/blank.

function generatePreviewSkeleton(
  taskType: string,
  defaultFieldKeys: string[],
  outputLang: 'en' | 'zh',
  format: 'md' | 'json' | 'yaml' | 'xml'
): string {
  // Build a map of field key -> placeholder label
  const placeholders = defaultFieldKeys.map((key) => ({
    key,
    label: getFieldLabel(key, outputLang), // uses existing i18n field labels
    placeholder: outputLang === 'en'
      ? `[Enter your ${key.replace(/_/g, ' ')}...]`
      : `[输入${getFieldLabel(key, 'zh')}...]`,
  }));

  // Delegate to the existing formatter with placeholder values
  const skeletonData: Record<string, string> = {};
  for (const p of placeholders) {
    skeletonData[p.key] = p.placeholder;
  }

  return formatOutput(skeletonData, format, outputLang);
}

// In PreviewArea, detect all-empty state:
const allFieldsEmpty = Object.values(fieldValues).every(
  (v) => v === '' || v === undefined || v === null ||
    (Array.isArray(v) && v.length === 0)
);

// If allFieldsEmpty && selectedTaskType exists:
// Render skeleton output, keep CopyButton disabled
```

**Verify:** Select "Ask" with all fields empty. Preview shows a skeleton like:
```
# Intent
[Enter your intent...]

# Context
[Enter your context...]
...
```
Copy button stays disabled. Start typing in Intent -- preview updates to real content, copy button becomes enabled.

---

## Task 7: Implement AI Fill disabled/lock states and tooltip

Modify `AiFillButton` for the two edge states: (1) intent empty, (2) no API key.

- [ ] Add disabled state with tooltip when intent is empty
- [ ] Add lock icon state when no API key is configured

```tsx
// In src/components/editor/AiFillButton.tsx

interface AiFillButtonProps {
  intentValue: string;
  hasApiKey: boolean;
  onFill: () => void;
  onOpenSettings: () => void;
  isLoading: boolean;
  // ...existing props
}

export function AiFillButton({
  intentValue,
  hasApiKey,
  onFill,
  onOpenSettings,
  isLoading,
}: AiFillButtonProps) {
  const { t } = useTranslation();
  const intentEmpty = !intentValue.trim();
  const disabled = intentEmpty || isLoading;

  // No API key state: show lock icon, click opens Settings
  if (!hasApiKey) {
    return (
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center gap-1 rounded-md bg-[#1a1a1a] px-3 py-1
                   text-xs font-bold text-[#f5c518] opacity-70
                   hover:opacity-100 transition-opacity duration-150"
      >
        <span aria-hidden="true">&#x1f512;</span>
        {t('ai.fill')}
      </button>
    );
  }

  // Intent empty state: disabled with tooltip
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={disabled ? undefined : onFill}
        disabled={disabled}
        className={`
          flex items-center gap-1 rounded-md bg-[#1a1a1a] px-3 py-1
          text-xs font-bold text-[#f5c518] transition-all duration-150
          ${disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:brightness-110 cursor-pointer'
          }
        `}
      >
        {isLoading ? (
          <>&#x27F3; {t('ai.filling')}</>
        ) : (
          <>{'\u2728'} {t('ai.fill')}</>
        )}
      </button>
      {/* Tooltip when intent is empty */}
      {intentEmpty && !isLoading && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1
                     rounded-md bg-[#1a1a1a] px-2 py-1 text-[10px] text-white
                     whitespace-nowrap opacity-0 group-hover:opacity-100
                     transition-opacity duration-150 pointer-events-none z-10"
          role="tooltip"
        >
          {t('ai.enterIntentFirst')}
          {/* EN: "Enter your intent first" */}
          {/* ZH: "请先输入意图" */}
        </div>
      )}
    </div>
  );
}
```

Also hide "Allow AI to add fields" checkbox when no API key:

```tsx
// Where the checkbox is rendered (likely in IntentField.tsx or EditorArea.tsx):
{hasApiKey && (
  <label className="flex items-center gap-1.5 text-xs text-[#999999] mt-1">
    <input type="checkbox" ... />
    {t('ai.allowAddFields')}
    {/* [?] icon for this checkbox too */}
  </label>
)}
```

Add i18n keys:

```json
{ "ai": { "fill": "AI Fill", "filling": "Filling...", "enterIntentFirst": "Enter your intent first" } }
```
```json
{ "ai": { "fill": "AI 填充", "filling": "填充中...", "enterIntentFirst": "请先输入意图" } }
```

**Verify:** With no API key -- button shows lock icon; clicking opens Settings. With API key but empty Intent -- button at 40% opacity; hovering shows tooltip. With API key and Intent filled -- button is fully opaque and clickable.

---

## Task 8: Implement empty history state

Modify `HistoryModal` to show a centered empty state when there are no history records.

- [ ] Add empty state rendering

```tsx
// In src/components/modals/HistoryModal.tsx
// Inside the modal body, when history records are empty:

{records.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {/* Simple clock/history icon using CSS or inline SVG */}
    <svg
      className="mb-3 h-10 w-10 text-[#cccccc]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <p className="text-sm text-[#bbbbbb]">
      {t('history.empty')}
      {/* EN: "No history yet" */}
      {/* ZH: "暂无历史记录" */}
    </p>
  </div>
) : (
  /* existing history list rendering */
)}
```

Add i18n keys:

```json
{ "history": { "empty": "No history yet" } }
```
```json
{ "history": { "empty": "暂无历史记录" } }
```

**Verify:** Open History modal with no records -- see centered clock icon and "No history yet" text. Switch to Chinese -- text updates. Add a record (copy something), reopen -- list appears normally.

---

## Task 9: Add placeholder text to all field inputs

Ensure every field input type shows `ink-hint` (#bbbbbb) placeholder text when empty.

- [ ] Add/verify placeholders in all 8 field type components

```tsx
// src/components/editor/fields/TextareaField.tsx
<textarea
  placeholder={t(`fields.${fieldKey}.placeholder`, { defaultValue: '' })}
  className="... placeholder:text-[#bbbbbb]"
  // ...
/>

// src/components/editor/fields/TextField.tsx
<input
  type="text"
  placeholder={t(`fields.${fieldKey}.placeholder`, { defaultValue: '' })}
  className="... placeholder:text-[#bbbbbb]"
  // ...
/>

// src/components/editor/fields/ComboField.tsx
// The text input portion:
<input
  type="text"
  placeholder={t('fields.comboCustomPlaceholder')}
  // EN: "or type custom value..."
  // ZH: "或输入自定义值..."
  className="... placeholder:text-[#bbbbbb]"
/>

// src/components/editor/fields/ListField.tsx
// The "add item" input:
<input
  placeholder={t('fields.listAddPlaceholder')}
  // EN: "Add item..."
  // ZH: "添加项目..."
  className="... placeholder:text-[#bbbbbb]"
/>

// src/components/editor/fields/KeyValueField.tsx
// Key placeholder:
<input placeholder={t('fields.kvKeyPlaceholder')} className="... placeholder:text-[#bbbbbb]" />
// Value placeholder:
<input placeholder={t('fields.kvValuePlaceholder')} className="... placeholder:text-[#bbbbbb]" />

// NumberField, ToggleField, SelectField: no placeholder needed (they have default values or pills)
```

Add field-specific placeholder i18n entries where they do not exist yet. For each field's textarea/text:

```json
{
  "fields": {
    "intent": { "placeholder": "What do you want the AI to do?" },
    "context": { "placeholder": "Background information..." },
    "source_content": { "placeholder": "Paste content to transform..." },
    "subject": { "placeholder": "What to analyze..." },
    "problem": { "placeholder": "Describe the problem..." },
    "plan": { "placeholder": "Steps or workflow (leave empty for AI to plan)..." }
  }
}
```
```json
{
  "fields": {
    "intent": { "placeholder": "你想让 AI 做什么？" },
    "context": { "placeholder": "背景信息..." },
    "source_content": { "placeholder": "粘贴要转换的内容..." },
    "subject": { "placeholder": "要分析的内容..." },
    "problem": { "placeholder": "描述问题..." },
    "plan": { "placeholder": "步骤或工作流（留空让 AI 规划）..." }
  }
}
```

**Verify:** Select a task type. Every empty field shows gray placeholder text. Type something -- placeholder disappears. Switch UI language -- placeholders update.

---

## Task 10: Responsive task selector -- 3x2 grid below 1280px

Modify `TaskSelector` to wrap to a 3-column, 2-row grid on narrower viewports.

- [ ] Update TaskSelector grid layout for responsive breakpoint

```tsx
// In src/components/task-selector/TaskSelector.tsx
// Replace the existing grid/flex container class with:

<div
  className="grid grid-cols-3 gap-2 px-5 py-3
             xl:grid-cols-6"
>
  {/* 6 task type cards */}
  {taskTypes.map((task) => (
    <TaskCard key={task.id} ... />
  ))}
</div>
```

Tailwind `xl:` breakpoint is 1280px, matching the design spec exactly:
- `>= 1280px`: 6 columns (single row)
- `< 1280px`: 3 columns (wraps to 2 rows)

**Verify:** At full width (>= 1280px), all 6 cards sit in one row. Resize browser to < 1280px -- cards wrap to a 3x2 grid. At 1024px, layout is still usable (no overflow or overlap).

---

## Task 11: Pin copy button at preview panel bottom

Ensure the copy button stays pinned at the bottom of the preview panel and never scrolls away.

- [ ] Fix preview panel layout for pinned copy button

```tsx
// In src/components/preview/PreviewArea.tsx (or wherever the preview panel is composed)
// The preview panel must be a flex column with the content scrolling and the button pinned:

<div className="flex h-full flex-col">
  {/* Preview header: format selector + output language */}
  <PreviewHeader className="flex-shrink-0" />

  {/* Scrollable preview content */}
  <div className="flex-1 overflow-y-auto px-4 py-3">
    <pre className="whitespace-pre-wrap font-mono text-sm leading-[1.8] text-[#555555]">
      {previewContent}
    </pre>
  </div>

  {/* Copy button -- pinned at bottom */}
  <div className="flex-shrink-0 border-t border-[#f0ebe4]">
    <CopyButton disabled={!hasContent} content={previewContent} />
  </div>
</div>
```

**Verify:** Fill many fields so the preview content exceeds the viewport. Scroll in the preview -- the copy button stays fixed at the bottom. The border-t separator is always visible.

---

## Task 12: Visual polish -- CSS design token alignment

Audit and correct all design tokens in `src/index.css` and component classes to match the design spec exactly.

- [ ] Verify and correct color tokens
- [ ] Verify and correct spacing/sizing tokens
- [ ] Verify and correct typography tokens
- [ ] Add hover/focus/transition styles

```css
/* src/index.css -- add/verify these design tokens
 *
 * IMPORTANT (Tailwind v4): This project uses Tailwind v4 with @tailwindcss/postcss.
 * Design tokens go inside the existing @theme {} block in src/index.css,
 * NOT in a :root {} selector or tailwind.config.ts (which does not exist).
 * The @import for Google Fonts goes OUTSIDE the @theme block.
 */

/* Google Font import -- add at top of index.css if not present, BEFORE @theme */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Add these inside the existing @theme {} block in src/index.css */
@theme {
  /* Colors */
  --color-bg-page: #fffdf5;
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f5f3ef;
  --color-bg-accent-light: #fff3cd;
  --color-bg-accent-warm: #fff8e1;
  --color-accent-primary: #f5c518;
  --color-accent-primary-shadow: rgba(245, 197, 24, 0.1);
  --color-ink-primary: #1a1a1a;
  --color-ink-secondary: #555555;
  --color-ink-muted: #999999;
  --color-ink-hint: #bbbbbb;
  --color-ink-disabled: #cccccc;
  --color-border-default: #e8e2d8;
  --color-border-light: #f0ebe4;
  --color-border-accent: #f0e6c8;
  --color-status-success: #44aa99;
  --color-status-danger: #ee5555;

  /* Spacing */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --spacing-gap-field: 10px;
  --spacing-gap-section: 12px;
  --spacing-padding-input: 8px;
  --spacing-padding-page: 20px;

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-page);
  color: var(--ink-primary);
}

/* Focus ring for form inputs */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 1px;
}

/* Universal transition for interactive elements */
button,
a,
input,
textarea,
[role="button"] {
  transition: all 150ms ease;
}
```

Checklist of token values to audit in components:

| Token | Spec Value | Where to Check |
|-------|-----------|----------------|
| `bg-page` | `#fffdf5` | `body` or root container |
| Border radii | sm=4, md=6, lg=8, xl=12 | All rounded corners |
| Font weights | 400/500/600/700/800 | Labels=500, field names=600, headings=700, logo=800 |
| Font sizes | xs=12, sm=14, base=16, lg=18, xl=20 | Measure actual rendered sizes |
| `gap-field` | 10px | Vertical gap between fields in EditorArea |
| `gap-section` | 12px | Gap between editor and preview panels |
| `padding-input` | 8px | Inside all input/textarea elements |
| `padding-page` | 20px | Horizontal padding on main containers |
| Hover states | All buttons, cards, interactive | Every clickable element has a hover effect |
| Transition duration | 150ms hover, 200ms expand | Check button hovers (150ms), HelpCard (200ms) |

**Verify:** Inspect each token in browser dev tools. Compare rendered values against the design spec table. No mismatches.

---

## Task 13: Visual polish -- component-level hover, focus, and transitions

Sweep through all interactive components and ensure they have proper hover effects, focus rings, and smooth transitions.

- [ ] Task type cards: hover bg-accent-light tint
- [ ] Format selector pills: hover brightness
- [ ] Language toggle segments: hover brightness
- [ ] Field label [?] icons: hover bg change
- [ ] Add Field button: hover border-color change
- [ ] Add Field panel [+] buttons: hover scale
- [ ] History modal items: hover background
- [ ] Settings modal pills: hover tint
- [ ] Delete icons (history): hover status-danger color
- [ ] All inputs: focus-visible ring (accent-primary)

```tsx
// Example: TaskCard hover
className={`
  ... transition-colors duration-150
  ${isSelected
    ? 'bg-[#1a1a1a] text-[#f5c518] border-2 border-[#f5c518]'
    : 'bg-white border-[1.5px] border-[#f0e6c8] hover:bg-[#fff3cd]'
  }
`}

// Example: Format pill hover
className={`
  ... transition-all duration-150
  ${isActive
    ? 'bg-[#1a1a1a] text-[#f5c518]'
    : 'bg-[#f5f3ef] text-[#999999] hover:bg-[#e8e2d8]'
  }
`}

// Example: Add field "+" button hover
className="text-lg font-bold text-[#f5c518] hover:scale-110 transition-transform duration-150"

// Example: History item hover
className="px-4 py-3 hover:bg-[#f5f3ef] transition-colors duration-150 cursor-pointer"

// Example: Delete icon hover
className="text-[#cccccc] hover:text-[#ee5555] transition-colors duration-150"
```

**Verify:** Hover over every interactive element. Confirm a visual change occurs (color, brightness, or scale) within ~150ms. Tab through form inputs -- focus rings appear in accent-primary color.

---

## Task 14: Final integration verification

Run through the complete app experience verifying all Phase 6 changes work together.

- [ ] Full walkthrough at >= 1280px viewport width
- [ ] Full walkthrough at 1024px viewport width
- [ ] Verify all edge states fire correctly
- [ ] Verify help cards work on all fields
- [ ] Run the help-content test suite

Verification script:

1. **Load page** -- no task selected. Editor and preview show "Select a task type above to begin". Copy disabled at 40%.
2. **Select "Ask"** -- editor shows default fields. Preview shows skeleton with placeholders. Copy still disabled.
3. **Click [?] on Intent** -- yellow help card expands smoothly below the label, above the input. Shows "What is this?", "Suggestions", "Example". Click again -- collapses.
4. **Click [?] on every field visible** -- each shows correct bilingual help content matching help-content.ts.
5. **Switch UI language to Chinese** -- all labels, hints, help content, placeholders, empty state text switch to Chinese.
6. **Check AI Fill** (no API key) -- shows lock icon. Click -- Settings modal opens. Close Settings.
7. **Type in Intent** -- preview updates from skeleton to real content. Copy button becomes enabled.
8. **Clear Intent, check AI Fill** -- button at 40% opacity. Hover shows "Enter your intent first" tooltip.
9. **Open History** (empty) -- shows clock icon + "No history yet".
10. **Copy to clipboard** -- "Copied!" feedback. Open History -- one record appears.
11. **Resize to 1024px** -- task cards wrap to 3x2. Layout functional, no overlaps. Copy button stays pinned.
12. **Run test suite** -- `npx vitest run` -- help-content tests pass.

**Verify:** All 12 checks pass. Commit.

---

## Commit Strategy

| After Task | Commit Message |
|-----------|---------------|
| Tasks 1-2 | `feat: add bilingual help content data for all 45 fields with integrity test` |
| Tasks 3-4 | `feat: implement HelpCard component and wire [?] icon toggle` |
| Tasks 5-6 | `feat: implement empty/edge states for editor and preview` |
| Tasks 7-8 | `feat: implement AI Fill disabled/lock states and empty history state` |
| Task 9 | `feat: add placeholder text to all field input types` |
| Tasks 10-11 | `feat: responsive task selector grid and pinned copy button` |
| Tasks 12-13 | `style: align all CSS tokens and add hover/focus/transition polish` |
| Task 14 | `chore: phase 6 integration verification complete` |
