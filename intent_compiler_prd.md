# PRD｜Intent Compiler（提示词构建工具）

## 目录

1. 产品摘要 / 一页纸结论  
2. 问题定义与机会点  
2.5. 竞品分析与差异化定位  
3. 用户细分与 JTBD  
4. 核心概念定义：Prompt IR / Template / Renderer / AI Assist  
5. 产品范围：MVP、后续版本、非目标  
6. 信息架构与关键对象模型  
7. 关键用户流程  
8. 交互设计原则与关键页面模块  
9. Prompt IR / JSON Schema 在产品中的角色与边界  
10. 渲染策略：从 IR 生成不同风格 Prompt  
11. 风险、取舍与失败模式  
12. 成功指标与埋点建议  
13. 里程碑 / Phased Roadmap  
14. 未决问题与建议决策  
15. 附录：MVP Prompt IR 字段草案与示例  
    15.1 增强版 IR JSON Schema  
    15.2 IR 实例  
    15.3 渲染示例  
    15.4 answer_mode 冲突矩阵  
    15.5 版本化契约  
    15.6 Draft → IR 编译契约  
    15.7 冲突校验规则形式化定义  
    15.8 克制性说明

---

# 1. 产品摘要 / 一页纸结论

## 1.1 产品结论

Intent Compiler 不是一个“帮用户把 prompt 写得更花”的编辑器，而是一个把任务意图、目标、约束、输出要求进行结构化编译的产品层。它的核心价值不是提升回答质量的理论上限，而是降低发问摩擦、减少错配、提高结果稳定性与可复用性。

这意味着产品主路径必须是：

- 以 **无 AI 模式** 为默认入口
- 以 **模板 + 少量关键槽位 + 强默认值** 为主要交互
- 以 **统一 Prompt IR** 为底层协议
- 以 **Renderer** 而不是“自由编辑大文本框”作为输出机制
- 以 **减少常见错配** 而不是“完整表达世界上所有意图”作为设计目标

本产品最合理的 MVP，不是做一个万能 prompt builder，也不是做一个 AI 面试式问答向导，而是做一个：

**面向高频任务类型的、可编译、可复用、可导出的意图构建器。**

## 1.2 核心产品判断

### 应坚持的判断

1. **内容决定效果上限，格式决定效果稳定性。**  
   产品不应承诺“格式化以后一定更聪明”，只能承诺“更少漏约束、更少题型错配、更易复用”。

2. **自然语言不是对手，而是上游输入。**  
   很多好问题天然先以自然语言出现。产品要做的是把自然语言问题编译为更稳定的结构化意图，而不是要求用户一开始就按机器语法思考。

3. **JSON IR 是系统协议，不是普通用户界面。**  
   把 JSON 暴露为主交互会显著抬高门槛，也会让产品退化为“程序员工具”。普通用户应操作 UI、模板、字段与默认值，而不是 schema。

4. **AI 只能是增强插件，不能是默认前置。**  
   否则产品会在最核心的输入阶段引入额外成本、额外延迟、额外不确定性，还会破坏“低成本发起”的主价值。

5. **产品目标是减少错配，而不是追求表达完备。**  
   真正高频的问题不是“用户完全不会表达”，而是“题型选错、边界漏掉、输出要求缺失、模型行为预期没有声明”。

## 1.3 对当前设想的修正

### 修正 1：不要把“任务类型”做成过细的知识分类树

你的设想里已经隐含“题型”概念，这是对的。但如果把题型做得过细，会把产品推向复杂表单和维护地狱。MVP 中任务类型应控制在少量高频类型，允许后续通过模板扩展，而不是在一级分类里穷举。

建议：先固定 6–8 个高频任务类型，而不是做开放分类体系。

### 修正 2：不要把“Prompt IR”设计成通用知识表示层

IR 不是语义世界模型，而是 **面向生成 prompt 的中间表示**。如果 schema 试图表达一切，将导致模板难写、渲染难控、版本演进困难。

建议：IR 只覆盖与“任务执行约束”直接相关的信息，不承载长期知识库、复杂多轮对话状态或工作流编排逻辑。

### 修正 3：不要把 AI 模式设计成“追问型 interviewer”

这会直接破坏效率。AI 模式的主职责应是 **一次性生成 70% 正确的草案**，再让用户修，而不是通过长对话把用户变成信息录入员。

建议：AI 模式最多允许 0–2 个澄清问题，并且必须在“不问会明显答偏”的条件下才触发。

### 修正 4：不要默认用户想要“最佳 prompt”

很多用户并不在意 prompt 是否优雅，只在意能不能稳定地产出他们想要的回答格式和推理边界。产品不应优化“prompt 美学”，而应优化“结果一致性”和“组装成本”。

## 1.4 一句话定位

**一个把用户原始问题编译为可执行意图结构，并渲染成稳定 prompt 的工具。**

## 1.5 MVP 结论

MVP 应优先交付四件事：

1. 高质量任务模板体系  
2. 统一 Prompt IR 及版本化  
3. 无 AI 的表单式构建与即时渲染  
4. 模板保存、复用、导出

AI Assist、团队共享、模板市场、工作流串联都应该排在后面。

---

# 2. 问题定义与机会点

## 2.1 用户当前的问题，不是“不会说话”，而是高频表达成本过高

大多数用户不是完全没有任务意图，而是在每次发起对话时，都要重复组织以下内容：

- 这是哪一类问题
- 我要什么结果
- 模型应该怎么回答
- 有哪些约束不能违反
- 哪些内容不要展开
- 输出应该长什么样

这个过程存在三个实际问题：

1. **重复劳动**：同类任务每次都要重新组织。  
2. **高漏损率**：约束、边界、输出要求经常漏掉。  
3. **结果不稳定**：相同任务因表达差异导致回答波动大。

## 2.2 真正的机会点不在“高级 prompt 教学”，而在“隐性协议外显化”

高质量对话通常依赖一套隐性协议，例如：

- 先给结论还是先铺背景
- 是局部机制检查还是生产设计评估
- 是否需要挑战提问者的前提
- 输出是决策建议、解释、代码还是步骤
- 是否要考虑现实约束

大多数用户并不会每次都明确写出这些协议，但结果又高度受其影响。这里存在明确的产品机会：

**把这些高频隐性协议做成模板、字段、默认值和可复用结构。**

## 2.3 当前替代方案为什么不够好

### 方案 A：纯自然语言直接提问

优点：低门槛。  
问题：稳定性差、难复用、难共享、难模板化。

### 方案 B：手工维护 prompt 模板文档

优点：可复用。  
问题：难参数化、难按任务动态调整、难做冲突校验。

### 方案 C：AI 追问式 prompt 生成器

优点：看起来智能。  
问题：延迟高、token 成本高、流程长、不可预测、用户控制感差。

### 方案 D：直接暴露 JSON / Schema 编辑器

优点：系统统一、工程实现直接。  
问题：普通用户门槛过高，且会把产品价值错误地转移到“写结构”而不是“表达任务”。

## 2.4 核心机会判断

最可落地的机会不是“替代提问”，而是：

- 在任务发起前，帮助用户快速补齐最关键的结构化约束
- 在任务发起后，产出稳定、可复制、可复用的 prompt
- 在多次使用后，沉淀为个人或团队模板资产

---

# 2.5 竞品分析与差异化定位

## 2.5.1 竞品全景

Intent Compiler 处于"意图结构化编译"这一尚未被明确定义的品类中。当前市场上不存在直接同类产品，但有多个方向的产品在部分维度上构成替代或竞争关系。按其核心逻辑可分为以下五类：

1. **平台级 Prompt 配置能力**：ChatGPT Custom Instructions / Projects、Claude Projects
2. **Prompt 管理与增强前端**：TypingMind、Cursor Rules / Windsurf Rules
3. **Prompt 社区与模板市场**：AIPRM、FlowGPT
4. **AI 驱动的 Prompt 优化器**：PromptPerfect
5. **开发者级 Prompt 工程平台**：LangSmith Prompt Hub、PromptLayer
6. **嵌入式 AI 写作助手**：Notion AI

## 2.5.2 竞品功能矩阵

| 能力维度 | Intent Compiler | ChatGPT Custom Instructions / Projects | TypingMind | AIPRM | PromptPerfect | FlowGPT | Cursor / Windsurf Rules | Notion AI | PromptLayer / LangSmith Hub |
|---|---|---|---|---|---|---|---|---|---|
| **结构化输入** | ★★★★★ 表单式字段构建 + IR 编译 | ★★☆ 自由文本框，无字段引导 | ★★☆ 自定义 System Instruction，无结构拆分 | ★★☆ 变量占位符，无深度结构 | ★☆☆ 纯文本输入后 AI 优化 | ★☆☆ 纯文本 prompt 发布 | ★★★ Markdown 规则文件 + 自动/手动触发 | ★★☆ 自然语言指令，无结构拆分 | ★★★ 模板变量 + SDK 调用 |
| **模板管理** | ★★★★★ 任务类型驱动的模板体系 + 字段约束 | ★★☆ GPTs/Projects 级别的预设，无字段级管理 | ★★★ Prompt Library + Agent 预设 | ★★★★ 4500+ 社区模板，分类筛选 | ★★☆ 基础模板保存 | ★★★★ 社区驱动的 Prompt 市场 | ★★★ .cursor/rules 项目级规则文件 | ★★☆ Notion 模板中嵌入 AI Prompt | ★★★ 模板注册与管理 |
| **渲染/导出** | ★★★★★ 多 Renderer（NL / 混合文本 / 混合 JSON / 纯 JSON） | ★☆☆ 无导出，prompt 内嵌于平台 | ★★☆ 复制/导出聊天记录 | ★★☆ 复制生成的 prompt 文本 | ★★★ 多模型适配导出 | ★☆☆ 仅平台内使用 | ★★☆ 规则文件可版本控制但无渲染 | ★☆☆ 无独立导出 | ★★★ API 调用 + 模板渲染 |
| **AI 辅助** | ★★★ 可选插件：草案生成 + 题型推断 | ★★★★ GPT 原生能力加持 | ★★★ 多模型切换 + Agent | ★★☆ 基于社区最佳实践 | ★★★★★ 核心卖点：自动优化 prompt | ★★☆ 依赖底层模型 | ★★★★ Agent 模式自动应用规则 | ★★★★ Notion AI 原生集成 | ★★★ 评估与测试 |
| **复用能力** | ★★★★★ 模板保存 + 实例复用 + fork | ★★★ GPTs/Projects 可复用但粒度粗 | ★★★ Prompt Library + Agent 复用 | ★★★ 收藏与复用社区 prompt | ★★☆ 有限保存 | ★★★ 收藏与 fork prompt | ★★☆ 规则文件项目间可复制 | ★★☆ 模板复用 | ★★★★ SDK 级复用 |
| **IR / 中间层** | ★★★★★ 统一 Prompt IR（canonical JSON） | ☆ 无中间表示 | ☆ 无中间表示 | ☆ 无中间表示 | ★☆☆ 优化前后对比但无标准 IR | ☆ 无中间表示 | ★★☆ 规则文件是半结构化中间层 | ☆ 无中间表示 | ★★★ 模板即中间层，但面向开发者 |
| **版本化** | ★★★★ schema_version + 模板版本 + 迁移 | ★☆☆ 无版本管理 | ★☆☆ 基础聊天历史 | ★☆☆ 无版本控制 | ★☆☆ 无 | ★☆☆ 无 | ★★★★ Git 原生版本控制 | ★★☆ Notion 页面历史 | ★★★★★ 专业版本管理 + 回滚 |
| **团队协作** | ★★☆ MVP 后期支持（Phase 3） | ★★★ Teams/Enterprise 共享 GPTs | ★★★ 团队版部署 + 共享 Agent | ★★★ 团队共享模板 | ★★☆ Enterprise 方案 | ★★★ 社区公开分享 | ★★★★ Git 协作 + 项目共享 | ★★★★ Notion 原生协作 | ★★★★ 团队级权限与协作 |

