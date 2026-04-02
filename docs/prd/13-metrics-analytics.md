---
title: "成功指标与埋点建议"
section: "12"
tags: [metrics, analytics, events, experiments]
---

# 12. 成功指标与埋点建议

## 12.1 北极星指标：Build-to-Copy Rate

**定义：** 用户在一次构建 session 中，成功构建并复制 prompt 的比率。

```
Build-to-Copy Rate = 成功构建并复制的 session 数 / 总构建 session 数
```

其中"成功构建"需同时满足：

- 构建耗时 < 该构建类型的阈值（见 12.3）
- 该 session 内触发了 `prompt_copied` 事件

**为什么选择这个指标：**

- 完全可从产品端埋点计算，不依赖外部系统的使用反馈
- 同时编码了"效率"（耗时阈值）和"价值交付"（用户复制走了）两个维度
- 避免了"被实际使用"这一无法在产品端观测的模糊定义

**建议基线与目标：**

| 阶段 | Build-to-Copy Rate |
|------|-------------------|
| MVP 上线首月 | >= 40% |
| 稳定期（上线 3 个月后） | >= 60% |
| 成熟期目标 | >= 70% |

## 12.2 核心指标体系

### 指标 1：Activation Rate（激活率）

```
Activation Rate = 首次访问 24h 内触发 prompt_copied 的新用户数 / 同期新用户总数
```

**基线：** MVP >= 30%，稳定期 >= 50%

### 指标 2：D7 Retention（7 日留存率）

```
D7 Retention = Day 0 有 prompt_copied 且 Day 7 也有 prompt_copied 的用户数 / Day 0 有 prompt_copied 的用户数
```

| 指标 | MVP 首月 | 稳定期目标 |
|------|---------|-----------|
| D1 留存 | >= 15% | >= 30% |
| D7 留存 | >= 8% | >= 20% |
| D30 留存 | >= 3% | >= 10% |
| WAU/MAU | >= 0.15 | >= 0.25 |

### 指标 3：Template Health Ratio（模板健康度）

```
Template Health Ratio = 被复用 >= 2 次的已保存模板数 / 已保存模板总数
```

**基线：** MVP >= 20%，稳定期 >= 40%

### 指标 4：模板选择后完成率

```
Completion Rate = 触发 prompt_copied 或 template_saved 的 session 数 / 触发 template_selected 的 session 数
```

**基线：** MVP >= 50%，稳定期 >= 65%

### 指标 5：复制率与保存模板率

```
Copy Rate = 触发 prompt_copied 的 session 数 / 完成渲染（render_completed）的 session 数
Save Rate = 触发 template_saved 的 session 数 / 完成渲染（render_completed）的 session 数
```

### 指标 6：AI 草案接受率

```
AI Draft Accept Rate = AI 草案生成后触发 prompt_copied 的 session 数 / 触发 ai_draft_generated 的 session 数
```

## 12.3 构建耗时基准

### 首次构建耗时（First Build Time）

定义：从 `template_selected` 到首次 `prompt_copied`，且该 session 中无 `template_reused` 事件。

| 等级 | 耗时范围 |
|------|---------|
| 优秀 | < 60s |
| 达标 | 60-120s |
| 需改进 | > 120s |

**建议目标：** P50 < 90s，P90 < 120s

### 复用构建耗时（Reuse Build Time）

定义：从 `template_reused` 到首次 `prompt_copied`。

| 等级 | 耗时范围 |
|------|---------|
| 优秀 | < 15s |
| 达标 | 15-30s |
| 需改进 | > 30s |

**建议目标：** P50 < 20s，P90 < 30s

## 12.4 质量与诊断指标

1. **表单放弃率：** `draft_abandoned` / `template_selected`，按任务类型拆分
2. **字段修改分布：** 统计每个字段被用户修改（覆盖默认值）的频次
3. **冲突校验触发率：** `validation_triggered` / `field_updated`
4. **输出风格选择分布：** `render_variant_switched` 的 variant 参数分布
5. **导出后回流编辑率（同 session）：**

```
Same-session Re-edit Rate = prompt_copied 后又有 field_updated 的 session 数 / 触发 prompt_copied 的 session 数
```

6. **导出后回流编辑率（跨 session）：**

```
Cross-session Re-edit Rate = 导出后 24h 内在新 session 对同一实例触发 template_edited 的用户数 / 触发 prompt_exported 的用户数
```

- 同 session 回流编辑率偏高（> 30%）提示渲染预览未能有效帮助用户做最终判断
- 跨 session 回流编辑率偏高（> 20%）提示导出结果在实际使用中未达预期

## 12.5 指标间关系说明

### 互补关系

