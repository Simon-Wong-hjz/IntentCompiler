import type { FieldDefinition, TaskType } from '@/registry/types';

const SYSTEM_PROMPT = `You are a prompt engineering assistant for the Intent Compiler tool. Your job is to analyze a user's brief intent statement and fill in structured template fields that will be used to build a comprehensive prompt.

RULES:
1. Analyze the user's intent and infer appropriate values for each field.
2. Only fill fields where you can provide meaningful, relevant content. Leave fields empty (omit them) if the intent does not provide enough information.
3. Return your response as a JSON object with this exact structure:
   {
     "filledFields": { "fieldKey": "value", ... },
     "addedFields": ["key1", "key2"]
   }
4. "filledFields" contains values for fields you are filling. "addedFields" lists keys of optional fields you are adding (only when the user allows it).

VALUE FORMAT RULES by input type:
- textarea: Return a string (can be multi-line with \\n).
- text: Return a single-line string.
- select: Return one of the predefined options ONLY. Do not invent new options.
- combo: Prefer predefined options when they fit. You may return a custom string if none of the options match.
- list: Return an array of strings, e.g. ["item1", "item2", "item3"].
- toggle: Return a boolean (true or false).
- number: Return a number.
- key-value: Return an object, e.g. { "key1": "value1", "key2": "value2" }.

IMPORTANT:
- Do NOT fill the "intent" field — it is already provided by the user.
- For "select" fields, ONLY use one of the listed options.
- Keep values concise and directly relevant to the stated intent.
- If "addedFields" is not applicable (user did not allow adding fields), return an empty array or omit it.`;

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

interface BuildUserMessageParams {
  intent: string;
  taskType: TaskType;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
}

function formatFieldForPrompt(field: FieldDefinition): string {
  let line = `  - ${field.key} (${field.inputType})`;
  if (field.options && field.options.length > 0) {
    line += ` [options: ${field.options.join(', ')}]`;
  }
  return line;
}

export function buildUserMessage(params: BuildUserMessageParams): string {
  const { intent, taskType, currentFields, allOptionalFields, allowAddFields } = params;

  const lines: string[] = [
    `INTENT: ${intent}`,
    `TASK TYPE: ${taskType}`,
    '',
    'FIELDS TO FILL (fill these based on the intent):',
  ];

  for (const field of currentFields) {
    lines.push(formatFieldForPrompt(field));
  }

  if (allowAddFields && allOptionalFields.length > 0) {
    lines.push('');
    lines.push('OPTIONAL FIELDS (you may add these if relevant to the intent):');
    for (const field of allOptionalFields) {
      lines.push(formatFieldForPrompt(field));
    }
    lines.push('');
    lines.push('If you add any optional fields, list their keys in "addedFields".');
  }

  lines.push('');
  lines.push('Respond ONLY with the JSON object. No explanation, no markdown fences.');

  return lines.join('\n');
}
