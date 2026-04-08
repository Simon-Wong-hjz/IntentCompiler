import type { TaskTemplate } from '../types';

export const createTemplate: TaskTemplate = {
  type: 'create',
  verb: { en: 'Create', zh: '创作' },
  mentalModel: { en: 'I want to make something', zh: '我想做出一样东西' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'content_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['email', 'article', 'doc', 'code', 'script'] },
    { key: 'key_points', inputType: 'list', scope: 'task', visibility: 'default' },
    { key: 'tone', inputType: 'combo', scope: 'task', visibility: 'default', options: ['formal', 'casual', 'technical', 'friendly'] },
    // --- Task Optional fields ---
    { key: 'tech_stack', inputType: 'text', scope: 'task', visibility: 'optional' },
    { key: 'target_length', inputType: 'text', scope: 'task', visibility: 'optional' },
    { key: 'structure', inputType: 'textarea', scope: 'task', visibility: 'optional' },
    { key: 'include_tests', inputType: 'toggle', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'assumptions', inputType: 'list', scope: 'universal', visibility: 'optional' },
    { key: 'scope', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'priority', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'output_language', inputType: 'combo', scope: 'universal', visibility: 'optional', options: ['Chinese', 'English'] },
    { key: 'detail_level', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['summary', 'standard', 'in-depth'] },
    { key: 'thinking_style', inputType: 'select', scope: 'universal', visibility: 'optional', options: ['direct answer', 'step-by-step', 'pros-and-cons'] },
    { key: 'examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'anti_examples', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'references', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'custom_fields', inputType: 'key-value', scope: 'universal', visibility: 'optional' },
  ],
};