**评分说明**：★ 为最低，★★★★★ 为最高，衡量的是该维度上的能力深度而非简单有无。

## 2.5.3 逐竞品差异化分析

### A. ChatGPT Custom Instructions / Projects / Claude Projects

**产品逻辑**：平台级 prompt 预配置能力，用户在自由文本框中写入"关于我"和"希望如何回答"的全局指令，或在 Projects 中设定项目级 system prompt + 上传知识文件。

**与 Intent Compiler 的关键差异**：

- **无结构化拆分**：Custom Instructions 本质是一段自由文本，不区分任务类型、约束、输出要求、禁止项。用户需要自己想清楚该写什么，写完之后也没有校验。
- **无任务类型驱动**：不按"评估方案"、"代码调试"、"比较决策"等任务类型提供差异化字段集和默认值。
- **无渲染层**：写什么就是什么，不存在从结构化意图到不同风格 prompt 的编译过程。
- **无跨平台导出**：指令只在该平台内生效，无法导出到其他模型或工具。

**Intent Compiler 的优势**：以字段为粒度进行结构化编辑，而非让用户面对空白文本框自行组织。提供冲突校验、默认值注入、多风格渲染导出。

### B. TypingMind

**产品逻辑**：增强型 AI 聊天前端，核心价值是多模型切换 + BYO API Key + Prompt Library + AI Agent 预设。支持 Prompt Template 变量替换和知识库 RAG。

**与 Intent Compiler 的关键差异**：

- **Prompt Library 是"存储"而非"编译"**：TypingMind 的 Prompt Library 只负责保存和调用预写好的 prompt 文本，不具备从任务意图到 prompt 的结构化编译能力。
- **Agent 预设是"角色"而非"任务"**：其 60+ 内置 Agent（如"后端工程师"、"学术研究者"）定义的是角色身份，不是任务类型与约束的结构化组合。
- **无 IR 层**：所有 prompt 存储为纯文本，无法做跨风格渲染、字段级冲突校验或版本迁移。
- **无字段分层投放**：不区分"应自然语言表达的高影响字段"和"应保留为 JSON 约束的结构化字段"。

**Intent Compiler 的优势**：不是"存一个 prompt"，而是"编译一个意图结构并按策略渲染"。模板粒度从"一段文本"提升到"字段 + 默认值 + 校验规则 + 渲染策略"。

### C. AIPRM

**产品逻辑**：Chrome 插件形态的 prompt 模板社区。提供 4500+ 社区贡献的 prompt 模板，支持按类别/用途筛选，一键填入 ChatGPT。

**与 Intent Compiler 的关键差异**：

- **模板是"完整文本"而非"可编译结构"**：AIPRM 的模板本质是预写好的 prompt 全文 + 少量变量占位符（如 [KEYWORD]、[TOPIC]）。用户填入变量后直接发送，没有任务约束、输出要求、冲突检测等结构化层。
- **无编译过程**：从填变量到使用 prompt，中间不存在 IR 编译、默认值注入、字段校验。
- **质量参差不齐**：社区驱动模板数量大但质量不可控，缺乏系统性的字段设计和渲染策略。
- **深度绑定 ChatGPT/Claude 平台**：作为浏览器插件依附于特定平台，无法跨平台导出。

**Intent Compiler 的优势**：模板不是"一段写好的文本"，而是"一套可编译、可校验、可渲染的任务意图结构"。模板质量由字段设计和 schema 保证，而非依赖社区自律。

### D. PromptPerfect

**产品逻辑**：AI 驱动的 prompt 自动优化器。用户输入原始 prompt，系统自动优化为更有效的版本。支持多模型适配和 A/B 对比。

**与 Intent Compiler 的关键差异**：

- **"优化"而非"编译"**：PromptPerfect 的输入和输出都是自然语言 prompt 文本，它做的是"把一段话改得更好"，而不是"从结构化意图生成 prompt"。
- **无结构化输入**：用户仍然需要先自己写出一段 prompt，然后交给 AI 优化。没有解决"用户不知道该写哪些维度"的根本问题。
- **无模板体系**：不按任务类型提供差异化字段引导，也不支持将优化后的 prompt 沉淀为可复用模板。
- **AI 依赖度过高**：每次优化都需要 AI 调用，增加了成本和延迟，也引入了不确定性。

**Intent Compiler 的优势**：从"补全用户表达"出发而非从"改善已有表达"出发。无 AI 模式即可完成高质量 prompt 构建，AI 只是可选增强。结构化编译比黑盒优化更可控、可复用、可解释。

### E. FlowGPT

**产品逻辑**：社区驱动的 prompt 分享与发现平台。用户可以发布、搜索、使用和评分 prompt，类似"prompt 版的 Product Hunt"。

**与 Intent Compiler 的关键差异**：

- **社区市场而非构建工具**：FlowGPT 的核心是发现和分享，不是构建和编译。用户找到别人的 prompt 直接使用，而不是从自己的任务意图出发构建。
- **无结构化层**：所有 prompt 以纯文本形态存在，无 IR、无字段拆分、无渲染策略。
- **面向灵感而非面向稳定性**：平台上大量 prompt 面向创意、角色扮演等场景，不以"减少任务错配、提高结果稳定性"为设计目标。

**Intent Compiler 的优势**：是"构建器"而非"市场"。解决的是"如何从意图到可执行 prompt"的编译问题，而非"如何发现别人写好的 prompt"的搜索问题。

### F. Cursor Rules / Windsurf Rules

**产品逻辑**：AI 编程 IDE 中的规则管理系统。通过 `.cursor/rules/` 或 `.windsurf/rules/` 目录下的 Markdown 文件定义项目级、全局级的 AI 行为规则。支持自动触发、手动引用、glob 匹配等激活模式。

**与 Intent Compiler 的关键差异**：

- **开发者专属**：规则系统面向程序员，以代码项目为上下文，不适用于通用知识工作任务。
- **规则是"行为约束"而非"任务编译"**：规则文件定义的是"AI 在这个项目里应遵守的长期约束"（如编码风格、架构偏好），而非"本次任务的目标、约束、输出要求"。
- **无渲染层**：规则直接注入 system prompt，不存在从 IR 到多种输出风格的渲染过程。
- **无任务类型区分**：同一套规则应用于所有交互，不按"代码生成"、"调试"、"架构评估"等任务类型提供差异化字段集。

**Intent Compiler 的优势**：面向单次任务的结构化意图编译，而非面向项目的长期行为规则配置。支持任务类型驱动的差异化字段集、字段分层投放和多风格渲染。

**值得学习之处**：Cursor/Windsurf 的规则文件 + Git 版本控制的模式值得参考。Intent Compiler 的模板版本化可以借鉴其"规则即代码"的理念。

### G. Notion AI

**产品逻辑**：嵌入在 Notion 工作空间中的 AI 助手。支持文本生成、改写、总结、翻译等操作，以及通过 AI 属性自动填充数据库字段。模板市场中有 AI prompt 相关模板。

**与 Intent Compiler 的关键差异**：

- **AI 是文档工具的附属功能**：Notion AI 的 prompt 能力嵌入在笔记/文档编辑场景中，不是独立的意图编译产品。
- **无结构化 prompt 构建**：用户通过自然语言指令与 Notion AI 交互，不存在字段拆分、任务类型选择、约束校验等结构化构建过程。
- **无导出为 prompt 的需求**：Notion AI 的输出是文档内容，不是可导出到其他模型的 prompt。
- **社区模板是"Notion 页面模板"**：模板中包含的 AI prompt 是页面使用说明的一部分，不是结构化的意图编译模板。

**Intent Compiler 的优势**：专注于"从任务意图到可执行 prompt"的编译链路，而非"在文档中调用 AI"。产品深度和专业度远超嵌入式 AI 助手。

### H. PromptLayer / LangSmith Prompt Hub

**产品逻辑**：面向开发者和 AI 工程团队的 prompt 管理平台。提供 prompt 版本控制、A/B 测试、性能监控、团队协作和 SDK 集成。

**与 Intent Compiler 的关键差异**：

- **面向开发者而非终端用户**：这类平台的核心用户是 AI 工程师和 LLMOps 团队，交互以 SDK/API 为主，不提供面向普通用户的表单式构建 UI。
- **管理"已有 prompt"而非"编译意图"**：这类平台假设用户已经有 prompt，需要的是版本管理、测试和部署。不解决"从任务意图到 prompt"的生成问题。
- **无任务类型驱动的模板**：模板是通用的变量占位符系统，不按知识工作任务类型提供差异化字段集和默认值。

**Intent Compiler 的优势**：面向终端用户（知识工作者）而非开发者。从"意图输入"到"prompt 输出"的全链路覆盖，而非仅覆盖"prompt 管理"。

**值得学习之处**：版本管理、评估测试、团队协作的成熟模式可供 Intent Compiler Phase 3 参考。

## 2.5.4 Intent Compiler 的防守壁垒总结

### 壁垒 1：Prompt IR——唯一具备统一中间表示的产品

当前市场上没有竞品具备真正的"意图中间表示层"。ChatGPT 的 Custom Instructions 是自由文本，AIPRM 的模板是带变量的文本片段，TypingMind 的 Prompt Library 是存储的纯文本，PromptPerfect 做的是文本到文本的优化。

**只有 Intent Compiler 将用户意图编译为 canonical JSON IR**，并以此为基底支撑校验、渲染、版本化和复用。这个中间层是产品后续所有高阶能力（多 Renderer、字段冲突检测、模板迁移、跨模型适配）的基础设施。竞品若要复制这一能力，需要从底层重建产品架构。

### 壁垒 2：字段分层投放——独有的渲染策略

