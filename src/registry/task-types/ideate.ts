import type { TaskTemplate } from '../types';

export const ideateTemplate: TaskTemplate = {
  type: 'ideate',
  verb: { en: 'Ideate', zh: '构思' },
  mentalModel: { en: 'Help me think / design', zh: '帮我想办法' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'problem', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'current_state', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'goal', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'assumptions', inputType: 'list', scope: 'task', visibility: 'default' },
    // --- Task Optional fields ---
    { key: 'idea_count', inputType: 'number', scope: 'task', visibility: 'optional' },
    { key: 'evaluation_criteria', inputType: 'list', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
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
  ],
};
