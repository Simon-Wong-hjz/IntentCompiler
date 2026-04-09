import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIProvider } from '@/ai/providers/openai';
import type { AiFillRequest } from '@/ai/types';

const mockRequest: AiFillRequest = {
  intent: 'How do React hooks work?',
  taskType: 'ask',
  currentFields: [
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'question_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
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
