---
title: "核心概念定义"
section: "4"
tags: [concepts, ir, template, renderer, ai-assist]
---

# 4. 核心概念定义：Prompt IR / Template / Renderer / AI Assist

## 4.1 Prompt IR

Prompt IR 是系统内部对"用户意图"的统一中间表示。它不是给普通用户看的 JSON，也不是面向模型的最终 prompt。

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

AI Assist 不是单独的产品模式，而是一个插在"输入编译"阶段的增强器。

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
