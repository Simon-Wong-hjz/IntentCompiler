# Phase 5: AI-Enhanced Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable AI-assisted field filling so users can write a brief intent and have an AI provider (OpenAI or Anthropic) parse it and populate template fields automatically.

**Architecture:** An abstract `AiProvider` interface defines `fillFields()` and `verifyKey()` contracts. Concrete providers for OpenAI and Anthropic implement these using direct `fetch()` calls (no SDK dependencies). An AI Connector orchestrator builds prompts from the intent + task type + field definitions, calls the selected provider, validates the response, and maps results back to field values. The `useAiFill` hook connects this pipeline to React state, while the `AiFillButton` component renders the four-state UI.

**Tech Stack:** React 19.2, TypeScript 6, Vite 8, Tailwind CSS v4, fetch API (no AI SDK dependencies), Vitest 4.1 with `vi.fn()` / `vi.spyOn()` for mocking fetch, React hooks

> **Phase 1 Audit Note:** Phase 1 installed newer versions than originally planned. See `.claude/progress/2026-04-07-02-phase-plan-audit.md` for full details. Key differences: Tailwind v4 uses `@theme {}` block in `src/index.css` instead of `tailwind.config.ts`; TypeScript 6 has no `baseUrl`. Verify React 19.2 hook semantics for custom hooks in this phase.

---

## File Structure

All files created or modified in this phase:

```
Files to CREATE:
src/ai/types.ts                             # AiProvider interface, request/response types
src/ai/providers/openai.ts                  # OpenAI provider: fillFields + verifyKey via fetch
src/ai/providers/anthropic.ts               # Anthropic provider: fillFields + verifyKey via fetch
src/ai/connector.ts                         # AI connector orchestrator: prompt building + response mapping
src/ai/prompt-builder.ts                    # System prompt construction from task type + fields
src/components/editor/AiFillButton.tsx      # AI Fill button with 4 states + progress bar
src/hooks/useAiFill.ts                      # Hook: orchestrates fill flow, manages status

Tests to CREATE:
tests/ai/providers/openai.test.ts           # OpenAI provider: fetch mocking, response parsing, errors
tests/ai/providers/anthropic.test.ts        # Anthropic provider: fetch mocking, CORS handling, errors
tests/ai/connector.test.ts                  # Connector: prompt building, response validation, field mapping
tests/ai/prompt-builder.test.ts             # Prompt builder: output structure verification

Files to MODIFY:
src/components/editor/IntentField.tsx        # Add AiFillButton in label row + "Allow AI to add fields" checkbox
src/components/editor/EditorArea.tsx         # Pass aiFilledFields set, apply bg-accent-light tinting
src/components/editor/FieldRenderer.tsx      # Accept and render AI-tint background on field containers
src/components/modals/SettingsModal.tsx      # Replace mock verifier with real provider.verifyKey()
src/App.tsx                                  # Add AI-related state (aiFilledFields, allowAddFields), wire useAiFill
```

---

### Task 1: AI Provider Types

**Files:**
- Create: `src/ai/types.ts`

- [ ] **Step 1: Create `src/ai/types.ts`**
```ts
import type { TaskType, FieldDefinition } from '@/registry/types';

/** Request payload for AI field filling */
export interface AiFillRequest {
  intent: string;
  taskType: TaskType;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
  apiKey: string;
}

/** Response from AI field filling */
export interface AiFillResponse {
  filledFields: Record<string, unknown>;
  addedFieldKeys?: string[];
}

/** Result of API key verification */
export interface VerifyResult {
  valid: boolean;
  model?: string;
  error?: string;
}

/** Abstract AI provider interface */
export interface AiProvider {
  name: string;
  fillFields(request: AiFillRequest): Promise<AiFillResponse>;
  verifyKey(apiKey: string): Promise<VerifyResult>;
}

/** Provider identifiers */
export type AiProviderName = 'openai' | 'anthropic';
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/ai/types.ts
git commit -m "feat(ai): define AiProvider interface and request/response types"
```

---

### Task 2: Prompt Builder

**Files:**
- Create: `src/ai/prompt-builder.ts`
- Test: `tests/ai/prompt-builder.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/ai/prompt-builder.test.ts`
```ts
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserMessage } from '@/ai/prompt-builder';
import type { FieldDefinition } from '@/registry/types';

const sampleFields: FieldDefinition[] = [
  { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
  { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
  { key: 'question_type', inputType: 'select', scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
  { key: 'audience', inputType: 'text', scope: 'task', visibility: 'default' },
];

const sampleOptionalFields: FieldDefinition[] = [
  { key: 'knowledge_level', inputType: 'combo', scope: 'task', visibility: 'optional', options: ['beginner', 'intermediate', 'expert'] },
  { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
];

describe('Prompt Builder', () => {
  describe('buildSystemPrompt', () => {
    it('contains instructions for returning JSON', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('filledFields');
      expect(prompt).toContain('addedFields');
    });

    it('instructs AI about field input types', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('list');
      expect(prompt).toContain('array of strings');
      expect(prompt).toContain('select');
      expect(prompt).toContain('toggle');
      expect(prompt).toContain('boolean');
      expect(prompt).toContain('number');
    });
  });

  describe('buildUserMessage', () => {
    it('includes the intent and task type', () => {
      const msg = buildUserMessage({
        intent: 'How do React hooks work?',
        taskType: 'ask',
        currentFields: sampleFields,
        allOptionalFields: [],
        allowAddFields: false,
      });
      expect(msg).toContain('How do React hooks work?');
      expect(msg).toContain('ask');
    });

    it('lists current fields with their input types and options', () => {
      const msg = buildUserMessage({
        intent: 'Test intent',
        taskType: 'ask',
        currentFields: sampleFields,
        allOptionalFields: [],
        allowAddFields: false,
      });
      expect(msg).toContain('context');
      expect(msg).toContain('textarea');
      expect(msg).toContain('question_type');
      expect(msg).toContain('factual');
    });

    it('includes optional fields when allowAddFields is true', () => {
      const msg = buildUserMessage({
        intent: 'Test intent',
        taskType: 'ask',
        currentFields: sampleFields,
        allOptionalFields: sampleOptionalFields,
        allowAddFields: true,
      });
      expect(msg).toContain('knowledge_level');
      expect(msg).toContain('tone');
      expect(msg).toContain('beginner');
    });

    it('does NOT include optional fields when allowAddFields is false', () => {
      const msg = buildUserMessage({
        intent: 'Test intent',
        taskType: 'ask',
        currentFields: sampleFields,
        allOptionalFields: sampleOptionalFields,
        allowAddFields: false,
      });
      expect(msg).not.toContain('knowledge_level');
      expect(msg).not.toContain('OPTIONAL FIELDS');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/ai/prompt-builder.test.ts
```
Expected: FAIL — cannot resolve `@/ai/prompt-builder`.

- [ ] **Step 3: Write implementation** — `src/ai/prompt-builder.ts`
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npx vitest run tests/ai/prompt-builder.test.ts
```
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/ai/prompt-builder.ts tests/ai/prompt-builder.test.ts
git commit -m "feat(ai): implement prompt builder for field filling requests"
```

