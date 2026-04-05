# Intent Compiler - 文档索引

本目录包含 Intent Compiler 的产品需求文档（PRD）和架构决策记录（ADR），按主题拆分为独立文件，便于 Agent 按需加载。

## PRD（产品需求文档）

| # | 文件 | 内容 | 关键词 |
|---|------|------|--------|
| 01 | [summary](prd/01-summary.md) | 产品摘要、核心判断、MVP 结论、最终定位 | positioning, mvp |
| 02 | [problem-opportunity](prd/02-problem-opportunity.md) | 问题定义、机会点、替代方案分析 | problem, opportunity |
| 03 | [competitive-analysis](prd/03-competitive-analysis.md) | 竞品全景、功能矩阵、差异化壁垒 | competitive, moat |
| 04 | [users-jtbd](prd/04-users-jtbd.md) | 用户分层、JTBD、优先级 | users, personas |
| 05 | [core-concepts](prd/05-core-concepts.md) | Intent IR、Template、Renderer、AI Assist 定义 | concepts, ir |
| 06 | [product-scope](prd/06-product-scope.md) | MVP 范围、后续版本、非目标 | scope, mvp |
| 07 | [information-architecture](prd/07-information-architecture.md) | 对象模型、任务类型 taxonomy | objects, task-types |
| 08 | [user-flows](prd/08-user-flows.md) | 无 AI 主流程、AI 模式、模板复用流程 | flows, ux |
| 09 | [interaction-design](prd/09-interaction-design.md) | 交互原则、页面模块、布局 | ui, pages |
| 10 | [ir-schema-role](prd/10-ir-schema-role.md) | IR 角色边界、字段边界、版本化策略 | schema, versioning |
| 11 | [rendering-strategy](prd/11-rendering-strategy.md) | 四种渲染模式、字段分层投放、渲染示例 | renderer, hybrid-json |
| 12 | [risks-tradeoffs](prd/12-risks-tradeoffs.md) | 五大风险、失败模式、应对策略 | risks, failure-modes |
| 13 | [metrics-analytics](prd/13-metrics-analytics.md) | 北极星指标、埋点事件、实验设计 | metrics, events |
| 14 | [roadmap](prd/14-roadmap.md) | Phase 0-4 里程碑与交付物 | roadmap, phases |
| 15 | [open-decisions](prd/15-open-decisions.md) | 6 个未决问题与建议决策 | decisions |
| 16 | [appendix-ir-schema](prd/16-appendix-ir-schema.md) | IR JSON Schema 定义、完整实例、渲染示例 | json-schema, spec |
| 17 | [appendix-contracts](prd/17-appendix-contracts.md) | 冲突矩阵、版本契约、编译契约、校验规则 | contracts, validation |

## ADR（架构决策记录）

| # | 文件 | 内容 |
|---|------|------|
| 001 | [tech-stack-design](adr/001-tech-stack-design.md) | 技术选型（React+Vite+Zustand+Dexie）、代码组织、数据流、接口定义、部署架构 |

## Agent 使用指南

- **了解产品定位**：读 `01-summary.md`
- **了解技术栈**：读 `adr/001-tech-stack-design.md`
- **实现 IR 编译器**：读 `05-core-concepts.md` + `16-appendix-ir-schema.md` + `17-appendix-contracts.md`
- **实现 Renderer**：读 `11-rendering-strategy.md` + `16-appendix-ir-schema.md`
- **实现表单 UI**：读 `08-user-flows.md` + `09-interaction-design.md` + `07-information-architecture.md`
- **实现校验逻辑**：读 `17-appendix-contracts.md`
- **添加埋点**：读 `13-metrics-analytics.md`
