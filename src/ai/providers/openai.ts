import type { AiProvider, AiFillRequest, AiFillResponse, VerifyResult, ModelOption } from '@/ai/types';
import { buildSystemPrompt, buildUserMessage } from '@/ai/prompt-builder';

const DEFAULT_ENDPOINT = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o';

/** Strip trailing slashes from endpoint URL */
function normalizeEndpoint(endpoint?: string): string {
  if (!endpoint) return DEFAULT_ENDPOINT;
  return endpoint.replace(/\/+$/, '');
}

export class OpenAIProvider implements AiProvider {
  name = 'OpenAI';

  async fillFields(request: AiFillRequest, signal?: AbortSignal): Promise<AiFillResponse> {
    const { apiKey, intent, taskType, currentFields, allOptionalFields, allowAddFields } = request;
    const endpoint = normalizeEndpoint(request.endpoint);
    const model = request.model || DEFAULT_MODEL;

    const systemPrompt = buildSystemPrompt(request.language);
    const userMessage = buildUserMessage({
      intent,
      taskType,
      currentFields,
      allOptionalFields,
      allowAddFields,
      language: request.language,
    });

    let response: Response;
    try {
      response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
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

    let parsed: AiFillResponse;
    try {
      parsed = JSON.parse(content) as AiFillResponse;
    } catch {
      throw new Error('Failed to parse AI response. The AI returned invalid JSON. Please try again.');
    }

    // AI may return "addedFields" (prompt instruction) or "addedFieldKeys" (our type)
    const raw = parsed as unknown as Record<string, unknown>;
    const addedFieldKeys = (raw.addedFields ?? raw.addedFieldKeys ?? []) as string[];

    return {
      filledFields: parsed.filledFields ?? {},
      addedFieldKeys,
    };
  }

  async verifyKey(apiKey: string, endpoint?: string): Promise<VerifyResult> {
    const base = normalizeEndpoint(endpoint);
    try {
      const response = await fetch(`${base}/models`, {
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

  async listModels(apiKey: string, endpoint?: string): Promise<ModelOption[]> {
    const base = normalizeEndpoint(endpoint);
    try {
      const response = await fetch(`${base}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data ?? [])
        .filter((m: { id: string }) => /^(gpt-|o[1-9]|chatgpt-)/.test(m.id))
        .map((m: { id: string }) => ({ id: m.id, name: m.id }))
        .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));
    } catch {
      return [];
    }
  }
}
