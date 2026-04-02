---
title: "附录：IR Schema 定义与示例"
section: "15.1-15.3"
tags: [ir-schema, json-schema, examples, appendix]
---

# 15. 附录：IR Schema 定义与示例

## 15.1 增强版 IR JSON Schema

以下为工程级 IR schema 定义。设计原则：每个字段必须能被 renderer 消费，不承载 renderer 不需要的语义。

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "intent-compiler-ir-v0.2",
  "type": "object",
  "required": ["schema_version", "task_type", "objective"],
  "properties": {

    "schema_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+$",
      "description": "Semver MAJOR.MINOR，如 '0.2'"
    },

    "task_type": {
      "type": "string",
      "enum": [
        "production_evaluation",
        "mechanism_check",
        "problem_modeling",
        "quick_lookup",
        "code_generation",
        "comparison_decision",
        "open_exploration",
        "text_rewrite"
      ]
    },

    "objective": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "一句话主目标，renderer 用于生成自然语言前段的核心句"
    },

    // ── context：增加长度限制与摘要策略 ──
    "context": {
      "type": "object",
      "properties": {
        "background": {
          "type": "string",
          "maxLength": 4000,
          "description": "任务背景描述"
        },
        "current_state": {
          "type": "string",
          "maxLength": 2000,
          "description": "当前状态或已有进展"
        },
        "inputs": {
          "type": "array",
          "items": { "type": "string", "maxLength": 2000 },
          "maxItems": 10,
          "description": "用户提供的输入材料"
        },
        "max_tokens": {
          "type": "integer",
          "default": 2000,
          "minimum": 100,
          "maximum": 8000,
          "description": "context 整体渲染到最终 prompt 时的 token 预算上限。超出时触发 summary_strategy"
        },
        "summary_strategy": {
          "type": "string",
          "enum": ["truncate_tail", "extractive_summary", "abstractive_summary"],
          "default": "truncate_tail",
          "description": "context 超出 max_tokens 时的压缩策略"
        }
      },
      "additionalProperties": false
    },

    // ── constraints：引入结构化约束项 ──
    "constraints": {
      "type": "object",
      "properties": {
        "must_consider": {
          "type": "array",
          "items": { "$ref": "#/$defs/constraint_item" },
          "maxItems": 15,
          "description": "模型必须考虑的约束"
        },
        "must_not": {
          "type": "array",
          "items": { "$ref": "#/$defs/constraint_item" },
          "maxItems": 15,
          "description": "模型必须避免的行为"
        }
      },
      "additionalProperties": false
    },

    "output_spec": {
      "type": "object",
      "properties": {
        "format": {
          "type": "string",
          "enum": ["structured_markdown", "plain_text", "json", "table", "code_block"]
        },
        "shape": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 1,
          "maxItems": 10,
          "description": "输出应包含的结构化段落，按期望阅读顺序排列"
        },
        "length": {
          "type": "string",
          "enum": ["brief", "concise", "detailed"],
          "default": "concise"
        }
      },
      "additionalProperties": false
    },

    // ── answer_mode：增加冲突矩阵定义 ──
    "answer_mode": {
      "type": "object",
      "properties": {
        "production_aware": {
          "type": "boolean",
          "default": false,
          "description": "从生产落地视角回答，关注可行性、成本、风险"
        },
        "challenge_assumptions": {
          "type": "boolean",
          "default": false,
          "description": "主动质疑提问者的前提假设"
        },
        "recommend_first": {
          "type": "boolean",
          "default": false,
          "description": "先给结论/推荐，再给推导过程"
        },
        "explore_alternatives": {
          "type": "boolean",
          "default": false,
          "description": "展开多种备选方案的比较"
        },
        "step_by_step": {
          "type": "boolean",
          "default": false,
          "description": "按步骤逐步推导"
        }
      },
      "additionalProperties": false,
      "description": "见 17-appendix-contracts.md 中的 answer_mode 冲突矩阵"
    },

    "style": {
      "type": "object",
      "properties": {
        "tone": {
          "type": "string",
          "enum": ["direct", "neutral", "cautious", "conversational"],
          "default": "neutral"
        },
        "verbosity": {
          "type": "string",
          "enum": ["minimal", "low", "medium"],
          "default": "low"
        }
      },
      "additionalProperties": false
    },

    "audience": {
      "type": "string",
      "enum": ["general", "junior_engineer", "senior_engineer", "non_technical_stakeholder", "domain_expert"],
      "default": "general"
    },

    "metadata": {
      "type": "object",
      "properties": {
        "source_mode": {
          "type": "string",
          "enum": ["manual", "template", "ai_assist"]
        },
        "template_id": { "type": "string" },
        "created_at": { "type": "string", "format": "date-time" },
        "compile_status": {
          "type": "string",
          "enum": ["complete", "partial"],
          "default": "complete",
          "description": "见 17-appendix-contracts.md 中的 Draft → IR 编译契约"
        }
      },
      "additionalProperties": false
    }
  },

  // ── 共享定义 ──
  "$defs": {
    "constraint_item": {
      "oneOf": [
        {
          "type": "string",
          "description": "简写形式，等价于 { value: <string>, priority: 'normal' }"
        },
        {
          "type": "object",
          "required": ["value"],
          "properties": {
            "value": {
              "type": "string",
              "maxLength": 200,
              "description": "约束内容"
            },
            "priority": {
              "type": "string",
              "enum": ["critical", "normal", "nice_to_have"],
              "default": "normal",
              "description": "critical：renderer 必须在自然语言前段强调；normal：正常投放；nice_to_have：token 紧张时可省略"
            },
            "source": {
              "type": "string",
              "enum": ["user", "template", "ai_assist"],
              "description": "约束来源，用于 UI 高亮与信任度展示"
            }
          },
          "additionalProperties": false
        }
      ]
    }
  },

  "additionalProperties": false
}
```

### 设计说明

**约束项双态设计（`constraint_item`）**：允许纯字符串简写以保持低门槛，同时支持 `{value, priority, source}` 结构体供需要精细控制的场景。`priority` 直接影响渲染行为：`critical` 约束会被提升到自然语言前段，`nice_to_have` 在 token 紧张时由 renderer 自动裁剪。

**Context 防膨胀机制**：`max_tokens` 和 `summary_strategy` 协同工作。默认策略 `truncate_tail` 无需 AI 介入，保证无 AI 模式下也能正常工作。

**字段数量克制**：整个 schema 仍然只有 9 个顶层字段 + 1 个 metadata，没有引入新的顶层维度。

## 15.2 IR 实例（完整示例）

```json
{
  "schema_version": "0.2",
  "task_type": "production_evaluation",
  "objective": "评估某个设计方案是否适合生产落地",
  "context": {
    "background": "团队正在考虑将消息队列从 RabbitMQ 迁移到 Kafka……",
    "current_state": "已完成 POC，吞吐量提升 3x，但运维团队对 Kafka 不熟悉",
    "inputs": [],
    "max_tokens": 2000,
    "summary_strategy": "truncate_tail"
  },
  "constraints": {
    "must_consider": [
      { "value": "real-world operational constraints", "priority": "critical", "source": "template" },
      { "value": "migration risk and rollback plan", "priority": "critical", "source": "user" },
      { "value": "team learning curve", "priority": "normal", "source": "ai_assist" },
      "maintenance cost"
    ],
    "must_not": [
      { "value": "generic textbook comparison", "priority": "critical", "source": "template" },
      "listing pros and cons without taking a stance"
    ]
  },
  "output_spec": {
    "format": "structured_markdown",
    "shape": ["conclusion", "reasoning", "risks", "boundary_conditions"],
    "length": "concise"
  },
  "answer_mode": {
    "production_aware": true,
    "challenge_assumptions": true,
    "recommend_first": true,
    "explore_alternatives": false,
    "step_by_step": false
  },
  "style": {
    "tone": "direct",
    "verbosity": "low"
  },
  "audience": "senior_engineer",
  "metadata": {
    "source_mode": "template",
    "template_id": "production_eval_v1",
    "created_at": "2025-01-15T10:30:00Z",
    "compile_status": "complete"
  }
}
```

## 15.3 渲染后的混合 JSON Prompt 示例

```text
请从生产落地视角评估下面这个方案。先给结论，再给依据；如果方案前提本身有逻辑漏洞，请直接指出并修正。回答时优先做取舍判断，不要做泛泛铺垫。迁移风险和回退方案是本次评估最关键的约束，请务必覆盖。

```json
{
  "constraints": {
    "must_consider": [
      "真实运维约束",
      "迁移风险与回退方案",
      "团队学习曲线",
      "维护成本"
    ],
    "must_not": [
      "教科书式展开",
      "两边都说对",
      "不做取舍"
    ]
  },
  "output_spec": {
    "shape": ["结论", "依据", "风险", "边界条件"],
    "length": "concise"
  },
  "audience": "senior_engineer"
}
```

背景信息：
团队正在考虑将消息队列从 RabbitMQ 迁移到 Kafka……
已完成 POC，吞吐量提升 3x，但运维团队对 Kafka 不熟悉。
```

注意渲染行为：`priority: "critical"` 的约束（"迁移风险和回退方案"）被提升到自然语言前段强调，而非仅留在 JSON 块中。
