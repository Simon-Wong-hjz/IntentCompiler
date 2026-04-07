import type { TaskTemplate, TaskType } from '@/registry/types';
import { askFields } from '@/registry/task-types/ask';

const templates: TaskTemplate[] = [
  {
    type: 'ask',
    verb: { en: 'Ask', zh: '提问' },
    mentalModel: { en: 'I want to know something', zh: '我想知道一件事' },
    fields: askFields,
  },
  {
    type: 'create',
    verb: { en: 'Create', zh: '创作' },
    mentalModel: { en: 'I want to make something', zh: '我想做出一样东西' },
    fields: [],
  },
  {
    type: 'transform',
    verb: { en: 'Transform', zh: '转化' },
    mentalModel: {
      en: 'I have content, change its form',
      zh: '我有内容，换一种形式',
    },
    fields: [],
  },
  {
    type: 'analyze',
    verb: { en: 'Analyze', zh: '分析' },
    mentalModel: {
      en: 'Help me judge / understand',
      zh: '帮我判断/理解',
    },
    fields: [],
  },
  {
    type: 'ideate',
    verb: { en: 'Ideate', zh: '构思' },
    mentalModel: { en: 'Help me think / design', zh: '帮我想办法' },
    fields: [],
  },
  {
    type: 'execute',
    verb: { en: 'Execute', zh: '执行' },
    mentalModel: {
      en: 'Do a multi-step task for me',
      zh: '帮我做一个多步骤任务',
    },
    fields: [],
  },
];

export function getTemplate(type: TaskType): TaskTemplate | undefined {
  return templates.find((t) => t.type === type);
}

export function getAllTaskTypes(): TaskTemplate[] {
  return templates;
}
