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
