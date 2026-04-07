# Intent Compiler

> 一款基于模板引导的 AI 提示词结构化编辑工具。

Intent Compiler 帮助你将意图"编译"为结构清晰的提示词。选择任务类型、填写相关字段，即可获得整洁、可直接复制的提示词 —— 默认无需 AI，也可选择 AI 辅助填充。

## 功能特性

- **6 种任务类型** — 提问、创作、转化、分析、构思、执行 — 每种类型配备定制化字段模板
- **渐进式呈现** — 默认仅显示核心字段，可按需添加可选字段
- **4 种输出格式** — Markdown、JSON、YAML、XML — 均为一等公民
- **实时预览** — 编辑时即时查看编译后的提示词
- **双语支持** — 界面和输出均支持中文与英文
- **AI 增强模式** — 可选通过 OpenAI 或 Anthropic API 自动填充字段
- **本地持久化** — 设置和编译历史存储于 IndexedDB
- **隐私优先** — 纯客户端单页应用；API 密钥仅发送至 AI 服务商，不经过任何中间服务器

## 技术栈

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v3** + **shadcn/ui**
- **react-i18next** 双语支持
- **Dexie.js** IndexedDB 存储
- **Vitest** + **React Testing Library** 测试

## 快速开始

> [!NOTE]
> 项目正在积极开发中，初始脚手架搭建完成后将补充安装与启动说明。

## 文档

- [产品需求文档](docs/prd/intent-compiler-prd.md)
- [UI/UX 设计规范](docs/design/frontend-design.md)
- [实施路线图](docs/plans/intent-compiler-roadmap.md)

## 许可证

[Apache License 2.0](LICENSE) — Copyright 2026 Simon Huang