Intent Compiler 的混合渲染模式不是简单地"前面放自然语言、后面贴 JSON"，而是基于字段语义将高影响字段编织进自然语言段落、将结构化约束保留在 JSON 块中。这种**字段分层投放（Field-Tiered Rendering）**策略在当前竞品中没有对应实现。

PromptPerfect 做的是整段文本优化，不区分字段语义；AIPRM 直接输出完整文本；ChatGPT Custom Instructions 没有渲染层。Intent Compiler 的 Renderer 能根据字段属性自动决定哪些信息该用自然语言表达、哪些该保留为结构化约束，这是核心产品壁垒。

### 壁垒 3：任务类型驱动的模板体系——比"通用模板库"更深

AIPRM 和 FlowGPT 拥有数千个模板，但它们的模板是"写好的 prompt 文本 + 几个变量"。Intent Compiler 的模板是"字段配置 + 默认值 + 校验规则 + 渲染策略"的结构化组合，与 IR schema 深度绑定。

这意味着 Intent Compiler 的模板不只是"方便复制"，而是能做到：
- 根据任务类型动态显示/隐藏字段
- 注入经过设计的默认值来减少填写量
- 在字段间进行冲突检测
- 用同一模板生成多种风格的 prompt

社区模板数量优势不构成壁垒，模板的**结构化深度**才是。

### 壁垒 4：无 AI 模式为主路径——更低摩擦、更可控

PromptPerfect 以 AI 优化为核心卖点，每次使用必须调用 AI。ChatGPT Custom Instructions 本质上是"给 AI 提前写好的话"。Intent Compiler 的主路径不依赖 AI：用户选模板、填少量字段、系统编译渲染、用户复制导出。

这意味着：
- **零 AI 成本、零延迟**的核心流程
- **确定性输出**：同样的输入必然产出同样的 prompt，无随机性
- **用户保持完全控制**：不会出现"AI 改了我不想改的地方"

AI Assist 作为可选增强而非必需路径，使 Intent Compiler 在成本、速度和可控性三个维度上优于 AI-first 的竞品。

### 壁垒 5：编译链路完整性——从输入到输出的全覆盖

拆解当前竞品的覆盖范围：

| 链路环节 | 输入结构化 | 中间编译 | 校验/冲突检测 | 多风格渲染 | 导出/复用 |
|---|---|---|---|---|---|
| ChatGPT CI | 弱 | 无 | 无 | 无 | 无 |
| TypingMind | 弱 | 无 | 无 | 无 | 弱 |
| AIPRM | 弱 | 无 | 无 | 无 | 弱 |
| PromptPerfect | 无 | AI 黑盒 | 无 | 部分 | 弱 |
| Cursor Rules | 中 | 无 | 无 | 无 | 中 |
| PromptLayer | 中 | 无 | 无 | 部分 | 强 |
| **Intent Compiler** | **强** | **强** | **强** | **强** | **强** |

没有任何一个竞品覆盖了"结构化输入 → IR 编译 → 冲突校验 → 多风格渲染 → 导出复用"的完整链路。这条编译链路的完整性，就是 Intent Compiler 最不可替代的系统级壁垒。

---

# 3. 用户细分与 JTBD

## 3.1 用户分层

### 用户 A：高频 AI 用户

特征：会提问，但不想每次重组表达。  
需求：高效率、低摩擦、可复用、结果稳定。  
敏感点：讨厌冗长引导，讨厌被教育，讨厌被 AI 反复追问。

### 用户 B：任务明确但不懂 prompt engineering 的普通用户

特征：知道自己要什么，但不知道怎样表达更稳定。  
需求：少填、可选、可理解、能直接得到可用结果。  
敏感点：怕复杂、怕术语、怕“像在配系统”。

### 用户 C：重度模板用户 / 团队协作者

特征：需要沉淀模板、共享流程、统一输出风格。  
需求：模板管理、版本化、分享、权限、可维护性。  
敏感点：模板失控、字段膨胀、兼容性问题。

## 3.2 JTBD

### JTBD 1：快速构造一个不会跑偏的任务请求

当我想让 AI 帮我做某类高频任务时，  
我希望不需要每次从零组织题型、目标、约束与输出要求，  
从而更快得到稳定的结果。

### JTBD 2：把一个常做的任务沉淀成模板

当我已经反复做同类任务时，  
我希望把它固化成一个可复用模板，  
从而减少重复输入并提升组织内一致性。

### JTBD 3：把模糊自然语言问题整理成更可执行的请求

当我脑子里只有一个粗略问题时，  
我希望产品能帮我收束到少量关键槽位，  
从而避免漏掉必要条件又不被迫经历长对话。

### JTBD 4：导出适配不同模型 / 场景的 prompt

当我面对不同模型、不同平台或不同使用习惯时，  
我希望同一份意图结构可以渲染为不同风格的 prompt，  
从而不需要维护多份内容。

## 3.3 优先级判断

MVP 主要服务用户 A 与用户 C 的轻量需求。  
用户 B 也覆盖，但不应为了照顾新手而把主流程做成教学产品。

原因：

- 用户 A 是更高频、更能验证复用价值的一群人
- 用户 C 会驱动模板沉淀与分享需求，帮助产品形成资产层
- 纯新手导向会强烈拉高引导成本，削弱产品效率感

---

# 4. 核心概念定义：Prompt IR / Template / Renderer / AI Assist

## 4.1 Prompt IR

Prompt IR 是系统内部对“用户意图”的统一中间表示。它不是给普通用户看的 JSON，也不是面向模型的最终 prompt。

它的职责是：

- 统一承接不同输入路径
- 作为模板、渲染器、版本化、存储的共同基底
- 支撑校验、默认值注入、冲突检测
- 作为后续分享、导出、复用的 canonical representation

它不负责：

- 直接成为主交互界面
- 表达完整世界知识
- 充当工作流执行引擎
- 存储复杂多轮对话历史

## 4.2 Template

Template 是面向特定任务类型的输入约束与默认配置集合。它决定：

- 展示哪些字段
- 哪些字段必填 / 选填
- 默认值是什么
- 哪些字段之间存在冲突关系
- 生成 prompt 时采用哪种 renderer 风格

Template 本质上是 **对 IR 的任务化约束层**，不是独立于 IR 的另一套数据模型。

## 4.3 Renderer

Renderer 负责把同一份 IR 渲染为目标输出形式，例如：

- 纯自然语言 Prompt
- 纯 JSON Prompt
- 混合 Prompt（任务句 + JSON 约束）

Renderer 还负责：

- 字段省略策略
- 自然语言压缩策略
- 冗余约束去重
- 风格适配（简洁 / 严谨 / 指令式）

## 4.4 AI Assist

AI Assist 不是单独的产品模式，而是一个插在“输入编译”阶段的增强器。

其职责应严格限定为：

- 从自然语言生成 IR 草案
- 归纳问题类型
- 自动补全明显缺失的关键槽位
- 必要时做极少量追问
- 对已有草案进行压缩和修正

不应该承担：

- 主导整段交互
- 无限追问用户
- 直接替用户决定关键业务约束
- 绕开模板体系自行生成任意复杂结构

---

# 5. 产品范围：MVP、后续版本、非目标

## 5.1 MVP 范围

### 必须有

1. **任务模板选择**  
   支持 6–8 个高频任务类型。

2. **表单式意图构建**  
   每个模板只暴露少量关键字段，支持默认值、动态字段显示、即时校验。

3. **统一 Prompt IR**  
   所有输入最终编译到同一 canonical JSON。

4. **Prompt 即时渲染**  
   至少支持自然语言与混合式两种导出。

5. **模板保存与复用**  
   用户可以保存为个人模板实例，后续快速编辑复用。

6. **基础冲突校验**  
   例如输出要求与任务类型冲突、风格要求与格式要求冲突、过长系统指令等。

7. **AI 草案生成（可选插件）**  
   用户贴一段原始问题，系统生成一个可编辑的草案 IR。

### 建议有

1. 输出预览切换  
2. 一键复制  
3. 最近使用模板  
4. 基础版本历史

## 5.2 V1 后续版本

1. 团队模板库与分享链接  
2. 模板 fork / compare  
3. 不同模型的 renderer 适配  
4. 规则引擎更丰富的字段冲突检查  
5. 模板性能分析（哪个模板产出更稳定）  
6. Prompt 使用后的反馈闭环

## 5.3 非目标

以下内容不应进入 MVP：

1. **通用 Agent / Workflow Builder**  
   那是另一个产品方向。

2. **复杂多轮对话状态机**  
   本产品是任务发起编译器，不是聊天记忆系统。

3. **完整 Prompt IDE**  
   不应把产品做成代码编辑器式自由创作工具。

4. **模型调用平台 / LLM 网关**  
   AI 模式可以接用户自己的 API，但这不是 MVP 核心能力。

5. **面向所有任务类型的完备模板宇宙**  
   模板体系要从高频任务切入，而不是追求覆盖率幻觉。

---

# 6. 信息架构与关键对象模型

## 6.1 信息架构总览

建议采用以下对象层级：

- Workspace（可选，团队版再加强）
- Template Definition（系统模板定义）
- Prompt Draft（用户当前编辑中的实例）
- Prompt IR（规范化中间表示）
- Rendered Output（导出的 prompt 文本）
- Saved Template / Saved Preset（用户保存后的可复用实例）
- Version（版本快照）

## 6.2 对象定义

### A. Template Definition

由产品内置或团队管理员定义。包含：

- template_id
- template_name
- task_type
- field_config
- default_values
- validation_rules
- renderer_preset
- ir_schema_version

### B. Prompt Draft

用户当前操作中的工作对象。包含：

- draft_id
- source_mode（manual / template / ai_assist）
- selected_template_id
- raw_input（可选）
- current_form_state
- compiled_ir
- render_variant
- dirty_state

### C. Prompt IR

系统 canonical object。包含任务目标、约束、输出、语气、边界等标准字段。

### D. Rendered Output

渲染结果对象。包含：

- output_id
- render_type（nl / json / hybrid）
- content
- compression_level
- style_preset
- generated_from_ir_version

### E. Saved Preset

用户保存后的复用资产，建议与 Template Definition 区分。前者是产品模板，后者是用户基于模板填好的实例。

## 6.3 推荐的任务类型（MVP）

建议只做以下 8 类：

1. 生产方案评估  
2. 局部机制判断  
3. 问题建模 / 定义审查  
4. 快速信息查询  
5. 代码生成 / 调试  
6. 比较 / 决策  
7. 开放探索  
8. 文本改写 / 提炼

说明：

- 这些类型足够覆盖大多数高频知识工作场景
- 与你已有的任务划分接近，迁移成本低
- 再细分应放到模板层，而不是一级任务类型层

## 6.4 为什么不建议先做“无限自定义字段”

