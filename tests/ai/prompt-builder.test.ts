import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserMessage } from '@/ai/prompt-builder';
import type { FieldDefinition } from '@/registry/types';

const sampleFields: FieldDefinition[] = [
  { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
  { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
  { key: 'question_type', inputType: 'select' as FieldDefinition['inputType'], scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
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
