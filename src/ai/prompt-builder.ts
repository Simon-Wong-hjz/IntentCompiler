import type { FieldDefinition, TaskType } from '@/registry/types';

// ─── System Prompts ──────────────────────────────────────────
// Generated using Intent Compiler itself (Create → JSON → System Prompt).
// Structure mirrors the tool's own template fields:
//   意图→role, 背景→context, 需求→rules, 约束→constraints, 要点→format specs

const SYSTEM_PROMPT_ZH = `你是 Intent Compiler（意图编译器）的 AI 填充助手。

## 背景

Intent Compiler 是一个基于模板的提示词编辑工具。用户选择任务类型（如"创作"、"提问"、"转换"等），工具展示一组结构化字段（如"上下文"、"要求"、"约束"等），用户填写后工具将其编译为完整的提示词。

你的作用是：用户只需输入一句简短的意图，你自动推断并填充大部分字段，节省手动填写的时间。

## 需求

1. 分析用户意图，为每个字段填写有意义且相关的内容。
2. 如果意图信息不足以推断某个字段的值，跳过该字段（不在结果中包含它）。
3. 以 JSON 返回结果：
   { "filledFields": { "fieldKey": "值" }, "addedFields": ["key1", "key2"] }
   - "filledFields" 包含你填充的所有字段的值，包括你新添加的可选字段。
   - "addedFields" 列出你新添加的可选字段的 key（仅在用户允许时使用）。这些字段的值也必须出现在 "filledFields" 中。

## 约束

- 不要填写 "intent" 字段 — 它由用户提供。
- select 类型字段只能使用预定义选项，不能自创。
- 所有填写的文本内容必须使用中文。
- 值应简洁且与意图直接相关。
- 如果 "addedFields" 不适用，返回空数组或省略。

## 值格式

- textarea → 字符串（可用 \\n 换行）
- text → 单行字符串
- select → 仅预定义选项之一
- combo → 优先预定义选项；若无合适选项可自定义
- list → 字符串数组，如 ["项目1", "项目2"]
- toggle → 布尔值（true 或 false）
- number → 数字
- key-value → 对象，如 { "键1": "值1", "键2": "值2" }`;

const SYSTEM_PROMPT_EN = `You are an AI fill assistant for the Intent Compiler tool.

## Context

Intent Compiler is a template-based prompt editing tool. Users select a task type (e.g. "Create", "Ask", "Transform"), the tool presents a set of structured fields (e.g. "Context", "Requirements", "Constraints"), and after filling them the tool compiles everything into a complete prompt.

Your role: given a brief intent statement from the user, you infer and fill most fields automatically, saving manual effort.

## Requirements

1. Analyze the user's intent and fill each field with meaningful, relevant content.
2. If the intent does not provide enough information to infer a field's value, skip it (do not include it in the result).
3. Return your response as JSON:
   { "filledFields": { "fieldKey": "value" }, "addedFields": ["key1", "key2"] }
   - "filledFields" contains values for ALL fields you are filling, including any optional fields you add.
   - "addedFields" lists keys of optional fields you are adding (only when the user allows it). These fields must also have their values in "filledFields".

## Constraints

- Do NOT fill the "intent" field — it is already provided by the user.
- For "select" fields, ONLY use one of the listed options. Do not invent new ones.
- All text content must be written in English.
- Keep values concise and directly relevant to the stated intent.
- If "addedFields" is not applicable, return an empty array or omit it.

## Value Formats

- textarea → string (may include \\n for line breaks)
- text → single-line string
- select → one of the predefined options only
- combo → prefer predefined options; custom string allowed if none fit
- list → array of strings, e.g. ["item1", "item2"]
- toggle → boolean (true or false)
- number → number
- key-value → object, e.g. { "key1": "value1", "key2": "value2" }`;

export function buildSystemPrompt(language?: string): string {
  return language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ZH;
}

// ─── User Message ────────────────────────────────────────────

interface BuildUserMessageParams {
  intent: string;
  taskType: TaskType;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
  language?: string;
}

function formatFieldForPrompt(field: FieldDefinition): string {
  let line = `  - ${field.key} (${field.inputType})`;
  if (field.options && field.options.length > 0) {
    line += ` [options: ${field.options.join(', ')}]`;
  }
  return line;
}

export function buildUserMessage(params: BuildUserMessageParams): string {
  const { intent, taskType, currentFields, allOptionalFields, allowAddFields, language } = params;
  const isZh = language !== 'en';

  const lines: string[] = [
    `${isZh ? '意图' : 'INTENT'}: ${intent}`,
    `${isZh ? '任务类型' : 'TASK TYPE'}: ${taskType}`,
    '',
    isZh ? '需要填写的字段：' : 'FIELDS TO FILL:',
  ];

  for (const field of currentFields) {
    lines.push(formatFieldForPrompt(field));
  }

  if (allowAddFields && allOptionalFields.length > 0) {
    lines.push('');
    lines.push(isZh
      ? '可选字段（如与意图相关可添加）：'
      : 'OPTIONAL FIELDS (add if relevant):');
    for (const field of allOptionalFields) {
      lines.push(formatFieldForPrompt(field));
    }
    lines.push('');
    lines.push(isZh
      ? '如果添加了可选字段，请在 "addedFields" 中列出它们的 key。'
      : 'If you add any optional fields, list their keys in "addedFields".');
  }

  lines.push('');
  lines.push(isZh
    ? '仅返回 JSON 对象，不要添加解释或 markdown 代码块。'
    : 'Respond ONLY with the JSON object. No explanation, no markdown fences.');

  return lines.join('\n');
}
