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
  { key: 'question_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
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
