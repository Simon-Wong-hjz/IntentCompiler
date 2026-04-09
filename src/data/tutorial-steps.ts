export interface TutorialStep {
  targetSelector: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const tutorialSteps: TutorialStep[] = [
  {
    targetSelector: '[data-tutorial="task-selector"]',
    title: { zh: '选择任务类型', en: 'Choose a task type' },
    description: {
      zh: '这里有 6 种任务类型，选择最符合你意图的一种开始。',
      en: 'Pick one of the 6 task types that best matches your intent.',
    },
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="intent-field"]',
    title: { zh: '填写核心意图', en: 'Write your core intent' },
    description: {
      zh: '用一句话描述你想让 AI 做什么，这是最重要的字段。',
      en: 'Describe in one sentence what you want the AI to do.',
    },
    placement: 'right',
  },
  {
    targetSelector: '[data-tutorial="add-field-panel"]',
    title: { zh: '添加更多项目', en: 'Add more items' },
    description: {
      zh: '点击展开可选项目面板，添加背景、约束等字段来细化你的意图。',
      en: 'Expand to add optional items like context, constraints to refine your intent.',
    },
    placement: 'top',
  },
  {
    targetSelector: '[data-tutorial="preview-area"]',
    title: { zh: '实时预览', en: 'Live preview' },
    description: {
      zh: '右侧会实时显示编译后的提示词，所见即所得。',
      en: 'The right panel shows the compiled prompt in real-time.',
    },
    placement: 'left',
  },
  {
    targetSelector: '[data-tutorial="format-selector"]',
    title: { zh: '切换输出格式', en: 'Switch output format' },
    description: {
      zh: '支持 Markdown、JSON、YAML、XML 四种格式，适配不同使用场景。',
      en: 'Choose from Markdown, JSON, YAML, or XML to fit your use case.',
    },
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="copy-button"]',
    title: { zh: '复制结果', en: 'Copy result' },
    description: {
      zh: '点击复制编译好的提示词到剪贴板，直接粘贴到 AI 对话中使用。',
      en: 'Copy the compiled prompt to your clipboard, ready to paste into an AI chat.',
    },
    placement: 'top',
  },
  {
    targetSelector: '[data-tutorial="history-button"]',
    title: { zh: '历史记录', en: 'History' },
    description: {
      zh: '每次复制后会自动保存记录，可以在这里查看和加载之前的提示词。',
      en: 'Each copy auto-saves a record. View and reload past prompts here.',
    },
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="ai-fill-button"]',
    title: { zh: 'AI 智能填充', en: 'AI Fill' },
    description: {
      zh: '填写意图后，点击让 AI 自动填充其他字段。需要先在设置中配置 API 密钥。',
      en: 'After entering intent, let AI auto-fill other fields. Requires API key in settings.',
    },
    placement: 'top',
  },
  {
    targetSelector: '[data-tutorial="settings-button"]',
    title: { zh: '设置', en: 'Settings' },
    description: {
      zh: '配置默认输出语言、格式，以及 AI API 密钥和模型。',
      en: 'Configure default output language, format, and AI API keys.',
    },
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tutorial="tutorial-button"]',
    title: { zh: '再次查看教程', en: 'Replay tutorial' },
    description: {
      zh: '随时点击这里可以重新查看本教程。祝你使用愉快！',
      en: 'Click here anytime to replay this tutorial. Enjoy!',
    },
    placement: 'bottom',
  },
];
