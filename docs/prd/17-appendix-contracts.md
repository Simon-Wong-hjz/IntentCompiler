---
title: "附录：契约、校验规则与冲突矩阵"
section: "15.4-15.8"
tags: [contracts, validation, conflict-matrix, compilation, appendix]
---

# 附录：契约、校验规则与冲突矩阵

## 15.4 answer_mode 冲突矩阵

`answer_mode` 中的布尔字段并非完全正交。以下矩阵定义了字段组合的语义关系和系统处理策略：

### 冲突定义

| 组合 | 语义关系 | 系统处理策略 |
|------|---------|-------------|
| `recommend_first` + `challenge_assumptions` | **张力组合** | 合法但需 renderer 调和：先声明前提是否成立，再在前提有效范围内给出推荐。UI 显示黄色提示 |
| `recommend_first` + `step_by_step` | **冗余组合** | 合法但需选择主序：以 `recommend_first` 为主，`step_by_step` 降级为论证部分步骤展开。UI 显示灰色提示 |
| `recommend_first` + `explore_alternatives` | **弱张力** | 合法：先给推荐，再横向对比备选方案说明为何推荐此项 |
| `challenge_assumptions` + `step_by_step` | **兼容** | 无冲突 |
| `challenge_assumptions` + `explore_alternatives` | **兼容** | 无冲突 |
| `production_aware` + `explore_alternatives` | **兼容** | 每个备选方案都从生产视角评估 |
| `step_by_step` + `explore_alternatives` | **冗余组合** | `explore_alternatives` 优先，每个备选方案内部不强制步骤展开。UI 显示灰色提示 |

### 处理原则

1. **没有硬性禁止的组合**——所有组合都是合法的，系统不拒绝任何布尔组合。
2. **张力组合产生 UI 提示**（黄色），告知用户 renderer 将如何调和。
3. **冗余组合产生 UI 提示**（灰色），建议用户简化，但不阻塞。
4. **Renderer 调和规则写入 renderer 实现**，而非 schema 层面。

## 15.5 版本化契约

### Semver 规则

