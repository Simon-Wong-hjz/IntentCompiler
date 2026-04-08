export interface VerifyResult {
  success: boolean;
  provider?: string;
  model?: string;
  error?: string;
}

/**
 * Mock API key verifier for Phase 4.
 * Always succeeds after a 1-second delay.
 * Real verification logic replaces this in Phase 5.
 */
export async function verifyApiKey(
  provider: string,
  _apiKey: string
): Promise<VerifyResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Empty key is an immediate failure
  if (!_apiKey || _apiKey.trim() === '') {
    return {
      success: false,
      error: 'API key cannot be empty.',
    };
  }

  // Mock success — in Phase 5 this will make a real API call
  const modelMap: Record<string, string> = {
    openai: 'GPT-4o',
    anthropic: 'Claude Sonnet',
  };

  return {
    success: true,
    provider: provider === 'openai' ? 'OpenAI' : 'Anthropic',
    model: modelMap[provider] ?? 'Unknown',
  };
}
