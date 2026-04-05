---
title: "信息架构与关键对象模型"
section: "6"
tags: [architecture, objects, task-types]
---

# 6. 信息架构与关键对象模型

## 6.1 信息架构总览

建议采用以下对象层级：

- Workspace（可选，团队版再加强）
- Template Definition（系统模板定义）
- Prompt Draft（用户当前编辑中的实例）
- Intent IR（规范化中间表示）
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

### C. Intent IR

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

## 6.4 为什么不建议先做"无限自定义字段"

因为这会迅速破坏模板的一致性和 renderer 的可控性。MVP 中自定义能力应限制为：

- 补充说明文本
- 少量自定义约束条目
- 自定义不要做的事

不要允许用户在 schema 层面随意加字段。
