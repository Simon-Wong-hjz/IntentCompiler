import type { AiProvider, AiFillRequest, AiFillResponse, VerifyResult, ModelOption } from '@/ai/types';
import { buildSystemPrompt, buildUserMessage } from '@/ai/prompt-builder';

const DEFAULT_ENDPOINT = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION = '2023-06-01';

/** Strip trailing slashes from endpoint URL */
function normalizeEndpoint(endpoint?: string): string {
  if (!endpoint) return DEFAULT_ENDPOINT;
  return endpoint.replace(/\/+$/, '');
}

/** Common Anthropic headers including the browser CORS opt-in */
function anthropicHeaders(apiKey: string): Record<string, string> {
  return {
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
    'content-type': 'application/json',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

const FALLBACK_MODELS: ModelOption[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
];

export class AnthropicProvider implements AiProvider {
  name = 'Anthropic';

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
      response = await fetch(`${endpoint}/v1/messages`, {
        method: 'POST',
        headers: anthropicHeaders(apiKey),
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userMessage },
          ],
        }),
        signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new Error('Network error: could not reach Anthropic. Check your internet connection.');
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

    let parsed: AiFillResponse;
    try {
      parsed = JSON.parse(textBlock.text) as AiFillResponse;
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
      const response = await fetch(`${base}/v1/messages`, {
        method: 'POST',
        headers: anthropicHeaders(apiKey),
        body: JSON.stringify({
          model: DEFAULT_MODEL,
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
      return { valid: false, error: 'Network error. Check your internet connection.' };
    }
  }

  async listModels(apiKey: string, endpoint?: string): Promise<ModelOption[]> {
    const base = normalizeEndpoint(endpoint);
    try {
      const response = await fetch(`${base}/v1/models`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      });

      if (!response.ok) return FALLBACK_MODELS;

      const data = await response.json();
      return (data.data ?? [])
        .map((m: { id: string; display_name?: string }) => ({
          id: m.id,
          name: m.display_name || m.id,
        }))
        .sort((a: ModelOption, b: ModelOption) => a.name.localeCompare(b.name));
    } catch {
      return FALLBACK_MODELS;
    }
  }
}