因为这会迅速破坏模板的一致性和 renderer 的可控性。MVP 中自定义能力应限制为：

- 补充说明文本
- 少量自定义约束条目
- 自定义不要做的事

不要允许用户在 schema 层面随意加字段。

---

# 7. 关键用户流程

## 7.1 无 AI 模式主流程（主路径）

### 目标

让用户在最少填写量下，快速得到一个可复制、相对稳定的 prompt。

### 流程

1. 进入首页  
2. 选择任务类型或最近使用模板  
3. 打开对应简表单  
4. 填写少量关键槽位  
5. 系统实时注入默认值并生成 Prompt IR  
6. 系统进行冲突校验与提示  
7. 右侧实时预览渲染后的 prompt  
8. 用户选择导出风格并复制 / 保存为模板

### 关键判断

主流程中不能出现以下情况：

- 一上来就让用户面对大文本空白页
- 一上来就让用户选择几十个字段
- 一上来就引导使用 AI

### 关键成功条件

用户在 30–60 秒内完成一次构建，并且感知到：

- 比自己重写更快
- 比纯自然语言更稳
- 下一次还能复用

## 7.2 AI 模式主流程

### 目标

让用户从原始自然语言快速得到一份“够用的结构化草案”，而不是经历长对话。

### 流程

1. 用户输入原始问题描述  
2. AI 推断任务类型并生成初版 IR 草案  
3. UI 将草案映射为可编辑表单状态  
4. 系统高亮 AI 补全/猜测的字段  
5. 用户快速修订  
6. 系统渲染为 prompt 并允许导出 / 保存

### 追问策略

仅在以下情况下允许追问：

- 输出格式缺失且不同选项差异极大
- 任务目标存在根本歧义
- 约束冲突导致无法编译

追问上限：默认 0 个，最多 2 个。

### 失败回退

如果 AI 置信度低，不应停住流程等待用户解释，而应：

- 先产出一个最保守草案
- 明示哪些字段是系统猜测
- 让用户直接修改

## 7.3 模板复用 / 编辑 / 导出流程

### 保存逻辑

用户完成一次构建后，可保存为：

- 个人模板实例  
- 团队模板（后续版本）

### 编辑逻辑

建议区分：

- 编辑当前实例  
- 另存为新模板  
- 覆盖已有模板

### 导出逻辑

MVP 支持：

- 复制为自然语言 Prompt
- 复制为混合 Prompt
- 导出 IR JSON（高级模式入口，不作为默认按钮主位）

## 7.4 一个必须防住的坏流程

不要让“保存模板”依赖用户先理解 IR 或 renderer 概念。  
用户应该感知到的是“保存这套问法”，而不是“保存这个编译后的结构体”。

---

# 8. 交互设计原则与关键页面模块

## 8.1 交互设计原则

1. **先任务，后细节**  
   用户先确定问题类型，再逐步显露必要字段。

2. **字段越少越好，但默认值必须足够强**  
   减字段不是删信息，而是把高频信息沉到模板默认值里。

3. **即时可见结果**  
   用户必须实时看到 prompt 如何变化，否则不会理解结构化输入的价值。

4. **所有复杂性都应优先藏在系统层，而不是甩给用户**  
   包括 schema、兼容性、渲染规则、冲突检测。

5. **允许自然语言兜底，但不依赖它**  
   表单不足以表达的部分，可以放在“补充说明”里。

## 8.2 首页模块

建议模块：

- 主 CTA：开始构建
- 最近使用模板
- 高频任务类型快捷入口
- “从原始描述生成草案”（AI 插件入口，次级）

不要在首页展示：

- 大段 prompt engineering 教程
- schema 解释
- 太多模式切换

## 8.3 构建页模块

建议采用左右布局：

左侧：输入构建区  
右侧：实时输出预览区

### 左侧模块

- 任务类型 / 模板名称
- 核心字段区
- 可折叠高级字段区
- 不要做什么
- 补充说明
- 校验提示

### 右侧模块

- Prompt 预览
- 输出风格切换
- 复制按钮
- 保存模板按钮

## 8.4 模板管理页模块

- 我的模板
- 最近使用
- 系统模板
- 标签 / 搜索 / 排序
- 版本记录

## 8.5 为什么不建议先做“可视化流程图式配置器”

因为这个产品当前解决的是 **单轮任务意图编译**，不是工作流编排。流程图式交互会显著增加操作负担，也会误导用户以为产品是 agent orchestration 工具。

---

# 9. Prompt IR / JSON Schema 在产品中的角色与边界

## 9.1 角色

Prompt IR / JSON Schema 的主要职责：

1. 统一不同输入模式  
2. 提供字段类型与默认值机制  
3. 提供校验能力  
4. 支撑渲染器输出  
5. 支撑模板版本迁移与兼容性

## 9.2 边界

Schema 不应承担：

- 通用知识建模
- 多轮聊天状态存档
- 工具执行 DAG
- 用户画像数据库
- RAG 检索上下文存储

## 9.3 推荐字段边界

MVP 的 IR 字段建议只覆盖以下维度：

- task_type
- objective
- context
- constraints
- output_spec
- forbidden
- reasoning_mode / answer_mode
- tone / style
- completeness_level
- audience（可选）
- metadata

## 9.4 版本化策略

必须从 Day 1 支持 schema version。原因：

- 模板会演化
- 字段会合并或拆分
- renderer 逻辑会升级
- 历史模板需要迁移

### 9.4.1 Semver 规则

IR schema 采用语义化版本号 `MAJOR.MINOR`（不使用 PATCH，因为 schema 不存在"修复但不改结构"的场景）：

- **MAJOR 升级**（如 `0.x → 1.0`）：存在不向后兼容的结构变更（字段删除、类型变更、语义重定义）。所有消费方必须适配。
- **MINOR 升级**（如 `1.0 → 1.1`）：仅新增可选字段或扩展枚举值。旧版 IR 在新版 schema 下仍合法；新版 IR 在旧版消费方中可安全忽略未知字段。

### 9.4.2 向后兼容保证

- 同一 MAJOR 版本内，系统保证**至少 6 个月**的向后兼容期。在此期间，旧版 IR 无需任何修改即可被当前 renderer 正确处理。
- MAJOR 版本升级时，系统提供自动 migration adapter，并保证**至少 3 个月**的双版本并行期（旧版 IR 仍可渲染，但标记为 deprecated）。

### 9.4.3 字段弃用策略

字段弃用遵循以下生命周期：

1. **标记弃用（deprecated）**：字段保留在 schema 中，renderer 仍处理，但 UI 不再主动展示。持续至少 2 个 MINOR 版本或 3 个月（取较长者）。
2. **停止写入（write-removed）**：新创建的 IR 不再包含该字段，但 renderer 仍可处理存量 IR 中的该字段。
3. **完全移除（removed）**：仅在 MAJOR 版本升级时执行。migration adapter 负责将旧字段映射到替代字段。

### 9.4.4 Migration 规范

- 每次 MAJOR 升级必须附带 `migration adapter`，定义 `(old_version, new_version) → transform_fn` 的映射。
- Migration 必须是幂等的：对同一份 IR 多次执行同一 migration 产出相同结果。
- Migration 失败时回退策略：保留原始 IR 不变，标记 `migration_status: "failed"`，renderer 使用旧版兼容模式渲染，并在 UI 提示用户手动介入。

### 9.4.5 版本分离原则

- `schema_version` 写入每个 IR，标识 IR 结构版本
- `template_version` 独立于 schema_version，标识模板定义自身的迭代
- `renderer_version` 独立于以上两者，标识渲染逻辑的迭代
- 三者版本号独立演进，通过兼容性矩阵声明支持关系

## 9.5 为什么“JSON Schema 作为用户可编辑高级模式”只能是次要入口

这是因为高级用户虽愿意操作结构，但普通用户不会。把它放主位会让产品定位崩掉。  
建议作为“查看 IR / 导出 IR / 高级编辑”的隐藏入口，而不是默认操作面板。

---

# 10. 渲染策略：从 IR 生成不同风格 Prompt

## 10.1 渲染目标

同一份 IR 应能生成不同风格的输出，用于不同模型、平台和用户习惯。

这里需要把“混合”定义清楚，否则产品层和实现层会打架。建议采用以下严格划分：

1. 自然语言型（Pure NL）  
2. 混合文本型（NL + Structured Text）  
3. 混合 JSON 型（NL + JSON Block）  
4. JSON 型（Pure JSON，高级）

其中，如果产品层只能保留一个“混合模式”作为默认导出，则应把 **混合模式明确定义为：自然语言任务句 + JSON 约束块**。这更符合“自然语言定义问题 + 结构化约束执行”的核心前提，也更符合 IR 驱动渲染的产品定位。

而此前示例中的“约束：- ... - ...”更准确地说，不是严格意义上的 JSON 混合，而是“混合文本型”。它可以作为兼容型 renderer 保留，但不应占用“混合模式”这个主名称。

## 10.2 自然语言型

适用于：

- 通用聊天模型
- 用户希望直接复制到对话框
- 需要更自然的阅读体验

渲染原则：

- 按“任务 → 背景 → 约束 → 输出要求 → 禁止事项”组织
- 省略空字段
- 合并重复约束
- 避免模板腔和字段名泄露

## 10.3 混合 JSON 型

建议作为默认导出。  
但这里的“混合”不能理解为“前面一句任务 + 后面贴完整 JSON”。那样只是把两种格式机械拼接，不能体现编译价值。

更合理的定义是：

- 把 **最影响模型行为、且适合自然表达的关键字段** 编织进前置自然语言段落
- 把 **剩余不适合自然展开、但适合精确约束的字段** 作为 JSON 约束块附在后面

也就是说，Hybrid JSON 的核心不是“同时出现两种格式”，而是 **字段分层投放**：

- 前段自然语言负责建立任务框架、回答姿态、优先级与阅读顺序
- 后段 JSON 负责承载离散枚举、输出 shape、禁止项、补充限制、可机器解析字段

这是 Intent Compiler 相比普通 prompt editor 更应体现出来的优势。

### 为什么这种方式更优

1. **更符合真实使用习惯**  
   用户真正关心的通常不是 schema 本身，而是“先给结论”“按生产落地看”“不要泛泛而谈”这类高影响行为指令。这些内容放在自然语言里，比埋在 JSON 里更容易被模型优先吸收。

2. **更符合字段语义差异**  
   有些字段天然适合自然语言，例如任务目标、回答顺序、分析立场；有些字段更适合结构化表达，例如输出格式、长度、禁止项、受众、枚举型约束。混合模式应利用这种差异，而不是忽略它。

3. **比“完整 JSON 直贴”更稳妥**  
   很多模型会对前置自然语言的高层 framing 更敏感。若把所有信息都压进 JSON，可能损失任务语境与优先级信号。

