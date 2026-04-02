---
title: "Prompt IR / JSON Schema 在产品中的角色与边界"
section: "9"
tags: [ir, schema, versioning, boundaries]
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

- **MAJOR 升级**（如 `0.x -> 1.0`）：存在不向后兼容的结构变更。所有消费方必须适配。
- **MINOR 升级**（如 `1.0 -> 1.1`）：仅新增可选字段或扩展枚举值。旧版 IR 在新版 schema 下仍合法。

### 9.4.2 向后兼容保证

- 同一 MAJOR 版本内，系统保证**至少 6 个月**的向后兼容期。
- MAJOR 版本升级时，系统提供自动 migration adapter，并保证**至少 3 个月**的双版本并行期。

### 9.4.3 字段弃用策略

字段弃用遵循以下生命周期：

1. **标记弃用（deprecated）**：字段保留在 schema 中，renderer 仍处理，但 UI 不再主动展示。持续至少 2 个 MINOR 版本或 3 个月。
2. **停止写入（write-removed）**：新创建的 IR 不再包含该字段，但 renderer 仍可处理存量 IR。
3. **完全移除（removed）**：仅在 MAJOR 版本升级时执行。migration adapter 负责将旧字段映射到替代字段。

### 9.4.4 Migration 规范

- 每次 MAJOR 升级必须附带 `migration adapter`，定义 `(old_version, new_version) -> transform_fn` 的映射。
- Migration 必须是幂等的。
- Migration 失败时回退策略：保留原始 IR 不变，标记 `migration_status: "failed"`，renderer 使用旧版兼容模式渲染，并在 UI 提示用户手动介入。

### 9.4.5 版本分离原则

- `schema_version` 写入每个 IR，标识 IR 结构版本
- `template_version` 独立于 schema_version，标识模板定义自身的迭代
- `renderer_version` 独立于以上两者，标识渲染逻辑的迭代
- 三者版本号独立演进，通过兼容性矩阵声明支持关系

## 9.5 为什么"JSON Schema 作为用户可编辑高级模式"只能是次要入口

高级用户虽愿意操作结构，但普通用户不会。把它放主位会让产品定位崩掉。
建议作为"查看 IR / 导出 IR / 高级编辑"的隐藏入口，而不是默认操作面板。
