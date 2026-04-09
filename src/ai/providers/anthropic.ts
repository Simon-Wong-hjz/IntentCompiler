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