4. **比“纯自然语言”更可控**  
   剩余约束留在 JSON 中，便于模板化、版本化、程序化处理，也便于后续做字段裁剪和冲突校验。

### 字段分配原则

Hybrid JSON renderer 应明确一套字段投放规则，而不是让模板作者自由发挥。

#### 应优先进入自然语言段落的字段

通常包括：

- task_type 的行为化表达
- objective 的主目标
- answer_mode 中最关键的行为要求
- reasoning / output ordering 中对阅读体验影响最大的部分
- challenge_assumptions / production_aware / recommend_first 这类高层姿态要求

这些字段的共同特点是：

- 对模型整体回答框架影响大
- 用自然语言表达更顺滑
- 放在 prompt 开头更容易建立优先级

#### 应保留在 JSON 块中的字段

通常包括：

- output_spec 的细节参数
- forbidden 列表
- completeness_level / verbosity
- audience
- 可枚举风格参数
- 约束列表
- 补充上下文中的离散项

这些字段的共同特点是：

- 适合离散表达
- 更适合模板化复用
- 更适合稳定渲染而非自由措辞

### 设计要求

因此，Hybrid JSON renderer 至少应支持两层转换：

1. canonical IR → promoted fields（提升到自然语言前段的字段）  
2. canonical IR → residual JSON block（剩余约束 JSON）

这两步都必须由 renderer 决定，而不是由用户手工选择。否则“混合模式”会退化为另一种人工排版。

### 示例结构

```text
请从生产落地视角评估下面这个方案。先给结论，再给依据；如果前提本身有漏洞，请直接指出并修正。回答时优先做取舍判断，不要做教科书式铺垫。

```json
{
  "constraints": {
    "must_consider": ["真实约束", "维护成本", "复杂度", "失败模式"],
    "must_not": ["泛泛而谈", "两边都说对"]
  },
  "output_spec": {
    "shape": ["结论", "依据", "边界条件"],
    "verbosity": "concise"
  },
  "audience": "senior_engineer"
}
```

背景信息：
...
```

上面这个示例里：

- “生产落地视角”“先给结论”“指出并修正前提漏洞”“优先做取舍判断” 被提升进自然语言前段
- 输出 shape、verbosity、must_not、audience 等残余约束保留在 JSON 中

这才是更像“编译结果”的混合模式。

## 10.4 混合文本型

这是兼容型渲染方式，形式为：

- 一段自然语言任务定义
- 一段结构化文本约束块（如 bullet list / key-value）

它的价值在于：

- 对不喜欢 JSON 的用户更友好
- 对某些聊天式使用场景更自然
- 可作为自然语言型与混合 JSON 型之间的过渡

但从产品命名上，不建议把它直接称为“混合模式”，否则会与 JSON 混合混淆。

更合适的叫法是：

- 结构化文本版
- 混合文本版
- Compact Structured Text

## 10.5 JSON 型

适用于：

- 高级用户
- 程序化调用
- 后续工具链接入

但不应是主默认导出，因为：

- 对普通用户不友好
- 并非所有模型都对裸 JSON 指令表现最好
- 会放大“产品像开发工具”的感知

## 10.6 需要支持的渲染策略开关

建议支持以下 renderer preset：

- 简洁直给  
- 严谨分析  
- 生产导向  
- 探索开放

注意：这里的 preset 不应是自由风格系统，而应是少量高价值模式。

## 10.7 一个重要取舍

不要试图在 MVP 中做“针对每家模型的最优 prompt style 自动优化”。这需要大量实验和持续维护，成本高且收益不确定。  
MVP 只做“跨模型足够稳”的中性渲染策略。

---

# 11. 风险、取舍与失败模式

## 11.1 最大风险：产品把用户引导成本做高了

如果用户为了“更好地提问”反而要多做更多输入，产品就失败了。

对应策略：

- 必填字段极少
- 强默认值
- 实时预览
- 模板复用优先于一次性完备填写

## 11.2 第二大风险：模板膨胀

一旦模板数量失控，用户会陷入新的选择困难。

对应策略：

- 一级任务类型收敛
- 二级模板按高频场景扩展
- 对系统模板设定质量门槛
- 记录模板使用率，清理低价值模板

## 11.3 第三大风险：IR 过度设计

如果 IR 试图覆盖所有语义变化，工程复杂度会远大于产品收益。

对应策略：

- IR 只围绕 prompt 生成所需字段设计
- 允许补充说明兜底
- 避免 schema 级用户自定义泛滥

## 11.4 第四大风险：AI 模式喧宾夺主

一旦 AI 变成主入口，产品会变成另一个 prompt chat assistant，背离“低摩擦、低成本、可复用”的核心价值。

对应策略：

- AI 模式入口次级化
- 不默认弹出追问
- 输出草案优先于追问
- 把 AI 明确定位为草案生成器

## 11.5 第五大风险：用户误以为“结构化 = 更强答案”

这是不成立的。结构化只能提高稳定性与可控性，不保证内容正确。

对应策略：

- 产品文案上避免夸大“提高智商”
- 强调减少漏项、错配与重复劳动

## 11.6 失败模式列表

### 失败模式 A：生成的 prompt 过于模板腔

后果：用户觉得机械、冗长、不想复制。  
修正：renderer 压缩与自然化处理必须做好。

### 失败模式 B：表单仍然太复杂

后果：用户宁愿自己写一句自然语言。  
修正：把更多复杂性放入默认值和折叠区。

### 失败模式 C：AI 草案经常猜错题型

后果：用户失去信任。  
修正：先支持有限任务类型；低置信度时展示候选题型而不是强定。

### 失败模式 D：保存模板后无法维护

后果：模板资产变脏，长期不可用。  
修正：从第一天就设计版本、fork 与覆盖关系。

---

# 12. 成功指标与埋点建议

## 12.1 北极星指标：Build-to-Copy Rate

**定义：** 用户在一次构建 session 中，成功构建并复制 prompt 的比率。

```
Build-to-Copy Rate = 成功构建并复制的 session 数 / 总构建 session 数
```

其中”成功构建”需同时满足：

- 构建耗时 < 该构建类型的阈值（见 12.3）
- 该 session 内触发了 `prompt_copied` 事件

**为什么选择这个指标：**

- 完全可从产品端埋点计算，不依赖外部系统的使用反馈
- 同时编码了”效率”（耗时阈值）和”价值交付”（用户复制走了）两个维度
- 避免了”被实际使用”这一无法在产品端观测的模糊定义

**建议基线与目标：**

| 阶段 | Build-to-Copy Rate |
|------|-------------------|
| MVP 上线首月 | >= 40% |
| 稳定期（上线 3 个月后） | >= 60% |
| 成熟期目标 | >= 70% |

## 12.2 核心指标体系

### 指标 1：Activation Rate（激活率）

**定义：** 新用户在首次访问后 24 小时内成功复制至少一条 prompt 的比率。

```
Activation Rate = 首次访问 24h 内触发 prompt_copied 的新用户数 / 同期新用户总数
```

**说明：**

- “新用户”以首次 `session_started` 事件为准
- “成功复制”以首次 `prompt_copied` 事件为准
- 24h 窗口从首次 `session_started` 时间戳开始计算

**建议基线与目标：**

| 阶段 | Activation Rate |
|------|----------------|
| MVP 上线首月 | >= 30% |
| 稳定期 | >= 50% |

### 指标 2：D7 Retention（7 日留存率）

**定义：** 在第 0 天有过至少一次成功构建（触发 `prompt_copied`）的用户中，在第 7 天再次触发 `prompt_copied` 的比率。

```
D7 Retention = Day 0 有 prompt_copied 且 Day 7 也有 prompt_copied 的用户数 / Day 0 有 prompt_copied 的用户数
```

**补充说明：**

- 同时跟踪 D1 和 D30 留存作为辅助观察指标
- 同时跟踪 WAU / MAU 比率（健康值 >= 0.25）

**建议基线与目标：**

| 指标 | MVP 首月 | 稳定期目标 |
|------|---------|-----------|
| D1 留存 | >= 15% | >= 30% |
| D7 留存 | >= 8% | >= 20% |
| D30 留存 | >= 3% | >= 10% |
| WAU/MAU | >= 0.15 | >= 0.25 |

### 指标 3：Template Health Ratio（模板健康度）

**定义：** 被至少复用 2 次（跨不同 session）的已保存模板占所有已保存模板的比率。

```
Template Health Ratio = 被复用 >= 2 次的已保存模板数 / 已保存模板总数
```

**说明：**

- “复用”以 `template_reused` 事件为准，复用须发生在保存后的不同 session
- 该指标反映模板资产层的真实价值，避免”保存了但从不复用”的虚假繁荣
- 可按用户维度和全局维度分别统计

**建议基线与目标：**

| 阶段 | Template Health Ratio |
|------|----------------------|
| MVP 上线首月 | >= 20% |
| 稳定期 | >= 40% |

### 指标 4：模板选择后完成率

```
Completion Rate = 触发 prompt_copied 或 template_saved 的 session 数 / 触发 template_selected 的 session 数
```

**建议基线：** MVP >= 50%，稳定期 >= 65%

### 指标 5：复制率与保存模板率

```
Copy Rate = 触发 prompt_copied 的 session 数 / 完成渲染（render_completed）的 session 数
```

```
Save Rate = 触发 template_saved 的 session 数 / 完成渲染（render_completed）的 session 数
```

### 指标 6：AI 草案接受率

```
AI Draft Accept Rate = AI 草案生成后触发 prompt_copied 的 session 数 / 触发 ai_draft_generated 的 session 数
```

## 12.3 构建耗时基准

构建耗时是判断”成功构建”的重要阈值维度。必须区分两种场景：

### 首次构建耗时（First Build Time）

**定义：** 从 `template_selected` 到首次 `prompt_copied`，且该 session 中无 `template_reused` 事件。

| 等级 | 耗时范围 |
|------|---------|
| 优秀 | < 60s |
| 达标 | 60–120s |
| 需改进 | > 120s |

**建议目标：** P50 < 90s，P90 < 120s

### 复用构建耗时（Reuse Build Time）

**定义：** 从 `template_reused` 到首次 `prompt_copied`，即基于已保存模板的二次构建。

| 等级 | 耗时范围 |
|------|---------|
| 优秀 | < 15s |
| 达标 | 15–30s |
| 需改进 | > 30s |

**建议目标：** P50 < 20s，P90 < 30s

**为什么必须区分：**

- 首次构建衡量的是”模板 + 表单”的引导效率
- 复用构建衡量的是”模板资产”的真实节省效果
- 如果混在一起，复用构建的高效会掩盖首次构建可能存在的流程问题

## 12.4 质量与诊断指标