- **Build-to-Copy Rate + D7 Retention：** 前者衡量单次价值交付，后者衡量持续价值。两者同涨说明产品同时解决了"做得快"和"值得回来"。
- **Activation Rate + 首次构建耗时：** 激活率低但耗时短 -> 问题在获客或首屏引导；激活率低且耗时长 -> 构建流程本身有摩擦。

### 对冲关系

- **Copy Rate vs Save Rate：** 可能此消彼长。关注 `Copy Rate + Save Rate` 总和（Overall Engagement Rate）。
- **AI Draft Accept Rate vs 手动构建 Completion Rate：** AI 草案接受率的提升不应以手动路径完成率下降为代价。
- **Template Health Ratio vs Save Rate：** 保存率高但健康度低 -> 用户"随手保存但不复用"。

### 组合告警规则

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
| `session_started` | 用户进入构建页面 | `session_id`, `user_id`, `entry_source`, `is_new_user` |
| `session_ended` | 用户离开构建页面 | `session_id`, `duration_ms`, `outcome` |

### 模板与构建事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `template_selected` | 用户选择模板 | `session_id`, `template_id`, `task_type`, `source` |
| `template_reused` | 从已保存模板开始构建 | `session_id`, `template_id`, `original_save_time` |
| `template_saved` | 保存当前构建为模板 | `session_id`, `template_id`, `is_overwrite`, `field_count` |
| `template_edited` | 编辑已保存模板 | `session_id`, `template_id`, `edit_source`, `fields_changed` |
| `template_deleted` | 删除已保存模板 | `template_id`, `age_days`, `reuse_count` |
| `field_updated` | 修改任一字段 | `session_id`, `field_name`, `is_default_override`, `template_id` |
| `validation_triggered` | 冲突校验被触发 | `session_id`, `rule_id`, `severity`, `field_names` |
| `draft_abandoned` | 未完成构建即离开 | `session_id`, `template_id`, `last_active_field`, `duration_ms`, `fields_filled_count` |

### 渲染与导出事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `render_completed` | 系统完成渲染 | `session_id`, `render_type` |
| `render_variant_switched` | 用户切换输出风格 | `session_id`, `from_variant`, `to_variant` |
| `prompt_copied` | 用户复制 prompt | `session_id`, `render_type`, `prompt_length`, `time_since_session_start_ms` |
| `prompt_exported` | 通过导出功能输出 | `session_id`, `export_format`, `render_type` |

### AI 辅助事件

| 事件名 | 触发时机 | 关键属性 |
|-------|---------|---------|
| `ai_draft_generated` | AI 生成草案完成 | `session_id`, `inferred_task_type`, `confidence_score`, `generation_time_ms` |
| `ai_field_accepted` | 用户接受 AI 填充字段 | `session_id`, `field_name` |
| `ai_field_overridden` | 用户修改 AI 填充字段 | `session_id`, `field_name` |
| `ai_clarification_asked` | AI 触发追问 | `session_id`, `clarification_type`, `question_index` |

## 12.7 未决问题的数据实验设计

### 实验 1："默认导出格式"对 Build-to-Copy Rate 的影响

- **假设：** 混合 JSON 型作为默认导出的 Build-to-Copy Rate 高于纯自然语言型
- **设计：** A/B 测试，每组 >= 500 session，周期 2 周
- **主指标：** Build-to-Copy Rate
- **辅助指标：** `render_variant_switched` 频率、同 session 回流编辑率

### 实验 2：AI 模式入口位置对手动路径的影响

- **假设：** AI 模式入口前置化会降低手动构建路径的使用率
- **设计：** A/B 测试，每组 >= 300 新用户，周期 3 周
- **主指标：** 手动路径 Completion Rate、AI Draft Accept Rate

### 实验 3：保存引导时机对 Template Health Ratio 的影响

- **假设：** 第二次使用同类模板时引导保存 > 首次构建完成时引导保存
- **设计：** A/B 测试，每组 >= 200 用户，周期 5 周（含 30 天观察窗口）
- **主指标：** Template Health Ratio（30 天窗口）

### 实验 4：首次构建耗时阈值校准

- **类型：** 观察性分析（非干预实验）
- **方法：** 收集前 4 周耗时分布，按 `prompt_copied` 是否发生分组，找完成率急剧下降的拐点

## 12.8 关键判断

不要把"用户说好用"作为主成功标准。真正有效的信号是：

- Build-to-Copy Rate（是否在合理时间内完成构建）
- D7 Retention（首次使用后是否回来）
- Template Health Ratio（保存的模板是否被真正复用）

定性反馈仅用于解释定量数据的变动原因，不应作为产品决策的主依据。