---

### Task 3: OpenAI Provider

**Files:**
- Create: `src/ai/providers/openai.ts`
- Test: `tests/ai/providers/openai.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/ai/providers/openai.test.ts`
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIProvider } from '@/ai/providers/openai';
import type { AiFillRequest } from '@/ai/types';

const mockRequest: AiFillRequest = {
  intent: 'How do React hooks work?',
  taskType: 'ask',
  currentFields: [
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'question_type', inputType: 'select', scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
  ],
  allOptionalFields: [],
  allowAddFields: false,
  apiKey: 'sk-test-key-123',
};

describe('OpenAI Provider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fillFields', () => {
    it('sends correct request to OpenAI chat completions API', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                filledFields: { context: 'React state management', question_type: 'conceptual' },
              }),
            },
          }],
        }), { status: 200 })
      );

      await provider.fillFields(mockRequest);

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://api.openai.com/v1/chat/completions');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe('Bearer sk-test-key-123');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.model).toBe('gpt-4o');
      expect(body.response_format).toEqual({ type: 'json_object' });
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[1].role).toBe('user');
    });

    it('parses successful response and returns filled fields', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                filledFields: { context: 'React state management', question_type: 'conceptual' },
                addedFields: [],
              }),
            },
          }],
        }), { status: 200 })
      );

      const result = await provider.fillFields(mockRequest);
      expect(result.filledFields).toEqual({
        context: 'React state management',
        question_type: 'conceptual',
      });
    });

    it('throws on 401 invalid API key', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Invalid API key' } }), { status: 401 })
      );

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('Invalid API key');
    });

    it('throws on 429 rate limit', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Rate limit exceeded' } }), { status: 429 })
      );

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('Rate limited');
    });

    it('throws on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('Network error');
    });
  });

  describe('verifyKey', () => {
    it('returns valid result on successful models request', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ id: 'gpt-4o' }] }), { status: 200 })
      );

      const result = await provider.verifyKey('sk-test-key-123');
      expect(result.valid).toBe(true);
      expect(result.model).toBe('GPT-4o');
    });

    it('returns invalid result on 401', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Invalid key' } }), { status: 401 })
      );

      const result = await provider.verifyKey('sk-bad-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });

    it('returns invalid result on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await provider.verifyKey('sk-test-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('network');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/ai/providers/openai.test.ts
```
Expected: FAIL — cannot resolve `@/ai/providers/openai`.

- [ ] **Step 3: Write implementation** — `src/ai/providers/openai.ts`
```ts
import type { AiProvider, AiFillRequest, AiFillResponse, VerifyResult } from '@/ai/types';
import { buildSystemPrompt, buildUserMessage } from '@/ai/prompt-builder';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';
const MODEL = 'gpt-4o';

export class OpenAIProvider implements AiProvider {
  name = 'OpenAI';

  async fillFields(request: AiFillRequest): Promise<AiFillResponse> {
    const { apiKey, intent, taskType, currentFields, allOptionalFields, allowAddFields } = request;

    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage({
      intent,
      taskType,
      currentFields,
      allOptionalFields,
      allowAddFields,
    });

    let response: Response;
    try {
      response = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
    } catch {
      throw new Error('Network error: could not reach OpenAI. Check your internet connection.');
    }

    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limited. Please wait a moment and try again.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `OpenAI request failed (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI.');
    }

    const parsed = JSON.parse(content) as AiFillResponse;

    return {
      filledFields: parsed.filledFields ?? {},
      addedFieldKeys: parsed.addedFields ?? parsed.addedFieldKeys ?? [],
    };
  }

  async verifyKey(apiKey: string): Promise<VerifyResult> {
    try {
      const response = await fetch(OPENAI_MODELS_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key. Please check and try again.' };
      }

      if (!response.ok) {
        return { valid: false, error: `Verification failed (${response.status}).` };
      }

      return { valid: true, model: 'GPT-4o' };
    } catch {
      return { valid: false, error: 'Could not verify key. Check your network connection.' };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npx vitest run tests/ai/providers/openai.test.ts
```
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/ai/providers/openai.ts tests/ai/providers/openai.test.ts
git commit -m "feat(ai): implement OpenAI provider with fillFields and verifyKey"
```

---

### Task 4: Anthropic Provider

**Files:**
- Create: `src/ai/providers/anthropic.ts`
- Test: `tests/ai/providers/anthropic.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/ai/providers/anthropic.test.ts`
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnthropicProvider } from '@/ai/providers/anthropic';
import type { AiFillRequest } from '@/ai/types';

const mockRequest: AiFillRequest = {
  intent: 'Write a Python script to scrape websites',
  taskType: 'create',
  currentFields: [
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'content_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['email', 'article', 'doc', 'code', 'script'] },
  ],
  allOptionalFields: [],
  allowAddFields: false,
  apiKey: 'sk-ant-test-key-123',
};

describe('Anthropic Provider', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fillFields', () => {
    it('sends correct request to Anthropic messages API', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({
          content: [{
            type: 'text',
            text: JSON.stringify({
              filledFields: { context: 'Web scraping project', content_type: 'script' },
            }),
          }],
        }), { status: 200 })
      );

      await provider.fillFields(mockRequest);

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://api.anthropic.com/v1/messages');
      expect(options.method).toBe('POST');
      expect(options.headers['x-api-key']).toBe('sk-ant-test-key-123');
      expect(options.headers['anthropic-version']).toBe('2023-06-01');
      expect(options.headers['content-type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.model).toBe('claude-sonnet-4-20250514');
      expect(body.system).toBeTruthy();
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
    });

    it('parses successful response and returns filled fields', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({
          content: [{
            type: 'text',
            text: JSON.stringify({
              filledFields: { context: 'Web scraping', content_type: 'script' },
              addedFields: [],
            }),
          }],
        }), { status: 200 })
      );

      const result = await provider.fillFields(mockRequest);
      expect(result.filledFields).toEqual({
        context: 'Web scraping',
        content_type: 'script',
      });
    });

    it('throws on 401 invalid API key', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Invalid API key' } }), { status: 401 })
      );

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('Invalid API key');
    });

    it('throws on 429 rate limit', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Rate limit exceeded' } }), { status: 429 })
      );

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('Rate limited');
    });

    it('throws CORS-specific error on TypeError (browser CORS block)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('CORS');
    });
  });

  describe('verifyKey', () => {
    it('returns valid result on successful minimal request', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({
          id: 'msg_test',
          content: [{ type: 'text', text: 'Hello' }],
          model: 'claude-sonnet-4-20250514',
        }), { status: 200 })
      );

      const result = await provider.verifyKey('sk-ant-test-key');
      expect(result.valid).toBe(true);
      expect(result.model).toContain('Claude');
    });

    it('returns invalid result on 401', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Invalid key' } }), { status: 401 })
      );

      const result = await provider.verifyKey('sk-ant-bad-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });

    it('returns CORS-specific error on network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await provider.verifyKey('sk-ant-test-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('CORS');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/ai/providers/anthropic.test.ts
```
Expected: FAIL — cannot resolve `@/ai/providers/anthropic`.

- [ ] **Step 3: Write implementation** — `src/ai/providers/anthropic.ts`
```ts
import type { AiProvider, AiFillRequest, AiFillResponse, VerifyResult } from '@/ai/types';
import { buildSystemPrompt, buildUserMessage } from '@/ai/prompt-builder';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * CORS LIMITATION:
 * Anthropic's API does not include CORS headers for direct browser requests.
 * In a browser SPA, fetch() to api.anthropic.com will be blocked by the browser's
 * same-origin policy. This provider handles the resulting TypeError gracefully and
 * provides a clear error message guiding the user to use OpenAI or set up a CORS proxy.
 */
export class AnthropicProvider implements AiProvider {
  name = 'Anthropic';

  async fillFields(request: AiFillRequest): Promise<AiFillResponse> {
    const { apiKey, intent, taskType, currentFields, allOptionalFields, allowAddFields } = request;

    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage({
      intent,
      taskType,
      currentFields,
      allOptionalFields,
      allowAddFields,
    });

    let response: Response;
    try {
      response = await fetch(ANTHROPIC_MESSAGES_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userMessage },
          ],
        }),
      });
    } catch {
      throw new Error(
        'CORS error: Anthropic API does not support direct browser calls. ' +
        'Please use OpenAI as your AI provider, or configure a CORS proxy in your environment.'
      );
    }

    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Anthropic API key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limited. Please wait a moment and try again.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `Anthropic request failed (${response.status})`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((block: { type: string }) => block.type === 'text');

    if (!textBlock?.text) {
      throw new Error('Empty response from Anthropic.');
    }

    const parsed = JSON.parse(textBlock.text) as AiFillResponse;

    return {
      filledFields: parsed.filledFields ?? {},
      addedFieldKeys: parsed.addedFields ?? parsed.addedFieldKeys ?? [],
    };
  }

  async verifyKey(apiKey: string): Promise<VerifyResult> {
    try {
      const response = await fetch(ANTHROPIC_MESSAGES_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 16,
          messages: [
            { role: 'user', content: 'Reply with "ok".' },
          ],
        }),
      });

      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key. Please check and try again.' };
      }

      if (!response.ok) {
        return { valid: false, error: `Verification failed (${response.status}).` };
      }

      return { valid: true, model: 'Claude Sonnet' };
    } catch {
      return {
        valid: false,
        error:
          'CORS error: Anthropic API does not support direct browser calls. ' +
          'Use OpenAI or configure a CORS proxy.',
      };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npx vitest run tests/ai/providers/anthropic.test.ts
```
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/ai/providers/anthropic.ts tests/ai/providers/anthropic.test.ts
git commit -m "feat(ai): implement Anthropic provider with CORS-aware error handling"
```

---

### Task 5: AI Connector Orchestrator

**Files:**
- Create: `src/ai/connector.ts`
- Test: `tests/ai/connector.test.ts`

- [ ] **Step 1: Write the failing test** — `tests/ai/connector.test.ts`
```ts
import { describe, it, expect, vi } from 'vitest';
import { aiFill, createProvider } from '@/ai/connector';
import type { AiProvider, AiFillRequest, AiFillResponse } from '@/ai/types';
import type { FieldDefinition } from '@/registry/types';

function createMockProvider(response: AiFillResponse): AiProvider {
  return {
    name: 'MockProvider',
    fillFields: vi.fn().mockResolvedValue(response),
    verifyKey: vi.fn().mockResolvedValue({ valid: true, model: 'Mock' }),
  };
}

const currentFields: FieldDefinition[] = [
  { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
  { key: 'question_type', inputType: 'select', scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
  { key: 'audience', inputType: 'text', scope: 'task', visibility: 'default' },
];

const allOptionalFields: FieldDefinition[] = [
  { key: 'knowledge_level', inputType: 'combo', scope: 'task', visibility: 'optional', options: ['beginner', 'intermediate', 'expert'] },
  { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
];

const baseRequest: Omit<AiFillRequest, 'apiKey'> = {
  intent: 'How do closures work in JavaScript?',
  taskType: 'ask',
  currentFields,
  allOptionalFields,
  allowAddFields: false,
};

describe('AI Connector', () => {
  describe('aiFill', () => {
    it('calls provider and returns cleaned response', async () => {
      const provider = createMockProvider({
        filledFields: { context: 'JavaScript fundamentals', question_type: 'conceptual' },
      });

      const result = await aiFill(provider, { ...baseRequest, apiKey: 'key' });

      expect(provider.fillFields).toHaveBeenCalledOnce();
      expect(result.filledFields).toEqual({
        context: 'JavaScript fundamentals',
        question_type: 'conceptual',
      });
    });

    it('strips out fields not in currentFields when allowAddFields is false', async () => {
      const provider = createMockProvider({
        filledFields: {
          context: 'JS fundamentals',
          question_type: 'conceptual',
          unknown_field: 'should be removed',
        },
      });

      const result = await aiFill(provider, { ...baseRequest, apiKey: 'key' });

      expect(result.filledFields).not.toHaveProperty('unknown_field');
      expect(result.filledFields).toHaveProperty('context');
      expect(result.filledFields).toHaveProperty('question_type');
    });

    it('allows optional field keys in addedFieldKeys when allowAddFields is true', async () => {
      const provider = createMockProvider({
        filledFields: {
          context: 'JS fundamentals',
          knowledge_level: 'beginner',
        },
        addedFieldKeys: ['knowledge_level'],
      });

      const result = await aiFill(provider, {
        ...baseRequest,
        allowAddFields: true,
        apiKey: 'key',
      });

      expect(result.filledFields).toHaveProperty('knowledge_level');
      expect(result.addedFieldKeys).toEqual(['knowledge_level']);
    });

    it('strips invalid addedFieldKeys that are not in allOptionalFields', async () => {
      const provider = createMockProvider({
        filledFields: { context: 'test', fake_field: 'nope' },
        addedFieldKeys: ['fake_field'],
      });

      const result = await aiFill(provider, {
        ...baseRequest,
        allowAddFields: true,
        apiKey: 'key',
      });

      expect(result.addedFieldKeys).toEqual([]);
      expect(result.filledFields).not.toHaveProperty('fake_field');
    });

    it('strips the intent field from filled results (user provides intent)', async () => {
      const provider = createMockProvider({
        filledFields: { intent: 'AI should not override this', context: 'Valid fill' },
      });

      const result = await aiFill(provider, { ...baseRequest, apiKey: 'key' });

      expect(result.filledFields).not.toHaveProperty('intent');
      expect(result.filledFields).toHaveProperty('context');
    });
  });

  describe('createProvider', () => {
    it('creates OpenAI provider', () => {
      const provider = createProvider('openai');
      expect(provider.name).toBe('OpenAI');
    });

    it('creates Anthropic provider', () => {
      const provider = createProvider('anthropic');
      expect(provider.name).toBe('Anthropic');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run tests/ai/connector.test.ts
```
Expected: FAIL — cannot resolve `@/ai/connector`.

- [ ] **Step 3: Write implementation** — `src/ai/connector.ts`
```ts
import type { AiProvider, AiFillRequest, AiFillResponse, AiProviderName } from '@/ai/types';
import { OpenAIProvider } from '@/ai/providers/openai';
import { AnthropicProvider } from '@/ai/providers/anthropic';

/**
 * Create a provider instance by name.
 */
export function createProvider(name: AiProviderName): AiProvider {
  switch (name) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    default:
      throw new Error(`Unknown AI provider: ${name}`);
  }
}

/**
 * AI Fill orchestrator.
 *
 * 1. Calls provider.fillFields() with the request.
 * 2. Validates the response: strips unknown field keys.
 * 3. If allowAddFields, filters addedFieldKeys to only valid optional fields.
 * 4. Always strips the "intent" field from results.
 */
export async function aiFill(
  provider: AiProvider,
  request: AiFillRequest,
): Promise<AiFillResponse> {
  const rawResponse = await provider.fillFields(request);

  const validCurrentKeys = new Set(request.currentFields.map((f) => f.key));
  const validOptionalKeys = new Set(request.allOptionalFields.map((f) => f.key));

  // Build the set of all valid field keys for the response
  const validKeys = new Set(validCurrentKeys);
  if (request.allowAddFields) {
    for (const key of validOptionalKeys) {
      validKeys.add(key);
    }
  }

  // Always remove "intent" — it's provided by the user, not the AI
  validKeys.delete('intent');

  // Filter filledFields to only valid keys
  const filledFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawResponse.filledFields ?? {})) {
    if (validKeys.has(key)) {
      filledFields[key] = value;
    }
  }

  // Filter addedFieldKeys to only valid optional fields
  let addedFieldKeys: string[] = [];
  if (request.allowAddFields && rawResponse.addedFieldKeys) {
    addedFieldKeys = rawResponse.addedFieldKeys.filter((key) => validOptionalKeys.has(key));
  }

  return { filledFields, addedFieldKeys };
}
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npx vitest run tests/ai/connector.test.ts
```
Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/ai/connector.ts tests/ai/connector.test.ts
git commit -m "feat(ai): implement connector orchestrator with response validation"
```

---

### Task 6: useAiFill Hook

**Files:**
- Create: `src/hooks/useAiFill.ts`

- [ ] **Step 1: Create `src/hooks/useAiFill.ts`**
```ts
import { useState, useCallback, useRef } from 'react';
import type { TaskType, FieldDefinition } from '@/registry/types';
import type { AiFillResponse, AiProviderName } from '@/ai/types';
import { createProvider, aiFill } from '@/ai/connector';

export type AiFillStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAiFillParams {
  taskType: TaskType | null;
  intent: string;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
  providerName: AiProviderName | null;
  getApiKey: () => Promise<string | null>;
}

interface UseAiFillReturn {
  status: AiFillStatus;
  filledCount: number;
  errorMessage: string;
  triggerFill: () => Promise<AiFillResponse | null>;
  reset: () => void;
  isDisabled: boolean;
}

export function useAiFill(params: UseAiFillParams): UseAiFillReturn {
  const { taskType, intent, currentFields, allOptionalFields, allowAddFields, providerName, getApiKey } = params;

  const [status, setStatus] = useState<AiFillStatus>('idle');
  const [filledCount, setFilledCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDisabled = !taskType || intent.trim() === '' || !providerName;

  const reset = useCallback(() => {
    setStatus('idle');
    setFilledCount(0);
    setErrorMessage('');
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  const triggerFill = useCallback(async (): Promise<AiFillResponse | null> => {
    if (!taskType || !providerName) return null;

    const apiKey = await getApiKey();
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('No API key configured. Open Settings to add your API key.');
      return null;
    }

    // Clear any previous success timer
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }

    setStatus('loading');
    setErrorMessage('');
    setFilledCount(0);

    try {
      const provider = createProvider(providerName);
      const response = await aiFill(provider, {
        intent,
        taskType,
        currentFields,
        allOptionalFields,
        allowAddFields,
        apiKey,
      });

      const count = Object.keys(response.filledFields).length;
      setFilledCount(count);
      setStatus('success');

      // Auto-reset success message after 3 seconds
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
        successTimerRef.current = null;
      }, 3000);

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setStatus('error');
      return null;
    }
  }, [taskType, providerName, getApiKey, intent, currentFields, allOptionalFields, allowAddFields]);

  return { status, filledCount, errorMessage, triggerFill, reset, isDisabled };
}
```

- [ ] **Step 2: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useAiFill.ts
git commit -m "feat(ai): add useAiFill hook for orchestrating AI fill flow"
```

---

### Task 7: AiFillButton Component

**Files:**
- Create: `src/components/editor/AiFillButton.tsx`

- [ ] **Step 1: Create `src/components/editor/AiFillButton.tsx`**
```tsx
import type { AiFillStatus } from '@/hooks/useAiFill';

interface AiFillButtonProps {
  status: AiFillStatus;
  disabled: boolean;
  hasApiKey: boolean;
  filledCount: number;
  errorMessage: string;
  onFill: () => void;
  onDismissError: () => void;
  onOpenSettings?: () => void;
}

export function AiFillButton({
  status,
  disabled,
  hasApiKey,
  filledCount,
  errorMessage,
  onFill,
  onDismissError,
  onOpenSettings,
}: AiFillButtonProps) {
  const isLoading = status === 'loading';
  const isIdle = status === 'idle' || status === 'success' || status === 'error';

  // No API key: show lock icon button that opens settings
  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold bg-ink-primary text-accent-primary opacity-40 cursor-pointer"
          title="Configure AI provider in Settings"
        >
          🔒 AI Fill
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      {/* Button */}
      <button
        type="button"
        onClick={onFill}
        disabled={disabled || isLoading}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
          isLoading
            ? 'bg-accent-primary text-ink-primary cursor-wait'
            : disabled
              ? 'bg-ink-primary text-accent-primary opacity-40 cursor-not-allowed'
              : 'bg-ink-primary text-accent-primary hover:opacity-90 cursor-pointer'
        }`}
      >
        {isLoading ? '⟳ Filling...' : '✨ AI Fill'}
      </button>

      {/* Loading progress bar */}
      {isLoading && (
        <div className="w-full h-[3px] mt-1.5 rounded-full overflow-hidden bg-border-default">
          <div className="h-full bg-accent-primary animate-ai-fill-progress" />
        </div>
      )}

      {/* Success message */}
      {status === 'success' && filledCount > 0 && (
        <p className="mt-1.5 text-xs text-status-success font-medium animate-fade-in">
          ✓ Filled {filledCount} field{filledCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <p className="text-xs text-status-danger font-medium">
            ✗ Fill failed: {errorMessage}
          </p>
          <button
            type="button"
            onClick={onDismissError}
            className="text-xs text-status-danger hover:text-ink-primary font-bold shrink-0"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add CSS animation keyframes**

Add the following to `src/index.css` AFTER the `@theme` block (Tailwind v4 — keyframes and utility classes go outside `@theme`):

```css
/* Add after the @theme block in src/index.css */

@keyframes ai-fill-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-ai-fill-progress {
  width: 40%;
  animation: ai-fill-progress 1.2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.2s ease-in;
}
```

- [ ] **Step 3: Verify visually** — `npm run dev`

Temporarily render the AiFillButton in the IntentField area with hardcoded props to confirm:
- Idle state: dark background, golden text, "AI Fill" label
- Disabled state: 40% opacity, cursor-not-allowed
- Loading state (set status='loading'): golden background, animated progress bar beneath
- The progress bar stripe animates left-to-right

Remove the temporary rendering after verification.

- [ ] **Step 4: Commit**
```bash
git add src/components/editor/AiFillButton.tsx src/index.css
git commit -m "feat(ai): add AiFillButton component with idle/disabled/loading/success/error states"
```

---

### Task 8: Wire AiFillButton into IntentField

**Files:**
- Modify: `src/components/editor/IntentField.tsx`

This task adds the AiFillButton to IntentField's label row (right-aligned) and the "Allow AI to add fields" checkbox below the intent input.

- [ ] **Step 1: Update IntentField to accept AI props**

Add the following props to IntentField:

```tsx
// Add these props to the IntentField component's props interface:
interface IntentFieldProps {
  value: string;
  onChange: (value: string) => void;
  // --- AI props (new) ---
  aiFillStatus: AiFillStatus;
  aiFillDisabled: boolean;
  hasApiKey: boolean;
  filledCount: number;
  errorMessage: string;
  onAiFill: () => void;
  onDismissError: () => void;
  onOpenSettings?: () => void;
  allowAddFields: boolean;
  onAllowAddFieldsChange: (checked: boolean) => void;
}
```

- [ ] **Step 2: Add AiFillButton to the label row**

Update IntentField's label row to use flexbox with `justify-between`. The field name + help icon go on the left; AiFillButton goes on the right.

```tsx
import { AiFillButton } from '@/components/editor/AiFillButton';
import type { AiFillStatus } from '@/hooks/useAiFill';

// Inside the component JSX, replace the label row:
<div className="flex items-start justify-between gap-4">
  {/* Left: field label */}
  <div className="flex items-center gap-1">
    {/* Existing FIELD_NAME + [?] + operation hint */}
    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
      {/* field name, localized */}
    </span>
    {/* [?] icon and hint — keep existing */}
  </div>

  {/* Right: AI Fill button */}
  <AiFillButton
    status={aiFillStatus}
    disabled={aiFillDisabled}
    hasApiKey={hasApiKey}
    filledCount={filledCount}
    errorMessage={errorMessage}
    onFill={onAiFill}
    onDismissError={onDismissError}
    onOpenSettings={onOpenSettings}
  />
</div>
```

- [ ] **Step 3: Add "Allow AI to add fields" checkbox below the intent input**

Add the checkbox immediately after the intent textarea, before the next field. It should be hidden when `hasApiKey` is false.

```tsx
{/* Below the intent textarea */}
{hasApiKey && (
  <label className="flex items-center gap-2 mt-2 text-sm text-ink-secondary cursor-pointer">
    <input
      type="checkbox"
      checked={allowAddFields}
      onChange={(e) => onAllowAddFieldsChange(e.target.checked)}
      className="w-4 h-4 rounded border-border-default text-accent-primary focus:ring-accent-primary"
    />
    <span>{/* "Allow AI to add fields" — localized via i18n */}</span>
    {/* [?] help icon */}
    <button
      type="button"
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-bg-muted text-ink-muted text-xs"
      title="When checked, AI can discover and add relevant optional fields beyond what's currently in the editor."
    >
      ?
    </button>
  </label>
)}
```

- [ ] **Step 4: Verify visually** — `npm run dev`

Confirm:
- AiFillButton renders in the IntentField label row, right-aligned
- "Allow AI to add fields" checkbox appears below the intent input when API key is configured
- Checkbox is hidden when no API key
- AiFillButton shows lock icon when no API key

- [ ] **Step 5: Commit**
```bash
git add src/components/editor/IntentField.tsx
git commit -m "feat(ai): wire AiFillButton and add-fields checkbox into IntentField"
```

---

### Task 9: AI-Filled Field Tinting in EditorArea and FieldRenderer

**Files:**
- Modify: `src/components/editor/EditorArea.tsx`
- Modify: `src/components/editor/FieldRenderer.tsx`

- [ ] **Step 1: Add aiFilledFields prop to EditorArea**

EditorArea receives a `Set<string>` of AI-filled field keys and passes it down to FieldRenderer.

```tsx
// In EditorArea's props interface, add:
interface EditorAreaProps {
  // ...existing props
  aiFilledFields: Set<string>;
}
```

When rendering fields, pass the tint flag to FieldRenderer:

```tsx
{/* For each field in the editor */}
<FieldRenderer
  key={field.key}
  field={field}
  value={fieldValues[field.key]}
  onChange={(val) => handleFieldChange(field.key, val)}
  isAiFilled={aiFilledFields.has(field.key)}
/>
```

- [ ] **Step 2: Apply bg-accent-light tinting in FieldRenderer**

FieldRenderer accepts `isAiFilled?: boolean` and applies the tint to the field's input container (not the label).

```tsx
// In FieldRenderer's props interface, add:
interface FieldRendererProps {
  // ...existing props
  isAiFilled?: boolean;
}

// Inside the component, wrap the input in a container with conditional tinting:
<div className={`rounded-lg ${isAiFilled ? 'bg-accent-light' : ''}`}>
  {/* Render the input component (TextareaField, TextField, etc.) */}
</div>
```

The `bg-accent-light` class maps to `#fff3cd` per the design token system set up in Phase 1.

- [ ] **Step 3: Verify visually** — `npm run dev`

Temporarily mark a field as AI-filled in React state to confirm:
- The field's input container gets the subtle yellow `#fff3cd` background
- The label area does NOT get tinted
- The tint is visually subtle and does not interfere with text readability

Remove the temporary state after verification.

- [ ] **Step 4: Commit**
```bash
git add src/components/editor/EditorArea.tsx src/components/editor/FieldRenderer.tsx
git commit -m "feat(ai): add bg-accent-light tinting for AI-filled fields"
```

---

### Task 10: Wire AI State in App.tsx

**Files:**
- Modify: `src/App.tsx`

This task adds the AI-related state to App.tsx and wires the useAiFill hook into the component tree.

- [ ] **Step 1: Add AI state variables**

```tsx
import { useState, useCallback } from 'react';
import { useAiFill } from '@/hooks/useAiFill';
import type { AiProviderName } from '@/ai/types';
import type { AiFillResponse } from '@/ai/types';
import { getTemplate } from '@/registry/template-registry';

// Inside App component, add:
const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
const [allowAddFields, setAllowAddFields] = useState(false);

// These should come from Dexie preferences (already set up in Phase 4):
// providerName, getApiKey for the current provider
```

- [ ] **Step 2: Initialize useAiFill hook**

```tsx
// Derive the current fields and optional fields from template registry + active fields
const template = taskType ? getTemplate(taskType) : null;

// currentFields: the intent field is excluded (it's the input, not a fillable field).
// This should be the fields currently displayed in the editor (default + user-added optional).
const currentFieldsForAi = /* derive from active fields, excluding intent */;
const allOptionalFieldsForAi = /* derive from template, fields with visibility: 'optional' not yet in editor */;

const {
  status: aiFillStatus,
  filledCount,
  errorMessage: aiFillError,
  triggerFill,
  reset: resetAiFill,
  isDisabled: aiFillDisabled,
} = useAiFill({
  taskType,
  intent: fieldValues.intent ?? '',
  currentFields: currentFieldsForAi,
  allOptionalFields: allOptionalFieldsForAi,
  allowAddFields,
  providerName,
  getApiKey,
});
```

- [ ] **Step 3: Handle AI fill response**

Create a handler that processes the AiFillResponse and updates field values + active fields:

```tsx
const handleAiFill = useCallback(async () => {
  const response = await triggerFill();
  if (!response) return;

  // Update field values with AI-filled data
  setFieldValues((prev) => {
    const updated = { ...prev };
    for (const [key, value] of Object.entries(response.filledFields)) {
      updated[key] = value;
    }
    return updated;
  });

  // Track which fields were AI-filled
  setAiFilledFields(new Set(Object.keys(response.filledFields)));

  // If AI added optional fields, add them to the active fields list
  if (response.addedFieldKeys && response.addedFieldKeys.length > 0) {
    setActiveFields((prev) => {
      const updated = [...prev];
      for (const key of response.addedFieldKeys!) {
        if (!updated.includes(key)) {
          updated.push(key);
        }
      }
      return updated;
    });
  }
}, [triggerFill]);
```

- [ ] **Step 4: Pass AI props down to IntentField and EditorArea**

```tsx
// In the JSX, pass to IntentField:
<IntentField
  value={fieldValues.intent ?? ''}
  onChange={(v) => handleFieldChange('intent', v)}
  aiFillStatus={aiFillStatus}
  aiFillDisabled={aiFillDisabled}
  hasApiKey={!!apiKey}
  filledCount={filledCount}
  errorMessage={aiFillError}
  onAiFill={handleAiFill}
  onDismissError={resetAiFill}
  onOpenSettings={() => setShowSettings(true)}
  allowAddFields={allowAddFields}
  onAllowAddFieldsChange={setAllowAddFields}
/>

// In the JSX, pass to EditorArea:
<EditorArea
  /* ...existing props */
  aiFilledFields={aiFilledFields}
/>
```

- [ ] **Step 5: Clear AI-filled state on task type change**

When the task type changes, reset the AI-filled field tracking:

```tsx
// In the task type change handler:
const handleTaskTypeChange = useCallback((type: TaskType) => {
  setTaskType(type);
  setAiFilledFields(new Set()); // Clear AI tinting
  setAllowAddFields(false);     // Reset checkbox
  resetAiFill();                 // Reset AI fill status
  // ...existing field reset logic
}, [resetAiFill]);
```

- [ ] **Step 6: Verify types compile**
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 7: Commit**
```bash
git add src/App.tsx
git commit -m "feat(ai): wire AI state and useAiFill hook into App component"
```

---

### Task 11: Real API Key Verification in SettingsModal

**Files:**
- Modify: `src/components/modals/SettingsModal.tsx`

This task replaces the Phase 4 mock verifier with real provider `verifyKey()` calls.

- [ ] **Step 1: Import real provider factory**

```tsx
import { createProvider } from '@/ai/connector';
import type { VerifyResult, AiProviderName } from '@/ai/types';
```

- [ ] **Step 2: Replace mock verification function**

Find the mock verification logic in SettingsModal (Phase 4 implemented a mock that always returns success after a delay) and replace it:

```tsx
// REMOVE the old mock verifier, e.g.:
// async function mockVerifyKey(key: string): Promise<...> { ... }

// REPLACE with:
const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

const verifyApiKey = useCallback(async (key: string, provider: AiProviderName) => {
  if (!key.trim()) {
    setVerifyStatus('idle');
    setVerifyResult(null);
    return;
  }

  setVerifyStatus('verifying');
  setVerifyResult(null);

  try {
    const aiProvider = createProvider(provider);
    const result = await aiProvider.verifyKey(key);

    setVerifyResult(result);
    setVerifyStatus(result.valid ? 'success' : 'error');
  } catch {
    setVerifyResult({ valid: false, error: 'Verification failed unexpectedly.' });
    setVerifyStatus('error');
  }
}, []);
```

- [ ] **Step 3: Wire verification to API key input blur/Enter**

```tsx
// On the API key input:
<input
  type={showKey ? 'text' : 'password'}
  value={apiKeyInput}
  onChange={(e) => setApiKeyInput(e.target.value)}
  onBlur={() => verifyApiKey(apiKeyInput, selectedProvider)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      verifyApiKey(apiKeyInput, selectedProvider);
    }
  }}
  placeholder="Enter your API key..."
  className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-bg-surface ${
    verifyStatus === 'error' ? 'border-status-danger' : 'border-border-default'
  }`}
/>
```

- [ ] **Step 4: Update verification status display**

```tsx
{/* Verification status */}
{verifyStatus === 'verifying' && (
  <p className="mt-2 text-xs text-ink-muted">Verifying key...</p>
)}
{verifyStatus === 'success' && verifyResult?.valid && (
  <p className="mt-2 text-xs text-status-success font-medium">
    ✓ Key verified — {selectedProvider === 'openai' ? 'OpenAI' : 'Anthropic'} {verifyResult.model}
  </p>
)}
{verifyStatus === 'error' && verifyResult && (
  <p className="mt-2 text-xs text-status-danger font-medium">
    ✗ {verifyResult.error}
  </p>
)}
```

- [ ] **Step 5: Re-verify when provider changes**

When the user switches provider, if the new provider already has a stored key, trigger verification:

```tsx
// In the provider switch handler:
const handleProviderChange = useCallback((provider: AiProviderName) => {
  setSelectedProvider(provider);
  setVerifyStatus('idle');
  setVerifyResult(null);

  // Load stored key for this provider
  const storedKey = /* get from Dexie: `apiKey_${provider}` */;
  setApiKeyInput(storedKey ?? '');

  // Auto-verify if key exists
  if (storedKey) {
    verifyApiKey(storedKey, provider);
  }
}, [verifyApiKey]);
```

- [ ] **Step 6: Verify visually** — `npm run dev`

Open Settings modal and confirm:
- Entering a valid-looking key and pressing Enter or tabbing out triggers a real verification request
- Success: green "Key verified" message with model name
- Failure (invalid key): red border on input + red error message
- Switching providers loads that provider's stored key and re-verifies
- For Anthropic: expect a CORS error message (this is correct behavior — the Anthropic provider's verifyKey will fail with a CORS-specific error in the browser)

- [ ] **Step 7: Commit**
```bash
git add src/components/modals/SettingsModal.tsx
git commit -m "feat(ai): replace mock API key verifier with real provider verification"
```

---

### Task 12: End-to-End AI Fill — Manual Integration Test (OpenAI)

This is a manual verification task. No code files to create.

- [ ] **Step 1: Configure OpenAI in Settings**
1. Open `npm run dev`
2. Open Settings modal
3. Select OpenAI provider
4. Enter a real OpenAI API key (or use a test key)
5. Verify the key is accepted (green status)

- [ ] **Step 2: Test AI Fill with "Ask" task type**
1. Select "Ask" task type
2. Type in the Intent field: "How do React hooks compare to class component lifecycle methods?"
3. Confirm the AI Fill button is in idle state (dark bg, golden text, "AI Fill")
4. Click "AI Fill"
5. Confirm:
   - Button transitions to loading state ("Filling..." with progress bar)
   - After response arrives, fields populate with AI-generated values
   - AI-filled fields show yellow `bg-accent-light` tint
   - Success message "Filled N fields" appears below intent, fades after 3 seconds
   - Preview panel updates in real-time as fields are filled

- [ ] **Step 3: Test "Allow AI to add fields"**
1. Clear the editor (switch task type and switch back, or reload)
2. Check the "Allow AI to add fields" checkbox
3. Type an intent and click AI Fill
4. Confirm: AI may add optional fields that were not in the editor (they appear with yellow tint)

- [ ] **Step 4: Test error states**
1. Enter an invalid API key in Settings
2. Attempt AI Fill — should show "Invalid API key" error
3. Disconnect network (airplane mode) — should show "Network error"
4. Error message persists until dismissed (click X) or next attempt

- [ ] **Step 5: Test disabled states**
1. No task type selected → button disabled (40% opacity)
2. Task type selected but Intent empty → button disabled
3. No API key configured → lock icon, clicking opens Settings

---

### Task 13: End-to-End AI Fill — Manual Integration Test (Anthropic)

This is a manual verification task to confirm the CORS limitation is handled gracefully.

- [ ] **Step 1: Configure Anthropic in Settings**
1. Open Settings modal
2. Switch to Anthropic provider
3. Enter an Anthropic API key
4. **Expected**: Key verification fails with CORS error message: "CORS error: Anthropic API does not support direct browser calls. Use OpenAI or configure a CORS proxy."

- [ ] **Step 2: Attempt AI Fill with Anthropic**
1. Select a task type and enter an intent
2. Click AI Fill
3. **Expected**: Error message shows the CORS limitation. The message is actionable — it tells the user to use OpenAI or set up a CORS proxy.

- [ ] **Step 3: Verify provider switching preserves keys**
1. Switch back to OpenAI — the OpenAI key should still be there
2. Switch to Anthropic — the Anthropic key should still be there
3. Keys are stored independently per provider in Dexie

---

### Task 14: AI Fill with All 6 Task Types — Smoke Test

Manual verification that AI fill works correctly across all task types, not just Ask.

- [ ] **Step 1: Test with Create**
1. Select "Create", enter intent: "Write a Python script to parse CSV files and generate a summary report"
2. Click AI Fill
3. Confirm: content_type, key_points, tone are filled appropriately

- [ ] **Step 2: Test with Transform**
1. Select "Transform", enter intent: "Translate this technical documentation from English to Chinese while preserving code examples"
2. Click AI Fill
3. Confirm: transform_type is filled (should select "translate"), source_content may remain empty (user needs to provide it)

- [ ] **Step 3: Test with Analyze**
1. Select "Analyze", enter intent: "Compare React vs Vue.js for a medium-sized e-commerce project"
2. Click AI Fill
3. Confirm: analyze_type is filled (should select "compare"), subject and criteria are filled

- [ ] **Step 4: Test with Ideate**
1. Select "Ideate", enter intent: "Design a notification system that reduces user alert fatigue"
2. Click AI Fill
3. Confirm: problem, current_state, goal are filled

- [ ] **Step 5: Test with Execute**
1. Select "Execute", enter intent: "Deploy this Node.js application to AWS with auto-scaling and monitoring"
2. Click AI Fill
3. Confirm: plan, goal are filled

---

### Task 15: i18n for AI Components

**Files:**
- Modify: `src/components/editor/AiFillButton.tsx`
- Modify: `src/components/editor/IntentField.tsx`

This task ensures all AI-related UI text follows the i18n system established in Phase 3.

- [ ] **Step 1: Add i18n keys for AI components**

Add the following translation keys to the i18n resource files (the exact file depends on Phase 3 structure, typically `src/i18n/en.json` and `src/i18n/zh.json` or a similar structure):

```json
// English
{
  "ai": {
    "fillButton": "AI Fill",
    "fillButtonLoading": "Filling...",
    "fillButtonLock": "AI Fill",
    "filledCount": "Filled {{count}} field",
    "filledCount_plural": "Filled {{count}} fields",
    "fillFailed": "Fill failed:",
    "allowAddFields": "Allow AI to add fields",
    "allowAddFieldsHelp": "When checked, AI can discover and add relevant optional fields beyond what's currently in the editor.",
    "noApiKey": "No API key configured. Open Settings to add your API key.",
    "configureProvider": "Configure AI provider in Settings"
  }
}

// Chinese
{
  "ai": {
    "fillButton": "AI 填充",
    "fillButtonLoading": "填充中...",
    "fillButtonLock": "AI 填充",
    "filledCount": "已填充 {{count}} 个字段",
    "fillFailed": "填充失败：",
    "allowAddFields": "允许 AI 添加字段",
    "allowAddFieldsHelp": "勾选后，AI 可以发现并添加编辑器中尚未显示的相关可选字段。",
    "noApiKey": "未配置 API 密钥。请在设置中添加。",
    "configureProvider": "在设置中配置 AI 提供者"
  }
}
```

- [ ] **Step 2: Update AiFillButton to use translations**

```tsx
import { useTranslation } from 'react-i18next';

// Inside the component:
const { t } = useTranslation();

// Replace hardcoded strings:
// "✨ AI Fill"     → `✨ ${t('ai.fillButton')}`
// "⟳ Filling..."  → `⟳ ${t('ai.fillButtonLoading')}`
// "🔒 AI Fill"    → `🔒 ${t('ai.fillButtonLock')}`
// "Filled N fields" → t('ai.filledCount', { count: filledCount })
// "Fill failed:"  → t('ai.fillFailed')
```

- [ ] **Step 3: Update IntentField checkbox to use translations**

```tsx
// The checkbox label:
<span>{t('ai.allowAddFields')}</span>

// The help icon title:
title={t('ai.allowAddFieldsHelp')}
```

- [ ] **Step 4: Verify visually** — `npm run dev`

Toggle the UI language between EN and 中文:
- AiFillButton text switches language
- "Allow AI to add fields" checkbox label switches
- Success/error messages switch

- [ ] **Step 5: Commit**
```bash
git add src/components/editor/AiFillButton.tsx src/components/editor/IntentField.tsx src/i18n/
git commit -m "feat(ai): add i18n translations for all AI-related UI text"
```

---

### Task 16: Edge Case — AI Returns Invalid JSON

**Files:**
- Modify: `src/ai/providers/openai.ts`
- Modify: `src/ai/providers/anthropic.ts`
- Modify: `tests/ai/providers/openai.test.ts`

- [ ] **Step 1: Add test for malformed JSON in OpenAI provider**

```ts
// Add to tests/ai/providers/openai.test.ts, in the fillFields describe block:
it('throws descriptive error when AI returns invalid JSON', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify({
      choices: [{
        message: {
          content: 'Here are the fields: { invalid json',
        },
      }],
    }), { status: 200 })
  );

  await expect(provider.fillFields(mockRequest)).rejects.toThrow('parse');
});

it('handles response with no choices', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify({ choices: [] }), { status: 200 })
  );

  await expect(provider.fillFields(mockRequest)).rejects.toThrow('Empty response');
});
```

- [ ] **Step 2: Add JSON parse error handling to both providers**

In `src/ai/providers/openai.ts`, wrap the `JSON.parse(content)` call:

```ts
let parsed: AiFillResponse;
try {
  parsed = JSON.parse(content) as AiFillResponse;
} catch {
  throw new Error('Failed to parse AI response. The AI returned invalid JSON. Please try again.');
}
```

Apply the same pattern in `src/ai/providers/anthropic.ts` for its `JSON.parse(textBlock.text)` call.

- [ ] **Step 3: Run all AI tests**
```bash
npx vitest run tests/ai/
```
Expected: All tests pass.

- [ ] **Step 4: Commit**
```bash
git add src/ai/providers/openai.ts src/ai/providers/anthropic.ts tests/ai/providers/openai.test.ts
git commit -m "fix(ai): add graceful handling for malformed AI JSON responses"
```

---

### Task 17: Edge Case — AI Fill While Fields Have Existing Values

**Files:**
- Modify: `src/App.tsx` (the handleAiFill callback)

- [ ] **Step 1: Ensure AI fill overwrites existing field values**

When AI fills a field that already has user-entered content, the AI value should overwrite it. The user was warned about this by clicking the button.

Verify the existing `handleAiFill` implementation in Task 10 already handles this correctly — the `setFieldValues` spread operator should overwrite:

```tsx
// In handleAiFill:
setFieldValues((prev) => {
  const updated = { ...prev };
  for (const [key, value] of Object.entries(response.filledFields)) {
    updated[key] = value;
  }
  return updated;
});
```

This correctly overwrites any existing values. No code change needed if already correct.

- [ ] **Step 2: Verify that AI-filled tinting only tracks the LATEST fill**

The `setAiFilledFields(new Set(Object.keys(response.filledFields)))` call replaces the entire set with only the fields from the latest AI fill. This is correct — previous fills are no longer tinted. Verify this is the existing behavior.

- [ ] **Step 3: Manual test**
1. Select Ask, fill some fields manually (context, audience)
2. Type an intent and click AI Fill
3. Confirm: AI overwrites the manually-filled fields. Only the AI-filled fields from this request show the yellow tint. Previously-manual fields that were overwritten now have the tint.

- [ ] **Step 4: Commit** (if any changes were needed)
```bash
git add src/App.tsx
git commit -m "fix(ai): ensure AI fill correctly overwrites existing field values"
```

---

### Task 18: Run Full Test Suite and Fix Regressions

- [ ] **Step 1: Run all tests**
```bash
npx vitest run
```

- [ ] **Step 2: Run TypeScript type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 3: Fix any test failures or type errors**

Address issues one by one. Common issues to watch for:
- IntentField now requires new props — update any existing tests or parent components that render IntentField
- EditorArea now requires `aiFilledFields` prop — update any existing tests
- FieldRenderer now accepts `isAiFilled` — this is optional so should not break existing tests

- [ ] **Step 4: Run tests again to confirm all green**
```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 5: Commit** (if fixes were needed)
```bash
git add -u
git commit -m "fix: resolve Phase 5 regressions in existing tests"
```

---

### Task 19: Final Visual Verification

Complete visual walkthrough of all Phase 5 features.

- [ ] **Step 1: Start dev server**
```bash
npm run dev
```

- [ ] **Step 2: Verify the complete AI fill flow**
1. Open Settings, configure OpenAI with a valid key, verify it succeeds
2. Close Settings
3. Select "Ask" task type
4. Confirm "Allow AI to add fields" checkbox is visible
5. Type intent: "Explain the difference between REST and GraphQL APIs"
6. Click "AI Fill"
7. Confirm: loading state → fields populate → success message → yellow tinting
8. Edit an AI-filled field — confirm editing works normally, tint persists
9. Switch to a different task type — confirm tinting clears, checkbox resets
10. Switch to Anthropic provider — confirm CORS error is shown clearly

- [ ] **Step 3: Verify disabled states**
1. No task type → AI Fill button disabled
2. Task type but empty intent → button disabled
3. Remove API key from Settings → lock icon on button, checkbox hidden

- [ ] **Step 4: Verify i18n**
1. Switch UI to Chinese
2. Confirm all AI-related text is in Chinese (button, checkbox, messages)
3. Switch back to English

- [ ] **Step 5: Verify preview updates**
1. After AI fill, confirm the preview panel shows the compiled output with AI-filled values
2. Switch output format (MD → JSON → YAML → XML) — all show AI-filled values
3. Copy to clipboard — confirm history record includes AI-filled data

---

### Task 20: Update Changelog

**Files:**
- Modify: `.claude/changelog.md`

- [ ] **Step 1: Add Phase 5 changelog entry**

```markdown
## [2026-04-07] - Phase 5: AI-Enhanced Mode
- Created `src/ai/types.ts` — AiProvider interface, AiFillRequest/Response/VerifyResult types
- Created `src/ai/prompt-builder.ts` — System prompt and user message construction for AI field filling
- Created `src/ai/providers/openai.ts` — OpenAI provider using fetch() to chat completions API (GPT-4o)
- Created `src/ai/providers/anthropic.ts` — Anthropic provider using fetch() to messages API (Claude Sonnet), with CORS limitation handling
- Created `src/ai/connector.ts` — AI connector orchestrator: provider factory, prompt building, response validation
- Created `src/components/editor/AiFillButton.tsx` — Four-state button (idle/disabled/loading/result) with animated progress bar
- Created `src/hooks/useAiFill.ts` — Hook orchestrating AI fill flow: prerequisite validation, provider call, status management
- Modified `src/components/editor/IntentField.tsx` — Added AiFillButton in label row + "Allow AI to add fields" checkbox
- Modified `src/components/editor/EditorArea.tsx` — Pass AI-filled state for bg-accent-light tinting
- Modified `src/components/editor/FieldRenderer.tsx` — Apply yellow tint to AI-filled field containers
- Modified `src/components/modals/SettingsModal.tsx` — Replaced Phase 4 mock verifier with real provider.verifyKey() calls
- Modified `src/App.tsx` — Added AI state management, wired useAiFill hook, field value updates from AI responses
- Created tests: `tests/ai/prompt-builder.test.ts`, `tests/ai/providers/openai.test.ts`, `tests/ai/providers/anthropic.test.ts`, `tests/ai/connector.test.ts`
- Added i18n translations for all AI UI text (English + Chinese)
```

- [ ] **Step 2: Commit**
```bash
git add .claude/changelog.md
git commit -m "docs: update changelog with Phase 5 AI-Enhanced Mode changes"
```