1. **表单放弃率：** `draft_abandoned` / `template_selected`，按任务类型拆分
2. **字段修改分布：** 统计每个字段被用户修改（覆盖默认值）的频次，用于优化默认值策略
3. **冲突校验触发率：** `validation_triggered` / `field_updated`，过高说明默认值或字段联动有问题
4. **输出风格选择分布：** `render_variant_switched` 的 variant 参数分布，指导 renderer 优先级
5. **导出后回流编辑率（同 session）：** 在同一 session 中，用户触发 `prompt_copied` 或 `prompt_exported` 后，又触发 `field_updated` 的比率

```
Same-session Re-edit Rate = prompt_copied 后又有 field_updated 的 session 数 / 触发 prompt_copied 的 session 数
```

6. **导出后回流编辑率（跨 session）：** 用户在 session A 触发 `prompt_exported` 后，在 24h 内的另一个 session B 中对同一模板实例触发 `template_edited` 的比率

```
Cross-session Re-edit Rate = 导出后 24h 内在新 session 对同一实例触发 template_edited 的用户数 / 触发 prompt_exported 的用户数
```

**说明：**

- 同 session 回流编辑率偏高（> 30%）提示渲染预览未能有效帮助用户做最终判断
- 跨 session 回流编辑率偏高（> 20%）提示导出结果在实际使用中未达预期，需关注 renderer 质量

## 12.5 指标间关系说明

核心指标之间并非完全独立，存在互补和对冲关系。在解读数据时必须组合观察，避免单一指标误导决策。

### 互补关系

- **Build-to-Copy Rate + D7 Retention：** 前者衡量单次价值交付，后者衡量持续价值。两者同涨说明产品同时解决了”做得快”和”值得回来”。
- **Activation Rate + 首次构建耗时：** 激活率低但首次构建耗时短，说明问题在获客或首屏引导；激活率低且耗时长，说明构建流程本身有摩擦。

### 对冲关系

- **Copy Rate vs Save Rate：** 这两个指标可能此消彼长。如果用户倾向于”用完即走”（高 Copy Rate + 低 Save Rate），说明模板复用价值未被感知；如果 Save Rate 上升而 Copy Rate 下降，可能是保存流程插入过早打断了复制动作。应关注 `Copy Rate + Save Rate` 的总和（Overall Engagement Rate），而非单独追踪其中之一。
- **AI Draft Accept Rate vs 手动构建 Completion Rate：** AI 草案接受率的提升不应以手动路径完成率下降为代价。如果出现这种趋势，说明 AI 模式可能正在蚕食主路径而非增强它，违背”AI 为插件”的设计原则。
- **Template Health Ratio vs Save Rate：** 保存率高但健康度低，意味着用户”随手保存但不复用”，应优化保存引导策略或降低保存入口显著性。

### 组合告警规则建议

| 告警条件 | 可能原因 | 建议动作 |
|---------|---------|---------|
| Build-to-Copy Rate 下降 + 首次构建耗时上升 | 表单复杂度增加或默认值退化 | 审查最近模板/字段变更 |
| Copy Rate 上升 + D7 Retention 下降 | 用户一次性使用但不复用 | 强化模板保存与复用引导 |
| Save Rate 上升 + Template Health Ratio 下降 | 保存行为浮于表面 | 优化模板管理体验与复用入口 |
| Activation Rate 下降 + 表单放弃率上升 | 新用户首次体验有问题 | 优化首屏引导和模板推荐 |

## 12.6 埋点事件清单

### 会话与生命周期事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `session_started` | 用户进入构建页面 | `session_id`, `user_id`, `entry_source`（homepage / deeplink / template_mgmt）, `is_new_user` |
| `session_ended` | 用户离开构建页面或关闭应用 | `session_id`, `duration_ms`, `outcome`（completed / abandoned） |

### 模板与构建事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `template_selected` | 用户选择一个模板 | `session_id`, `template_id`, `task_type`, `source`（system / saved / recent） |
| `template_reused` | 用户从已保存模板开始构建 | `session_id`, `template_id`, `original_save_time` |
| `template_saved` | 用户保存当前构建为模板 | `session_id`, `template_id`, `is_overwrite`, `field_count` |
| `template_edited` | 用户编辑一个已保存模板 | `session_id`, `template_id`, `edit_source`（template_mgmt / re-entry）, `fields_changed` |
| `template_deleted` | 用户删除一个已保存模板 | `template_id`, `age_days`, `reuse_count` |
| `field_updated` | 用户修改任一字段 | `session_id`, `field_name`, `is_default_override`, `template_id` |
| `validation_triggered` | 冲突校验被触发 | `session_id`, `rule_id`, `severity`（error / warning）, `field_names` |
| `draft_abandoned` | 用户未完成构建即离开 | `session_id`, `template_id`, `last_active_field`, `duration_ms`, `fields_filled_count` |

### 渲染与导出事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `render_completed` | 系统完成 prompt 渲染 | `session_id`, `render_type`（nl / hybrid_json / hybrid_text / json） |
| `render_variant_switched` | 用户切换输出风格 | `session_id`, `from_variant`, `to_variant` |
| `prompt_copied` | 用户复制 prompt | `session_id`, `render_type`, `prompt_length`, `time_since_session_start_ms` |
| `prompt_exported` | 用户通过导出功能输出 prompt | `session_id`, `export_format`（clipboard / file / api）, `render_type` |

### AI 辅助事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `ai_draft_generated` | AI 生成草案完成 | `session_id`, `inferred_task_type`, `confidence_score`, `generation_time_ms` |
| `ai_field_accepted` | 用户接受 AI 填充的字段（未修改） | `session_id`, `field_name` |
| `ai_field_overridden` | 用户修改 AI 填充的字段 | `session_id`, `field_name` |
| `ai_clarification_asked` | AI 触发追问 | `session_id`, `clarification_type`, `question_index` |

## 12.7 未决问题的数据实验设计

以下问题无法通过逻辑推演回答，需在产品上线后通过数据实验验证。

### 实验 1：”默认导出格式”对 Build-to-Copy Rate 的影响

**假设：** 混合 JSON 型作为默认导出的 Build-to-Copy Rate 高于纯自然语言型。

**设计：**

- 类型：A/B 测试
- 分组：A 组默认混合 JSON 型，B 组默认纯自然语言型
- 主指标：Build-to-Copy Rate
- 辅助指标：`render_variant_switched` 频率（用户是否主动切换）、同 session 回流编辑率
- 样本量：每组至少 500 个 session
- 周期：2 周

### 实验 2：AI 模式入口位置对手动路径的影响

**假设：** AI 模式入口前置化会降低手动构建路径的使用率和完成率。

**设计：**

- 类型：A/B 测试
- 分组：A 组 AI 入口为次级按钮（当前设计），B 组 AI 入口与模板选择并列
- 主指标：手动路径 Completion Rate、AI Draft Accept Rate
- 辅助指标：总体 Build-to-Copy Rate、首次构建耗时
- 样本量：每组至少 300 个新用户
- 周期：3 周

### 实验 3：保存引导时机对 Template Health Ratio 的影响

**假设：** 在用户第二次使用同类模板时引导保存，比首次构建完成时引导保存能产生更高的 Template Health Ratio。

**设计：**

- 类型：A/B 测试
- 分组：A 组首次构建后提示保存（当前设计），B 组首次不提示、第二次同类模板使用时提示
- 主指标：Template Health Ratio（30 天窗口）
- 辅助指标：Save Rate、Copy Rate、D7 Retention
- 样本量：每组至少 200 个用户
- 周期：5 周（含 30 天观察窗口）

### 实验 4：首次构建耗时阈值校准

**假设：** 当前”首次构建 90-120s”的阈值设定可能偏紧或偏松。

**设计：**

- 类型：观察性分析（非干预实验）
- 方法：收集 MVP 上线前 4 周所有首次构建 session 的耗时分布，按 `prompt_copied` 是否发生分组，绘制耗时-完成率曲线，找到完成率急剧下降的拐点
- 产出：基于实际数据校准首次/复用构建的达标阈值

## 12.8 一个关键判断

不要把”用户说好用”作为主成功标准。真正有效的信号是：

- 他们是否在合理时间内完成构建并复制走了（Build-to-Copy Rate）
- 首次使用后是否回来（D7 Retention）
- 保存的模板是否被真正复用（Template Health Ratio）

定性反馈（用户访谈、NPS）仅用于解释定量数据的变动原因，不应作为产品决策的主依据。

---

# 13. 里程碑 / Phased Roadmap

## Phase 0：定义与验证（2–4 周）

目标：验证任务类型、字段最小集、renderer 是否能成立。

交付：

- 任务类型 taxonomy v0
- Prompt IR v0
- 6–8 个核心模板
- 纸面原型 / 低保真交互稿
- 少量用户访谈与可用性验证

## Phase 1：MVP（6–10 周）

目标：跑通无 AI 主流程。

交付：

- 模板选择
- 表单构建
- IR 编译
- 实时渲染
- 复制 / 保存模板
- 基础埋点

上线标准：

- 30–60 秒内可完成一次构建
- 主要模板的复制率达到可接受水平

## Phase 2：AI Assist 插件（4–6 周）

目标：补充自然语言到草案的快捷入口。

交付：

- 原始问题转 IR 草案
- 低置信度题型识别
- 0–2 个追问策略
- AI 填充字段高亮

上线标准：

- AI 草案接受率显著高于人工从零填写
- 追问率保持低位

## Phase 3：模板资产层（6–8 周）

目标：把单次构建转化为长期资产。

交付：

- 模板版本管理
- 模板 fork
- 团队共享
- 模板分析仪表盘

## Phase 4：生态扩展（后续）

- 模型适配 renderer
- API / SDK
- 团队权限
- 模板 marketplace
- 外部编辑器 / AI 平台集成

---

# 14. 未决问题与建议决策

## 问题 1：任务类型是固定集合还是开放扩展？

建议决策：**MVP 固定集合，扩展放到模板层。**

原因：

- 固定集合更利于默认值与校验设计
- renderer 更可控
- AI 题型识别更容易做准

## 问题 2：输出默认是自然语言还是混合 Prompt？

建议决策：**默认混合 Prompt。**

原因：

- 比纯自然语言更稳定
- 比纯 JSON 更好用
- 最符合“自然语言定义问题 + 结构化约束执行”的核心判断

## 问题 3：是否允许用户直接编辑 IR？

建议决策：**允许，但作为高级模式隐藏入口。**

原因：

- 对高级用户有价值
- 但不能污染普通用户主路径

## 问题 4：AI 模式是否应允许持续对话优化？

建议决策：**不作为 MVP 主路径。**

原因：

- 这会把产品推向另一类 chat 产品
- 成本、时延、复杂度全部上升

## 问题 5：是否需要“模型推荐 / prompt 质量评分”？

建议决策：**暂不做。**

原因：

- 难定义、难验证、容易误导
- 不属于核心价值闭环

