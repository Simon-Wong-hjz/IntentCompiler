import type { TaskTemplate, TaskType } from '@/registry/types';
import { askFields } from '@/registry/task-types/ask';
import { createTemplate } from '@/registry/task-types/create';
import { transformTemplate } from '@/registry/task-types/transform';
import { analyzeTemplate } from '@/registry/task-types/analyze';
import { ideateTemplate } from '@/registry/task-types/ideate';
import { executeTemplate } from '@/registry/task-types/execute';

const templates: TaskTemplate[] = [
  {
    type: 'ask',
    verb: { en: 'Ask', zh: '提问' },
    mentalModel: { en: 'I want to know something', zh: '我想知道一件事' },
    fields: askFields,
  },
  createTemplate,
  transformTemplate,
  analyzeTemplate,
  ideateTemplate,
  executeTemplate,
];

export function getTemplate(type: TaskType): TaskTemplate {
  const template = templates.find((t) => t.type === type);
  if (!template) {
    throw new Error(`Unknown task type: ${type}`);
  }
  return template;
}

export function getAllTaskTypes(): TaskTemplate[] {
  return templates;
}
