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