## 问题 6：模板是否应支持团队治理？

建议决策：**MVP 只做个人模板；团队治理放到后续版本。**

原因：

- 团队权限、审批、版本策略会显著增加系统复杂度
- 先验证个人复用价值更务实

---

# 15. 附录：MVP Prompt IR 字段草案与示例

## 15.1 增强版 IR JSON Schema

以下为工程级 IR schema 定义。设计原则：每个字段必须能被 renderer 消费，不承载 renderer 不需要的语义。

```jsonc
{
  “$schema”: “https://json-schema.org/draft/2020-12/schema”,
  “$id”: “intent-compiler-ir-v0.2”,
  “type”: “object”,
  “required”: [“schema_version”, “task_type”, “objective”],
  “properties”: {

    “schema_version”: {
      “type”: “string”,
      “pattern”: “^\\d+\\.\\d+$”,
      “description”: “Semver MAJOR.MINOR，如 '0.2'”
    },

    “task_type”: {
      “type”: “string”,
      “enum”: [
        “production_evaluation”,
        “mechanism_check”,
        “problem_modeling”,
        “quick_lookup”,
        “code_generation”,
        “comparison_decision”,
        “open_exploration”,
        “text_rewrite”
      ]
    },

    “objective”: {
      “type”: “string”,
      “minLength”: 1,
      “maxLength”: 500,
      “description”: “一句话主目标，renderer 用于生成自然语言前段的核心句”
    },

    // ── context：增加长度限制与摘要策略 ──
    “context”: {
      “type”: “object”,
      “properties”: {
        “background”: {
          “type”: “string”,
          “maxLength”: 4000,
          “description”: “任务背景描述”
        },
        “current_state”: {
          “type”: “string”,
          “maxLength”: 2000,
          “description”: “当前状态或已有进展”
        },
        “inputs”: {
          “type”: “array”,
          “items”: { “type”: “string”, “maxLength”: 2000 },
          “maxItems”: 10,
          “description”: “用户提供的输入材料”
        },
        “max_tokens”: {
          “type”: “integer”,
          “default”: 2000,
          “minimum”: 100,
          “maximum”: 8000,
          “description”: “context 整体渲染到最终 prompt 时的 token 预算上限。超出时触发 summary_strategy”
        },
        “summary_strategy”: {
          “type”: “string”,
          “enum”: [“truncate_tail”, “extractive_summary”, “abstractive_summary”],
          “default”: “truncate_tail”,
          “description”: “context 超出 max_tokens 时的压缩策略。truncate_tail：截断尾部；extractive_summary：抽取关键句；abstractive_summary：AI 生成摘要（需 AI Assist 启用）”
        }
      },
      “additionalProperties”: false
    },

    // ── constraints：引入结构化约束项 ──
    “constraints”: {
      “type”: “object”,
      “properties”: {
        “must_consider”: {
          “type”: “array”,
          “items”: { “$ref”: “#/$defs/constraint_item” },
          “maxItems”: 15,
          “description”: “模型必须考虑的约束”
        },
        “must_not”: {
          “type”: “array”,
          “items”: { “$ref”: “#/$defs/constraint_item” },
          “maxItems”: 15,
          “description”: “模型必须避免的行为”
        }
      },
      “additionalProperties”: false
    },

    “output_spec”: {
      “type”: “object”,
      “properties”: {
        “format”: {
          “type”: “string”,
          “enum”: [“structured_markdown”, “plain_text”, “json”, “table”, “code_block”]
        },
        “shape”: {
          “type”: “array”,
          “items”: { “type”: “string” },
          “minItems”: 1,
          “maxItems”: 10,
          “description”: “输出应包含的结构化段落，按期望阅读顺序排列”
        },
        “length”: {
          “type”: “string”,
          “enum”: [“brief”, “concise”, “detailed”],
          “default”: “concise”
        }
      },
      “additionalProperties”: false
    },

    // ── answer_mode：增加冲突矩阵定义 ──
    “answer_mode”: {
      “type”: “object”,
      “properties”: {
        “production_aware”: {
          “type”: “boolean”,
          “default”: false,
          “description”: “从生产落地视角回答，关注可行性、成本、风险”
        },
        “challenge_assumptions”: {
          “type”: “boolean”,
          “default”: false,
          “description”: “主动质疑提问者的前提假设”
        },
        “recommend_first”: {
          “type”: “boolean”,
          “default”: false,
          “description”: “先给结论/推荐，再给推导过程”
        },
        “explore_alternatives”: {
          “type”: “boolean”,
          “default”: false,
          “description”: “展开多种备选方案的比较”
        },
        “step_by_step”: {
          “type”: “boolean”,
          “default”: false,
          “description”: “按步骤逐步推导”
        }
      },
      “additionalProperties”: false,
      “description”: “见 15.4 answer_mode 冲突矩阵”
    },

    “style”: {
      “type”: “object”,
      “properties”: {
        “tone”: {
          “type”: “string”,
          “enum”: [“direct”, “neutral”, “cautious”, “conversational”],
          “default”: “neutral”
        },
        “verbosity”: {
          “type”: “string”,
          “enum”: [“minimal”, “low”, “medium”],
          “default”: “low”
        }
      },
      “additionalProperties”: false
    },

    “audience”: {
      “type”: “string”,
      “enum”: [“general”, “junior_engineer”, “senior_engineer”, “non_technical_stakeholder”, “domain_expert”],
      “default”: “general”
    },

    “metadata”: {
      “type”: “object”,
      “properties”: {
        “source_mode”: {
          “type”: “string”,
          “enum”: [“manual”, “template”, “ai_assist”]
        },
        “template_id”: { “type”: “string” },
        “created_at”: { “type”: “string”, “format”: “date-time” },
        “compile_status”: {
          “type”: “string”,
          “enum”: [“complete”, “partial”],
          “default”: “complete”,
          “description”: “见 15.6 Draft → IR 编译契约”
        }
      },
      “additionalProperties”: false
    }
  },

  // ── 共享定义 ──
  “$defs”: {
    “constraint_item”: {
      “oneOf”: [
        {
          “type”: “string”,
          “description”: “简写形式，等价于 { value: <string>, priority: 'normal' }”
        },
        {
          “type”: “object”,
          “required”: [“value”],
          “properties”: {
            “value”: {
              “type”: “string”,
              “maxLength”: 200,
              “description”: “约束内容”
            },
            “priority”: {
              “type”: “string”,
              “enum”: [“critical”, “normal”, “nice_to_have”],
              “default”: “normal”,
              “description”: “critical：renderer 必须在自然语言前段强调；normal：正常投放；nice_to_have：token 紧张时可省略”
            },
            “source”: {
              “type”: “string”,
              “enum”: [“user”, “template”, “ai_assist”],
              “description”: “约束来源，用于 UI 高亮与信任度展示”
            }
          },
          “additionalProperties”: false
        }
      ]
    }
  },

  “additionalProperties”: false
}
```

### 设计说明

**约束项双态设计（`constraint_item`）**：允许纯字符串简写以保持低门槛，同时支持 `{value, priority, source}` 结构体供需要精细控制的场景。Renderer 处理时统一归一化为结构体形式。`priority` 直接影响渲染行为：`critical` 约束会被提升到自然语言前段，`nice_to_have` 在 token 紧张时由 renderer 自动裁剪。

**Context 防膨胀机制**：`max_tokens` 和 `summary_strategy` 协同工作。当 `background + current_state + inputs` 的估算 token 数超出 `max_tokens` 时，系统按 `summary_strategy` 自动压缩。默认策略 `truncate_tail` 无需 AI 介入，保证无 AI 模式下也能正常工作。

**字段数量克制**：整个 schema 仍然只有 9 个顶层字段 + 1 个 metadata，没有引入新的顶层维度。增强只在已有字段内部增加结构精度。

## 15.2 IR 实例（完整示例）

```json
{
  “schema_version”: “0.2”,
  “task_type”: “production_evaluation”,
  “objective”: “评估某个设计方案是否适合生产落地”,
  “context”: {
    “background”: “团队正在考虑将消息队列从 RabbitMQ 迁移到 Kafka……”,
    “current_state”: “已完成 POC，吞吐量提升 3x，但运维团队对 Kafka 不熟悉”,
    “inputs”: [],
    “max_tokens”: 2000,
    “summary_strategy”: “truncate_tail”
  },
  “constraints”: {
    “must_consider”: [
      { “value”: “real-world operational constraints”, “priority”: “critical”, “source”: “template” },
      { “value”: “migration risk and rollback plan”, “priority”: “critical”, “source”: “user” },
      { “value”: “team learning curve”, “priority”: “normal”, “source”: “ai_assist” },
      “maintenance cost”
    ],
    “must_not”: [
      { “value”: “generic textbook comparison”, “priority”: “critical”, “source”: “template” },
      “listing pros and cons without taking a stance”
    ]
  },
  “output_spec”: {
    “format”: “structured_markdown”,
    “shape”: [“conclusion”, “reasoning”, “risks”, “boundary_conditions”],
    “length”: “concise”
  },
  “answer_mode”: {
    “production_aware”: true,
    “challenge_assumptions”: true,
    “recommend_first”: true,
    “explore_alternatives”: false,
    “step_by_step”: false
  },
  “style”: {
    “tone”: “direct”,
    “verbosity”: “low”
  },
  “audience”: “senior_engineer”,
  “metadata”: {
    “source_mode”: “template”,
    “template_id”: “production_eval_v1”,
    “created_at”: “2025-01-15T10:30:00Z”,
    “compile_status”: “complete”
  }
}
```

## 15.3 示例：渲染后的混合 JSON Prompt

```text
请从生产落地视角评估下面这个方案。先给结论，再给依据；如果方案前提本身有逻辑漏洞，请直接指出并修正。回答时优先做取舍判断，不要做泛泛铺垫。迁移风险和回退方案是本次评估最关键的约束，请务必覆盖。

```json
{
  “constraints”: {
    “must_consider”: [
      “真实运维约束”,
      “迁移风险与回退方案”,
      “团队学习曲线”,
      “维护成本”
    ],
    “must_not”: [
      “教科书式展开”,
      “两边都说对”,
      “不做取舍”
    ]
  },
  “output_spec”: {
    “shape”: [“结论”, “依据”, “风险”, “边界条件”],
    “length”: “concise”
  },
  “audience”: “senior_engineer”
}
```

背景信息：
团队正在考虑将消息队列从 RabbitMQ 迁移到 Kafka……
已完成 POC，吞吐量提升 3x，但运维团队对 Kafka 不熟悉。
```

注意渲染行为的变化：`priority: “critical”` 的约束（”迁移风险和回退方案”）被提升到自然语言前段强调，而非仅留在 JSON 块中。这就是 `priority` 字段对 renderer 的实际作用。

## 15.4 answer_mode 冲突矩阵

