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
      expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe('true');

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

    it('throws network error on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(provider.fillFields(mockRequest)).rejects.toThrow('Network error');
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

    it('returns network error on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await provider.verifyKey('sk-ant-test-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });
});
