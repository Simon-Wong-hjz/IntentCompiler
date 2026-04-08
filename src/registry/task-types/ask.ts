import type { FieldDefinition } from '@/registry/types';

export const askFields: FieldDefinition[] = [
  // --- Universal Default fields ---
  { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
  { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
  { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
  { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
  { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
  // --- Task Default fields ---
  { key: 'question_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['factual', 'conceptual', 'how-to', 'opinion'] },
  { key: 'audience', inputType: 'text', scope: 'task', visibility: 'default' },
  // --- Task Optional fields ---
  { key: 'knowledge_level', inputType: 'text', scope: 'task', visibility: 'optional' },
  // --- Universal Optional fields ---
  { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
  { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
  { key: 'assumptions', inputType: 'list', scope: 'universal', visibility: 'optional' },
  { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
  { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
  { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
  { key: 'detail_level', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
  { key: 'tone', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['formal', 'casual', 'technical', 'friendly'] },
  { key: 'thinking_style', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
  { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
  { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
  { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
  { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
];