`answer_mode` 中的布尔字段并非完全正交。以下矩阵定义了字段组合的语义关系和系统处理策略：

### 冲突定义

| 组合 | 语义关系 | 系统处理策略 |
|------|---------|-------------|
| `recommend_first` + `challenge_assumptions` | **张力组合**：先给推荐意味着接受前提进行建设性回答，质疑前提意味着可能推翻问题本身 | 合法但需 renderer 调和：先声明前提是否成立，再在前提有效范围内给出推荐。UI 显示黄色提示：”系统将先检验前提，再给推荐” |
| `recommend_first` + `step_by_step` | **冗余组合**：先给结论与逐步推导的阅读顺序矛盾 | 合法但需选择主序：以 `recommend_first` 为主，`step_by_step` 降级为”推荐之后的论证部分采用步骤式展开”。UI 显示灰色提示 |
| `recommend_first` + `explore_alternatives` | **弱张力**：推荐隐含偏好，探索备选隐含中立 | 合法：解读为”先给推荐，再横向对比备选方案说明为何推荐此项” |
| `challenge_assumptions` + `step_by_step` | **兼容** | 无冲突，正常处理 |
| `challenge_assumptions` + `explore_alternatives` | **兼容** | 无冲突，正常处理 |
| `production_aware` + `explore_alternatives` | **兼容** | 无冲突，每个备选方案都从生产视角评估 |
| `step_by_step` + `explore_alternatives` | **冗余组合**：两者都要求展开，可能导致输出过长 | 合法但 renderer 需压缩：`explore_alternatives` 优先，每个备选方案内部不强制步骤展开。UI 显示灰色提示：”输出可能较长” |

### 处理原则

1. **没有硬性禁止的组合**——所有组合都是合法的，系统不拒绝任何布尔组合。
2. **张力组合产生 UI 提示**（黄色），告知用户 renderer 将如何调和，用户可选择调整。
3. **冗余组合产生 UI 提示**（灰色），建议用户简化，但不阻塞。
4. **Renderer 调和规则写入 renderer 实现**，而非 schema 层面。schema 只声明字段，不承载渲染逻辑。

## 15.5 版本化契约

### Semver 规则

IR schema 采用 `MAJOR.MINOR` 语义化版本号，规则详见 9.4.1。当前 MVP 版本为 `0.2`。

### 向后兼容保证

| 场景 | 保证 |
|------|------|
| 同 MAJOR 版本内的 MINOR 升级 | 旧版 IR 在新版 renderer 下**完全兼容**，无需 migration |
| MAJOR 升级（如 0.x → 1.0） | 提供自动 migration adapter + **3 个月双版本并行期** |
| 弃用字段 | 经历 deprecated → write-removed → removed 三阶段，最少横跨 **2 个 MINOR 版本或 3 个月** |

### Migration 失败回退

当自动 migration 失败时：

1. 保留原始 IR 不变，不覆盖、不丢失
2. 标记 `metadata.migration_status: “failed”`
3. Renderer 降级为旧版兼容模式渲染该 IR
4. UI 提示用户：”该模板基于旧版结构，自动升级失败，您可以手动编辑或联系支持”
5. 系统记录失败日志供产品团队分析 migration adapter 覆盖率

### 版本号记录位置

```jsonc
{
  “schema_version”: “0.2”,         // IR 结构版本
  // template_version 和 renderer_version 不写入 IR，
  // 分别由 Template Definition 和 Renderer 各自管理
}
```

## 15.6 Draft → IR 编译契约

### 编译定义

Draft（用户当前编辑状态）到 IR（规范化中间表示）的转换称为”编译”。编译器的输入是 `Prompt Draft.current_form_state`，输出是合法的 `Prompt IR`。

### Partial Compile（部分编译）

#### 合法性

Partial compile 是合法的。用户在填写过程中，系统持续编译当前已有输入，产出 partial IR，用于驱动右侧实时预览。

#### 触发策略

| 触发条件 | 编译类型 | 产出 |
|----------|---------|------|
| 用户修改任意字段后 300ms（防抖） | Partial compile | `compile_status: “partial”` 的 IR，用于实时预览 |
| 用户点击”复制”或”保存模板” | Full compile | `compile_status: “complete”` 的 IR，需通过全部校验 |
| AI Assist 生成草案 | Full compile | `compile_status: “complete”` 或 `”partial”`（取决于 AI 填充完整度） |

#### Partial IR 的约束

- Partial IR **允许**缺少 `required` 字段（如 `objective` 为空）
- Partial IR **不允许**包含类型错误的值（如 `task_type` 为非法枚举值）
- Partial IR 的 `metadata.compile_status` 必须为 `”partial”`
- Renderer 处理 partial IR 时，缺失字段以占位符 `[待填写：<field_name>]` 渲染

### 校验分级

编译过程的校验分为三级，分别在不同时机执行：

| 级别 | 名称 | 时机 | 失败后果 | 示例 |
|------|------|------|---------|------|
| L1 | 类型校验 | 每次编译（含 partial） | 字段标红，阻止该字段值写入 IR | `task_type` 不在枚举范围内；`max_tokens` 为负数 |
| L2 | 完整性校验 | Full compile | 阻止复制/保存，提示缺失项 | `objective` 为空；`output_spec.shape` 为空数组 |
| L3 | 语义校验 | Full compile | 黄色警告，不阻塞 | answer_mode 张力组合；constraints 中存在矛盾项（见 15.7） |

### 编译器幂等性

对同一份 `current_form_state`，编译器必须产出相同的 IR。编译过程不依赖外部状态（时间戳等 metadata 字段除外）。

## 15.7 冲突校验规则的形式化定义

### 校验规则结构

每条冲突校验规则定义为一个 `ValidationRule`：

```jsonc
{
  “rule_id”: “string”,           // 唯一标识，如 “CONFLICT_001”
  “severity”: “error | warning”, // error 阻塞，warning 仅提示
  “condition”: “...”,            // 触发条件的形式化表达
  “message_template”: “string”,  // 面向用户的提示文案模板
  “resolution_hint”: “string”    // 建议的修复方向
}
```

### MVP 冲突校验规则集

#### R-001：constraints 内部矛盾检测

```
severity: warning
condition: EXISTS item_a IN constraints.must_consider, item_b IN constraints.must_not
           WHERE semantic_overlap(item_a.value, item_b.value) > threshold
message: “约束 '{item_a.value}' 与禁止项 '{item_b.value}' 可能矛盾，请确认”
resolution: “移除其中一项，或修改措辞使其不重叠”
```

说明：`semantic_overlap` 在 MVP 阶段采用关键词匹配（同词根、同义词表），不依赖 AI 判断。后续版本可升级为向量相似度。

#### R-002：answer_mode 张力组合检测

```
severity: warning
condition: answer_mode.recommend_first == true AND answer_mode.challenge_assumptions == true
message: “「先给推荐」与「质疑前提」存在张力——系统将先检验前提有效性，再在有效范围内给出推荐”
resolution: “如果您希望无条件质疑前提，建议关闭「先给推荐」”
```

#### R-003：answer_mode 冗余组合检测

```
severity: warning
condition: answer_mode.recommend_first == true AND answer_mode.step_by_step == true
message: “「先给推荐」与「逐步推导」的阅读顺序不同，系统将以先给推荐为主”
resolution: “如果您更需要完整推导过程，建议关闭「先给推荐」”
```

#### R-004：输出长度与展开模式冲突

```
severity: warning
condition: output_spec.length == “brief” AND
           (answer_mode.step_by_step == true OR answer_mode.explore_alternatives == true)
message: “输出要求「简短」，但回答模式要求展开，实际输出可能超出预期长度”
resolution: “将输出长度调整为 'concise' 或 'detailed'，或关闭展开类回答模式”
```

#### R-005：context 超限预警

```
severity: warning
condition: estimated_tokens(context.background + context.current_state + context.inputs)
           > context.max_tokens
message: “背景信息预估超出 token 上限（{estimated} / {max_tokens}），系统将按「{summary_strategy}」策略压缩”
resolution: “精简背景信息，或提高 max_tokens 上限”
```

#### R-006：critical 约束过多预警

```
severity: warning
condition: count(constraints.must_consider WHERE priority == “critical”) +
           count(constraints.must_not WHERE priority == “critical”) > 5
message: “标记为「关键」的约束过多（{count} 项），可能导致 renderer 无法有效区分优先级”
resolution: “将部分约束降级为 'normal'，仅保留最核心的 3-5 项为 'critical'”
```

### 校验执行时序

1. **L1 类型校验**：字段值变化时立即执行，结果即时反馈到对应字段
2. **L2 完整性校验**：full compile 触发时批量执行，结果汇总展示
3. **L3 语义校验（含上述冲突规则）**：full compile 触发时执行，结果以非阻塞警告形式展示在校验面板中

### 扩展性

冲突规则以声明式注册，新规则只需添加一条 `ValidationRule` 定义即可生效，不需要修改编译器或 renderer 核心逻辑。后续版本可支持模板级自定义规则。

## 15.8 示例：为什么增强后的 IR 仍然克制

增强后的 schema 相比初版的变化是有限且有目的的：

| 变化点 | 目的 | 没有做什么 |
|--------|------|-----------|
| constraint_item 支持 priority/source | 让 renderer 知道投放顺序和来源 | 没有引入权重数值、没有引入依赖关系 |
| context 增加 max_tokens/summary_strategy | 防止 IR 膨胀 | 没有引入分块策略、没有引入 RAG 语义 |
| answer_mode 定义冲突矩阵 | 让系统能自动调和张力 | 没有引入互斥锁、没有禁止任何组合 |
| 编译契约定义 partial compile | 支撑实时预览 | 没有引入多阶段编译、没有引入依赖图 |
| 冲突校验形式化 | 让校验可声明、可扩展 | 没有引入 AI 语义判断、没有引入规则优先级链 |

核心判断不变：IR 只围绕 prompt 生成所需字段设计，只覆盖与”任务执行约束”直接相关的信息。增强的是工程精度，不是语义覆盖面。

---

# 最终结论

Intent Compiler 最正确的产品方向，不是成为“更智能的 prompt 编辑器”，而是成为：

**一个以模板为入口、以 IR 为内核、以 renderer 为出口、以低摩擦复用为核心价值的意图编译产品。**

最关键的产品取舍只有三个：

1. **无 AI 模式必须是主路径**  
2. **IR 必须统一，但不能暴露为主交互**  
3. **MVP 优先做少量高频模板与稳定渲染，不追求表达完备**

如果这三个点守不住，产品很容易滑向两个错误方向之一：

- 一个复杂但没人愿意填的表单系统
- 一个昂贵但并不高效的 AI 访谈式 prompt 助手

这两条路都不对。现在这份 PRD 的核心，就是避免产品滑向这两个方向。

