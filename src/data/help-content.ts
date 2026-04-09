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
      en: "Don't overload this with details — let the other fields do their job.",
      zh: '不需要过多堆砌细节，可以善加利用其他的项目。',
    },
    example: {
      en: 'Help me write a product manager weekly report',
      zh: '帮我做一份产品经理的周报',
    },
  },
  context: {
    whatIsThis: {
      en: 'Background information that helps the AI understand your situation.',
      zh: '帮助 AI 理解你所处情境的背景信息。',
    },
    suggestions: {
      en: 'Imagine explaining your situation to a stranger — who you are, and why you need this.',
      zh: '想象你在向路人解释你的意图，你是谁、为什么要做这件事。',
    },
    example: {
      en: "I'm a PM at a B2B SaaS company, team of 10, just shipped two new features this week.",
      zh: '我是 B 端 SaaS 公司的产品经理，团队 10 人，本周刚上线了两个功能。',
    },
  },
  requirements: {
    whatIsThis: {
      en: 'Specific conditions that the output must satisfy.',
      zh: '输出必须满足的具体条件。',
    },
    suggestions: {
      en: 'Tell the AI what it must do here, not what to avoid.',
      zh: '在这里告诉AI必须做什么，而不是不要做什么。',
    },
    example: {
      en: "Must include three sections: this week's progress, next week's plan, and risk items",
      zh: '必须包含本周进展、下周计划和风险项三个板块',
    },
  },
  constraints: {
    whatIsThis: {
      en: 'Boundaries and things to avoid in the output.',
      zh: '输出的边界或需要避免的事项。',
    },
    suggestions: {
      en: 'Tell the AI what NOT to do here, not what it should do.',
      zh: '在这里告诉AI不要做什么，而不是应该做什么。',
    },
    example: {
      en: 'Avoid laundry-list style; no technical jargon',
      zh: '避免流水账式罗列；不得出现技术词汇',
    },
  },
  output_format: {
    whatIsThis: {
      en: 'The desired form of the AI response (paragraph, list, table, code, etc.).',
      zh: '期望AI 回复的形式（段落、列表、表格、代码等）。',
    },
    example: {
      en: 'Narrative paragraphs, with bullet lists and data tables',
      zh: '分段叙述，配合要点列表和数据表格',
    },
  },
  goal: {
    whatIsThis: {
      en: 'The desired end state or outcome you want to achieve.',
      zh: '你希望达成的最终状态或结果。',
    },
    suggestions: {
      en: "Describe what 'done' looks like — the acceptance criteria.",
      zh: '描述任务验收通过的标准。',
    },
    example: {
      en: "A weekly report that lets my boss grasp this week's product updates in two minutes",
      zh: '一份能两分钟内让老板掌握本周产品动态的周报',
    },
  },
  role: {
    whatIsThis: {
      en: 'The persona or role the AI should assume when responding.',
      zh: 'AI 回复时应扮演的角色或身份。',
    },
    example: {
      en: 'Senior product manager with 5 years of experience',
      zh: '有五年经验的资深产品经理',
    },
  },
  audience: {
    whatIsThis: {
      en: 'Who will read or use the output.',
      zh: '谁将阅读或使用输出内容。',
    },
    suggestions: {
      en: 'Specifying the audience helps the AI adjust complexity and tone.',
      zh: '指定受众有助于 AI 调整复杂度和语气。',
    },
    example: {
      en: 'Department director and business line leads',
      zh: '部门总监和各业务线负责人',
    },
  },
  assumptions: {
    whatIsThis: {
      en: 'Things the AI should take as given.',
      zh: 'AI 应视为既定事实的前提。',
    },
    suggestions: {
      en: 'Lets the AI skip unnecessary clarification and stay focused.',
      zh: '用于跳过不必要的澄清，让 AI 保持专注。',
    },
    example: {
      en: 'Readers are familiar with the product basics; no need to explain business context',
      zh: '读者了解产品基本情况，不需要解释业务背景',
    },
  },
  scope: {
    whatIsThis: {
      en: 'The boundary of what the response should cover.',
      zh: '回复应涵盖的范围边界。',
    },
    suggestions: {
      en: "Narrow or widen the AI's response — prevent tangents, or encourage exploration.",
      zh: '缩小或扩大 AI 回答的范围——防止跑题，或者鼓励发散。',
    },
    example: {
      en: 'Only cover my product line; do not discuss other teams',
      zh: '仅涵盖我负责的产品线，不涉及其他团队',
    },
  },
  priority: {
    whatIsThis: {
      en: 'What matters most when trade-offs arise.',
      zh: '当需要取舍时，什么最重要。',
    },
    example: {
      en: 'Data accuracy over visual formatting',
      zh: '数据准确性优先于排版美观',
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
      zh: '回复的详细程度：摘要、标准或详细。',
    },
  },
  tone: {
    whatIsThis: {
      en: 'The tone and style of the AI response.',
      zh: 'AI 回复的语气和风格。',
    },
    suggestions: {
      en: 'Pick a tone that fits your audience and context — technical docs and everyday emails sound very different.',
      zh: '根据受众和场景选择语气。比如技术文档和日常邮件的语气就很不一样。',
    },
    example: {
      en: 'Concise and professional, with moderate emphasis on achievements',
      zh: '简洁专业，适度突出成果',
    },
  },
  thinking_style: {
    whatIsThis: {
      en: "The AI's reasoning style: direct answer, step-by-step, or pros-and-cons.",
      zh: 'AI 的推理方式：直接回答、分步说明或利弊分析。',
    },
    suggestions: {
      en: 'Pick "step-by-step" for tutorials, "pros-and-cons" for decisions, "direct answer" for quick lookups.',
      zh: '教程用"分步说明"，决策用"利弊分析"，快速查询用"直接回答"。',
    },
  },
  examples: {
    whatIsThis: {
      en: 'Reference examples showing what the ideal output looks like.',
      zh: '展示理想输出效果的参考示例。',
    },
    suggestions: {
      en: 'Providing even one example dramatically improves AI output quality.',
      zh: '即使提供一个示例也能显著提升 AI 输出质量。',
    },
    example: {
      en: 'Input: "Launched user segmentation" → Output: "[Progress] User segmentation launched, reaching 3000+ users in week one, CTR up 12%"',
      zh: '输入："上线了用户分群" → 输出："【进展】用户分群上线，首周覆盖 3000+ 用户，点击率提升 12%"',
    },
  },
  anti_examples: {
    whatIsThis: {
      en: 'Counter-examples showing what the output should NOT look like.',
      zh: '反面示例，展示输出不应该是什么样子。',
    },
    suggestions: {
      en: "If there's a specific bad pattern you want to avoid, show a counter-example here.",
      zh: '如果有明确想避免的错误写法，可以在这里举个反例。',
    },
    example: {
      en: 'Do NOT produce output like: "Did a lot this week" (too vague, no data to back it up)',
      zh: '不要产生这样的输出："本周做了很多事"（太笼统，没有数据支撑）',
    },
  },
  references: {
    whatIsThis: {
      en: 'Specific sources or materials the AI should consult or cite.',
      zh: 'AI 应参考或引用的特定来源或材料。',
    },
    suggestions: {
      en: 'Sources the AI can look up directly. Paste the text, or provide URLs if your AI can browse the web.',
      zh: '供 AI 直接查询的信源。可以直接粘贴原文，如果你的 AI 具备网页能力，也可以直接提供 URL。',
    },
    example: {
      en: "Company weekly report template; this week's product data dashboard",
      zh: '公司周报模板；本周产品数据看板',
    },
  },
  custom_fields: {
    whatIsThis: {
      en: 'User-defined key-value pairs for needs not covered by built-in fields. Keys become field names; values become field values.',
      zh: '用户自定义的键值对，用于内置字段未涵盖的需求。键会成为字段名，值会成为字段值。',
    },
    example: {
      en: 'report_cycle: Submit every Friday afternoon',
      zh: '汇报周期: 每周五下午提交',
    },
  },
  question_type: {
    whatIsThis: {
      en: "What kind of question you're asking: a fact, a concept, a how-to, or an opinion.",
      zh: '问题的性质：你是询问一件事实、某个概念、怎么做某事或者要求提供观点。',
    },
  },
  knowledge_level: {
    whatIsThis: {
      en: 'How well you know the topic: beginner, intermediate, or expert.',
      zh: '你对这个主题的了解程度：初学者、中级或专家。',
    },
    suggestions: {
      en: 'Lets the AI know how deep to go — beginner gets more background, expert cuts to the chase.',
      zh: '让 AI 知道该讲多细——选初学者会多给背景，选专家则直奔重点。',
    },
  },
  content_type: {
    whatIsThis: {
      en: 'What you want to create: email, article, documentation, code, or script.',
      zh: '你想创建的内容类型：邮件、文章、文档、代码或脚本。',
    },
  },
  key_points: {
    whatIsThis: {
      en: 'Key points or core features the output must cover.',
      zh: '输出必须涵盖的要点或核心功能。',
    },
    example: {
      en: "Features shipped this week; key metric changes; next week's priorities",
      zh: '本周上线功能；关键指标变化；下周优先事项',
    },
  },
  tech_stack: {
    whatIsThis: {
      en: 'Programming languages, frameworks, and libraries relevant to the task.',
      zh: '与任务相关的编程语言、框架和库。',
    },
    example: {
      en: 'Python 3; Pandas; Feishu Bitable API',
      zh: 'Python 3；Pandas；飞书多维表格 API',
    },
  },
  target_length: {
    whatIsThis: {
      en: 'The expected length or scale of the output.',
      zh: '输出的预期长度或规模。',
    },
    suggestions: {
      en: 'Use descriptive terms ("brief", "detailed") or item counts ("10 items"). Avoid word or line counts — most AIs struggle to follow those.',
      zh: '多使用描述性语言（"简短"、"详细"），或者编号数量（"10项"、"15条"）。避免使用字数、行数等，多数情况下 AI 不擅长遵循此类指示。',
    },
    example: {
      en: 'At least 10 items completed this week',
      zh: '至少十条本周完成的事项',
    },
  },
  structure: {
    whatIsThis: {
      en: 'The expected structure or outline of the output.',
      zh: '输出的预期结构或大纲。',
    },
    suggestions: {
      en: 'For longer outputs, draft an outline first (or have the AI generate one) and let it fill in the content.',
      zh: '当你需要的内容较多，可以先列出（或者生成）一个大纲，让 AI 往大纲里填充内容。',
    },
    example: {
      en: "1. This week's highlights  2. Feature progress  3. Data overview  4. Risks & blockers  5. Next week's plan",
      zh: '1. 本周亮点  2. 功能进展  3. 数据概览  4. 风险与阻塞  5. 下周计划',
    },
  },
  include_tests: {
    whatIsThis: {
      en: 'Whether to generate test code along with the main output.',
      zh: '是否同时生成测试代码。',
    },
  },
  source_content: {
    whatIsThis: {
      en: 'The original content you want to transform.',
      zh: '你要转换的原始内容。',
    },
    suggestions: {
      en: 'Just paste it in.',
      zh: '贴进来就完事了。',
    },
  },
  transform_type: {
    whatIsThis: {
      en: 'What to do with the content: summarize, translate, rewrite, simplify, or convert format.',
      zh: '你想对内容做什么：摘要、翻译、改写、简化或格式转换。',
    },
  },
  preserve: {
    whatIsThis: {
      en: 'Information or characteristics that must be preserved during transformation.',
      zh: '转换过程中必须保留的信息或特征。',
    },
    suggestions: {
      en: 'For example: tone, key terms, structure, data, etc.',
      zh: '可以是语气、关键术语、结构、数据等。',
    },
    example: {
      en: 'All data and percentages; project codenames; original conclusions unchanged',
      zh: '所有数据和百分比、项目代号、原始结论不变',
    },
  },
  subject: {
    whatIsThis: {
      en: 'The material or content to analyze.',
      zh: '要分析的对象或内容。',
    },
    suggestions: {
      en: 'Just paste it in.',
      zh: '贴进来就完事了。',
    },
  },
  analyze_type: {
    whatIsThis: {
      en: 'What you want the AI to do: evaluate, compare, or interpret data.',
      zh: '你希望 AI 做什么：评估、比较或数据解读。',
    },
  },
  criteria: {
    whatIsThis: {
      en: 'What dimensions or standards to evaluate against.',
      zh: '根据哪些维度或标准进行评估。',
    },
    example: {
      en: 'User satisfaction; Revenue impact; Implementation difficulty; Time cost',
      zh: '用户满意度；营收影响；实施难度；时间成本',
    },
  },
  compared_subjects: {
    whatIsThis: {
      en: 'The items to compare side by side.',
      zh: '要进行并列比较的项目。',
    },
  },
  benchmark: {
    whatIsThis: {
      en: 'A reference standard or baseline to compare against.',
      zh: '用于对比的参考标准或基准线。',
    },
    example: {
      en: 'Industry average next-day retention 40%; Competitor X conversion rate 15%',
      zh: '行业平均次日留存率 40%；竞品 X 转化率 15%',
    },
  },
  problem: {
    whatIsThis: {
      en: 'The problem to solve or direction to explore.',
      zh: '要解决的问题或要探索的方向。',
    },
    suggestions: {
      en: "Tell the AI what problem you've hit, especially what makes it tricky.",
      zh: '直接告诉 AI 你碰到的问题，特别是让你感到棘手的地方。',
    },
    example: {
      en: 'New user next-day retention dropped from 35% to 22% — cause unknown',
      zh: '新用户次日留存从 35% 骤降至 22%，原因不明',
    },
  },
  current_state: {
    whatIsThis: {
      en: "Current progress, available resources, what you've already tried, etc.",
      zh: '包括目前的进度、可用的资源、尝试过的方案，等等。',
    },
  },
  idea_count: {
    whatIsThis: {
      en: 'How many ideas or options the AI should generate.',
      zh: 'AI 应生成多少个创意或方案。',
    },
    suggestions: {
      en: "More ideas means more divergence but less depth each. 3\u20135 is usually a good sweet spot.",
      zh: '数量越多越发散，但每个创意的深度会越浅。通常 3–5 个比较合适。',
    },
  },
  evaluation_criteria: {
    whatIsThis: {
      en: 'Standards for judging how good the ideas are.',
      zh: '评判创意好坏的标准。',
    },
    suggestions: {
      en: 'Set criteria so the AI can rank or filter its own ideas before presenting them.',
      zh: '设定标准，让 AI 在展示创意前能自行排序或筛选。',
    },
    example: {
      en: 'Feasibility; User impact; Development cost; Time to results',
      zh: '可行性；用户影响；开发成本；见效速度',
    },
  },
  plan: {
    whatIsThis: {
      en: 'Steps or workflow for the task.',
      zh: '任务的步骤或工作流。',
    },
    suggestions: {
      en: 'Rough steps for the Agent to follow in this session — useful when you have multiple tasks to get through. For detailed plans, put them in a file the Agent can read.',
      zh: '这是你希望 Agent 在会话中遵循的大致的步骤，适用于有多个任务想要在这次会话里完成的情况。对于详尽的实现计划，建议直接放到 Agent 可读的文件里。',
    },
  },
  tools_to_use: {
    whatIsThis: {
      en: 'Skills, Tools, MCPs, etc. you want the Agent to use explicitly.',
      zh: '你希望显式指定 Agent 使用的Skill, Tool, MCP等。',
    },
  },
  checkpoints: {
    whatIsThis: {
      en: 'Points where the Agent should stop and check in with you.',
      zh: '你希望 Agent 停下来和你确认的节点',
    },
  },
  error_handling: {
    whatIsThis: {
      en: 'What the Agent should do when something goes wrong — retry, skip, abort, or ask you for help.',
      zh: '执行过程中发生意外情况时 Agent 该怎么做，例如重试、跳过、中止或者寻求你的帮助。',
    },
  },
  success_criteria: {
    whatIsThis: {
      en: 'Observable signals the Agent can use to confirm the task is done — e.g. build passes, test coverage, or manual sign-off.',
      zh: 'Agent 可以用来判断任务完成的可观察指标，例如编译通过、测试覆盖率、或者要求人工确认。',
    },
  },
};
