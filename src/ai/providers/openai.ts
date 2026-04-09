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
