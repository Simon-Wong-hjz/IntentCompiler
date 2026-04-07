import type { FieldDefinition } from '@/registry/types';

export const askFields: FieldDefinition[] = [
  {
    key: 'intent',
    inputType: 'textarea',
    scope: 'universal',
    visibility: 'default',
    required: true,
  },
  {
    key: 'context',
    inputType: 'textarea',
    scope: 'universal',
    visibility: 'default',
  },
  {
    key: 'requirements',
    inputType: 'list',
    scope: 'universal',
    visibility: 'default',
  },
  {
    key: 'constraints',
    inputType: 'list',
    scope: 'universal',
    visibility: 'default',
  },
  {
    key: 'output_format',
    inputType: 'combo',
    scope: 'universal',
    visibility: 'default',
    options: ['paragraph', 'list', 'table', 'code', 'step-by-step'],
  },
  {
    key: 'question_type',
    inputType: 'select',
    scope: 'task',
    visibility: 'default',
    options: ['factual', 'conceptual', 'how-to', 'opinion'],
  },
  {
    key: 'audience',
    inputType: 'text',
    scope: 'task',
    visibility: 'default',
  },
];
