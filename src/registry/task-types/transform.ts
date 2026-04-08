import type { TaskTemplate } from '../types';

export const transformTemplate: TaskTemplate = {
  type: 'transform',
  verb: { en: 'Transform', zh: '转化' },
  mentalModel: { en: 'I have content, change its form', zh: '我有内容，换一种形式' },
  fields: [
    // --- Universal Default fields ---
    { key: 'intent', inputType: 'textarea', scope: 'universal', visibility: 'default', required: true },
    { key: 'context', inputType: 'textarea', scope: 'universal', visibility: 'default' },
    { key: 'requirements', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'constraints', inputType: 'list', scope: 'universal', visibility: 'default' },
    { key: 'output_format', inputType: 'combo', scope: 'universal', visibility: 'default', options: ['paragraph', 'list', 'table', 'code', 'step-by-step'] },
    // --- Task Default fields ---
    { key: 'source_content', inputType: 'textarea', scope: 'task', visibility: 'default' },
    { key: 'transform_type', inputType: 'combo', scope: 'task', visibility: 'default', options: ['summarize', 'translate', 'rewrite', 'simplify', 'format convert'] },
    // --- Task Optional fields ---
    { key: 'preserve', inputType: 'list', scope: 'task', visibility: 'optional' },
    { key: 'target_length', inputType: 'text', scope: 'task', visibility: 'optional' },
    // --- Universal Optional fields ---
    { key: 'goal', inputType: 'textarea', scope: 'universal', visibility: 'optional' },
    { key: 'role', inputType: 'text', scope: 'universal', visibility: 'optional' },
    { key: 'audience', inputType: 'text', scope: 'universal', visibility: 'optional' },
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
  ],
};
