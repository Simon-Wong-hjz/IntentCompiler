# Intent Compiler

一个将用户任务意图进行结构化编译的工具。编译产物可渲染为 prompt、Agent 指令等多种目标输出。

## 核心理念

Intent Compiler 不是"帮用户把 prompt 写得更花"的编辑器，而是一个将任务意图、目标、约束、输出要求进行**结构化编译**的产品层。无论下游消费者是 LLM 对话、Agent 框架还是自动化工具链，结构化的意图表达都是稳定输出的前提。

- 以**无 AI 模式**为默认入口，降低使用门槛
- 以**模板 + 少量关键槽位 + 强默认值**为主要交互
- 以**统一 Intent IR**为底层协议
- 以 **Renderer** 作为输出适配层，支持 prompt、Agent 指令等多种目标格式

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 状态管理 | Zustand |
| 本地存储 | Dexie (IndexedDB) |
| 样式 | Tailwind CSS |
| 部署 | Cloudflare Pages |

## 项目状态

🚧 **MVP 开发中** — 当前阶段为产品设计与架构决策，尚未开始编码。

## 文档

详见 [`docs/README.md`](docs/README.md)，包含完整的 PRD（产品需求文档）和 ADR（架构决策记录）索引。

## License

[Apache License 2.0](LICENSE)