IR schema 采用 `MAJOR.MINOR` 语义化版本号，规则详见 [10-ir-schema-role.md](10-ir-schema-role.md#94-版本化策略)。当前 MVP 版本为 `0.2`。

### 向后兼容保证

| 场景 | 保证 |
|------|------|
| 同 MAJOR 版本内的 MINOR 升级 | 旧版 IR 在新版 renderer 下**完全兼容** |
| MAJOR 升级（如 0.x -> 1.0） | 自动 migration adapter + **3 个月双版本并行期** |
| 弃用字段 | deprecated -> write-removed -> removed 三阶段，最少横跨 **2 个 MINOR 版本或 3 个月** |

### Migration 失败回退

1. 保留原始 IR 不变，不覆盖、不丢失
2. 标记 `metadata.migration_status: "failed"`
3. Renderer 降级为旧版兼容模式渲染
4. UI 提示用户手动介入
5. 系统记录失败日志

### 版本号记录位置

```jsonc
{
  "schema_version": "0.2",         // IR 结构版本
  // template_version 和 renderer_version 不写入 IR，
  // 分别由 Template Definition 和 Renderer 各自管理
}
```

## 15.6 Draft -> IR 编译契约

### 编译定义

Draft（用户当前编辑状态）到 IR（规范化中间表示）的转换称为"编译"。编译器的输入是 `Prompt Draft.current_form_state`，输出是合法的 `Prompt IR`。

### Partial Compile（部分编译）

Partial compile 是合法的。用户在填写过程中，系统持续编译当前已有输入，产出 partial IR，用于驱动右侧实时预览。

#### 触发策略

| 触发条件 | 编译类型 | 产出 |
|----------|---------|------|
| 用户修改字段后 300ms（防抖） | Partial compile | `compile_status: "partial"` 的 IR |
| 用户点击"复制"或"保存模板" | Full compile | `compile_status: "complete"` 的 IR |
| AI Assist 生成草案 | Full compile | 取决于 AI 填充完整度 |

#### Partial IR 的约束

- Partial IR **允许**缺少 `required` 字段（如 `objective` 为空）
- Partial IR **不允许**包含类型错误的值
- Partial IR 的 `metadata.compile_status` 必须为 `"partial"`
- Renderer 处理 partial IR 时，缺失字段以占位符 `[待填写：<field_name>]` 渲染

### 校验分级

| 级别 | 名称 | 时机 | 失败后果 | 示例 |
|------|------|------|---------|------|
| L1 | 类型校验 | 每次编译（含 partial） | 字段标红，阻止该字段值写入 IR | `task_type` 不在枚举范围内 |
| L2 | 完整性校验 | Full compile | 阻止复制/保存，提示缺失项 | `objective` 为空 |
| L3 | 语义校验 | Full compile | 黄色警告，不阻塞 | answer_mode 张力组合 |

### 编译器幂等性

对同一份 `current_form_state`，编译器必须产出相同的 IR。编译过程不依赖外部状态（时间戳等 metadata 字段除外）。

## 15.7 冲突校验规则的形式化定义

### 校验规则结构

```jsonc
{
  "rule_id": "string",           // 唯一标识，如 "CONFLICT_001"
  "severity": "error | warning", // error 阻塞，warning 仅提示
  "condition": "...",            // 触发条件的形式化表达
  "message_template": "string",  // 面向用户的提示文案模板
  "resolution_hint": "string"    // 建议的修复方向
}
```

### MVP 冲突校验规则集

#### R-001：constraints 内部矛盾检测

```
severity: warning
condition: EXISTS item_a IN constraints.must_consider, item_b IN constraints.must_not
           WHERE semantic_overlap(item_a.value, item_b.value) > threshold
message: "约束 '{item_a.value}' 与禁止项 '{item_b.value}' 可能矛盾，请确认"
resolution: "移除其中一项，或修改措辞使其不重叠"
```

说明：`semantic_overlap` 在 MVP 阶段采用关键词匹配（同词根、同义词表），不依赖 AI 判断。

#### R-002：answer_mode 张力组合检测

```
severity: warning
condition: answer_mode.recommend_first == true AND answer_mode.challenge_assumptions == true
message: "「先给推荐」与「质疑前提」存在张力——系统将先检验前提有效性，再在有效范围内给出推荐"
resolution: "如果您希望无条件质疑前提，建议关闭「先给推荐」"
```

#### R-003：answer_mode 冗余组合检测

```
severity: warning
condition: answer_mode.recommend_first == true AND answer_mode.step_by_step == true
message: "「先给推荐」与「逐步推导」的阅读顺序不同，系统将以先给推荐为主"
resolution: "如果您更需要完整推导过程，建议关闭「先给推荐」"
```

#### R-004：输出长度与展开模式冲突

```
severity: warning
condition: output_spec.length == "brief" AND
           (answer_mode.step_by_step == true OR answer_mode.explore_alternatives == true)
message: "输出要求「简短」，但回答模式要求展开，实际输出可能超出预期长度"
resolution: "将输出长度调整为 'concise' 或 'detailed'，或关闭展开类回答模式"
```

#### R-005：context 超限预警

```
severity: warning
condition: estimated_tokens(context.background + context.current_state + context.inputs)
           > context.max_tokens
message: "背景信息预估超出 token 上限（{estimated} / {max_tokens}），系统将按「{summary_strategy}」策略压缩"
resolution: "精简背景信息，或提高 max_tokens 上限"
```

#### R-006：critical 约束过多预警

```
severity: warning
condition: count(constraints.must_consider WHERE priority == "critical") +
           count(constraints.must_not WHERE priority == "critical") > 5
message: "标记为「关键」的约束过多（{count} 项），可能导致 renderer 无法有效区分优先级"
resolution: "将部分约束降级为 'normal'，仅保留最核心的 3-5 项为 'critical'"
```

### 校验执行时序

1. **L1 类型校验**：字段值变化时立即执行
2. **L2 完整性校验**：full compile 触发时批量执行
3. **L3 语义校验（含冲突规则）**：full compile 触发时执行，非阻塞警告

### 扩展性

冲突规则以声明式注册，新规则只需添加一条 `ValidationRule` 定义即可生效。后续版本可支持模板级自定义规则。

## 15.8 为什么增强后的 IR 仍然克制

| 变化点 | 目的 | 没有做什么 |
|--------|------|-----------|
| constraint_item 支持 priority/source | 让 renderer 知道投放顺序和来源 | 没有引入权重数值、没有引入依赖关系 |
| context 增加 max_tokens/summary_strategy | 防止 IR 膨胀 | 没有引入分块策略、没有引入 RAG 语义 |
| answer_mode 定义冲突矩阵 | 让系统能自动调和张力 | 没有引入互斥锁、没有禁止任何组合 |
| 编译契约定义 partial compile | 支撑实时预览 | 没有引入多阶段编译、没有引入依赖图 |
| 冲突校验形式化 | 让校验可声明、可扩展 | 没有引入 AI 语义判断、没有引入规则优先级链 |

核心判断不变：IR 只围绕 prompt 生成所需字段设计，只覆盖与"任务执行约束"直接相关的信息。增强的是工程精度，不是语义覆盖面。
