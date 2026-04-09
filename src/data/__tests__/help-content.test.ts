import { describe, it, expect } from 'vitest';
import { helpContentMap } from '../help-content';

// All field keys from the PRD. This is the single source of truth for field coverage.
const ALL_FIELD_KEYS = [
  'intent', 'context', 'requirements', 'constraints', 'output_format',
  'goal', 'role', 'audience', 'assumptions', 'scope', 'priority',
  'output_language', 'detail_level', 'tone', 'thinking_style',
  'examples', 'anti_examples', 'references', 'custom_fields',
  'question_type', 'knowledge_level',
  'content_type', 'key_points', 'tech_stack', 'target_length',
  'structure', 'include_tests',
  'source_content', 'transform_type', 'preserve',
  'subject', 'analyze_type', 'criteria', 'compared_subjects', 'benchmark',
  'problem', 'current_state', 'idea_count', 'evaluation_criteria',
  'plan', 'tools_to_use', 'checkpoints', 'error_handling', 'success_criteria',
];

describe('helpContentMap', () => {
  it('has an entry for every known field', () => {
    const missingKeys = ALL_FIELD_KEYS.filter((key) => !(key in helpContentMap));
    expect(missingKeys).toEqual([]);
  });

  it('every entry has bilingual whatIsThis', () => {
    for (const [key, content] of Object.entries(helpContentMap)) {
      expect(content.whatIsThis.en, `${key}.whatIsThis.en`).toBeTruthy();
      expect(content.whatIsThis.zh, `${key}.whatIsThis.zh`).toBeTruthy();
    }
  });

  it('optional fields (suggestions, example) are bilingual when present', () => {
    for (const [key, content] of Object.entries(helpContentMap)) {
      if (content.suggestions) {
        expect(content.suggestions.en, `${key}.suggestions.en`).toBeTruthy();
        expect(content.suggestions.zh, `${key}.suggestions.zh`).toBeTruthy();
      }
      if (content.example) {
        expect(content.example.en, `${key}.example.en`).toBeTruthy();
        expect(content.example.zh, `${key}.example.zh`).toBeTruthy();
      }
    }
  });

  it('has no extra keys beyond known fields', () => {
    const extraKeys = Object.keys(helpContentMap).filter(
      (key) => !ALL_FIELD_KEYS.includes(key)
    );
    expect(extraKeys).toEqual([]);
  });
});
