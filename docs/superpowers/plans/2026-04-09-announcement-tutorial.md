# Announcement & Tutorial System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a version-driven release notes popup and an interactive spotlight tutorial for first-time onboarding.

**Architecture:** Data-driven approach — announcements are `.md` files with YAML frontmatter parsed at build time; tutorial steps are a static array of target selectors + bilingual text. Both features integrate via Dexie preferences for state persistence, TopBar icon buttons for re-entry, and `useEffect` auto-trigger logic in App.tsx.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 custom tokens, Dexie.js, lucide-react, `marked` (new), `js-yaml` (existing), react-i18next.

---

## File Map

**New files:**
| File | Responsibility |
|------|---------------|
| `src/data/announcements/index.ts` | Glob-load `.md` files, parse frontmatter + bilingual body, export `Announcement[]` |
| `src/data/announcements/v0.6.0.md` | First announcement content (Phase 6 release notes) |
| `src/data/announcements/__tests__/announcements.test.ts` | Unit tests for the parser |
| `src/data/tutorial-steps.ts` | 10-step tutorial config array |
| `src/components/modals/AnnouncementModal.tsx` | Release notes modal (scrollable history) |
| `src/components/tutorial/TutorialOverlay.tsx` | Tutorial orchestrator (step state + positioning) |
| `src/components/tutorial/SpotlightOverlay.tsx` | Full-screen overlay with box-shadow highlight cutout |
| `src/components/tutorial/TutorialTooltip.tsx` | Step tooltip (title, description, nav buttons) |
| `tests/components/AnnouncementModal.test.tsx` | RTL tests for the announcement modal |
| `tests/components/TutorialOverlay.test.tsx` | RTL tests for the tutorial system |

**Modified files:**
| File | Changes |
|------|---------|
| `package.json` | Add `marked` + `@types/marked` |
| `src/storage/preferences.ts` | Add `lastSeenAnnouncementVersion` and `tutorialCompleted` to `PreferenceKey` |
| `src/hooks/useStorage.ts` | Add new fields to `PreferencesState` + `DEFAULT_PREFERENCES` |
| `src/i18n/locales/zh.json` | Add `announcement.*` and `tutorial.*` sections |
| `src/i18n/locales/en.json` | Same |
| `src/components/layout/TopBar.tsx` | Add `onOpenAnnouncement` + `onStartTutorial` props, 2 lucide icon buttons |
| `src/components/layout/PageLayout.tsx` | Thread new props to TopBar |
| `src/App.tsx` | New state, auto-trigger `useEffect`, mount AnnouncementModal + TutorialOverlay |
| `src/components/task-selector/TaskSelector.tsx` | Add `data-tutorial="task-selector"` |
| `src/components/editor/IntentField.tsx` | Add `data-tutorial="intent-field"` |
| `src/components/editor/AddFieldPanel.tsx` | Add `data-tutorial="add-field-panel"` |
| `src/components/preview/PreviewArea.tsx` | Add `data-tutorial="preview-area"` and `data-tutorial="format-selector"` |
| `src/components/preview/CopyButton.tsx` | Add `data-tutorial="copy-button"` |
| `src/components/editor/AiFillButton.tsx` | Add `data-tutorial="ai-fill-button"` |

---

### Task 1: Install `marked` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install marked**

```bash
npm install marked
```

Note: `marked` ships its own TypeScript types since v5; no separate `@types/marked` needed.

- [ ] **Step 2: Verify installation**

```bash
node -e "const { marked } = require('marked'); console.log(typeof marked.parse)"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add marked dependency for announcement markdown rendering"
```

---

### Task 2: Extend preference keys

**Files:**
- Modify: `src/storage/preferences.ts:4-14`
- Modify: `src/hooks/useStorage.ts:18-42`

- [ ] **Step 1: Add new keys to PreferenceKey**

In `src/storage/preferences.ts`, add two new keys to the union type:

```ts
export type PreferenceKey =
  | 'defaultOutputLanguage'
  | 'defaultOutputFormat'
  | 'aiApiType'
  | 'apiKey_openai'
  | 'apiKey_anthropic'
  | 'apiEndpoint_openai'
  | 'apiEndpoint_anthropic'
  | 'model_openai'
  | 'model_anthropic'
  | 'uiLanguage'
  | 'lastSeenAnnouncementVersion'
  | 'tutorialCompleted';
```

- [ ] **Step 2: Add fields to PreferencesState**

In `src/hooks/useStorage.ts`, add to `PreferencesState` interface and defaults:

```ts
export interface PreferencesState {
  defaultOutputLanguage: string;
  defaultOutputFormat: string;
  aiApiType: string;
  apiKey_openai: string;
  apiKey_anthropic: string;
  apiEndpoint_openai: string;
  apiEndpoint_anthropic: string;
  model_openai: string;
  model_anthropic: string;
  uiLanguage: string;
  lastSeenAnnouncementVersion: string;
  tutorialCompleted: string;
}

const DEFAULT_PREFERENCES: PreferencesState = {
  defaultOutputLanguage: 'zh',
  defaultOutputFormat: 'markdown',
  aiApiType: 'openai',
  apiKey_openai: '',
  apiKey_anthropic: '',
  apiEndpoint_openai: 'https://api.openai.com/v1',
  apiEndpoint_anthropic: 'https://api.anthropic.com',
  model_openai: '',
  model_anthropic: '',
  uiLanguage: 'zh',
  lastSeenAnnouncementVersion: '',
  tutorialCompleted: '',
};
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/storage/preferences.ts src/hooks/useStorage.ts
git commit -m "feat: add announcement and tutorial preference keys"
```

---

### Task 3: Announcement data loader

**Files:**
- Create: `src/data/announcements/index.ts`
- Create: `src/data/announcements/v0.6.0.md`
- Create: `src/data/announcements/__tests__/announcements.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/announcements/__tests__/announcements.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseAnnouncementFile } from '../index';

const sampleMd = `---
version: "1.0.0"
date: "2026-04-01"
title: 测试公告
title_en: Test Announcement
---

- 新增功能 A
- 修复 Bug B

<!-- en -->

- Added feature A
- Fixed bug B
`;

const noEnglishMd = `---
version: "0.9.0"
date: "2026-03-15"
title: 仅中文
title_en: Chinese only
---

- 仅中文内容
`;

describe('parseAnnouncementFile', () => {
  it('parses frontmatter fields', () => {
    const result = parseAnnouncementFile(sampleMd);
    expect(result.version).toBe('1.0.0');
    expect(result.date).toBe('2026-04-01');
    expect(result.title.zh).toBe('测试公告');
    expect(result.title.en).toBe('Test Announcement');
  });

  it('splits bilingual content by <!-- en --> marker', () => {
    const result = parseAnnouncementFile(sampleMd);
    expect(result.content.zh).toContain('新增功能 A');
    expect(result.content.zh).not.toContain('Added feature A');
    expect(result.content.en).toContain('Added feature A');
    expect(result.content.en).not.toContain('新增功能 A');
  });

  it('renders markdown to HTML', () => {
    const result = parseAnnouncementFile(sampleMd);
    expect(result.content.zh).toContain('<li>');
    expect(result.content.en).toContain('<li>');
  });

  it('falls back to zh content when no en marker', () => {
    const result = parseAnnouncementFile(noEnglishMd);
    expect(result.content.zh).toContain('仅中文内容');
    expect(result.content.en).toContain('仅中文内容');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/data/announcements/__tests__/announcements.test.ts
```

Expected: FAIL — `parseAnnouncementFile` is not exported.

- [ ] **Step 3: Write the announcement loader**

Create `src/data/announcements/index.ts`:

```ts
import yaml from 'js-yaml';
import { marked } from 'marked';

export interface Announcement {
  version: string;
  date: string;
  title: { zh: string; en: string };
  content: { zh: string; en: string };
}

interface Frontmatter {
  version: string;
  date: string;
  title: string;
  title_en: string;
}

/**
 * Parse a single announcement .md file (frontmatter + bilingual body).
 * Exported for testing; consumers should use `announcements` instead.
 */
export function parseAnnouncementFile(raw: string): Announcement {
  // Extract frontmatter between --- markers
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    throw new Error('Invalid announcement file: missing frontmatter');
  }

  const fm = yaml.load(fmMatch[1]) as Frontmatter;
  const body = fmMatch[2].trim();

  // Split body by <!-- en --> marker
  const enMarker = '<!-- en -->';
  const markerIndex = body.indexOf(enMarker);

  let zhBody: string;
  let enBody: string;

  if (markerIndex >= 0) {
    zhBody = body.slice(0, markerIndex).trim();
    enBody = body.slice(markerIndex + enMarker.length).trim();
  } else {
    zhBody = body;
    enBody = body; // fallback: same content for both
  }

  return {
    version: fm.version,
    date: fm.date,
    title: { zh: fm.title, en: fm.title_en },
    content: {
      zh: marked.parse(zhBody) as string,
      en: marked.parse(enBody) as string,
    },
  };
}

// Glob-load all .md files at build time
const mdModules = import.meta.glob('./*.md', { query: '?raw', eager: true });

/** All announcements, sorted by date descending (newest first). */
export const announcements: Announcement[] = Object.values(mdModules)
  .map((mod) => parseAnnouncementFile((mod as { default: string }).default))
  .sort((a, b) => b.date.localeCompare(a.date));

/** The latest announcement version string, or empty if none. */
export const latestVersion = announcements.length > 0 ? announcements[0].version : '';
```

- [ ] **Step 4: Create the first announcement file**

Create `src/data/announcements/v0.6.0.md`:

```md
---
version: "0.6.0"
date: "2026-04-09"
title: 帮助系统、边界状态与视觉优化
title_en: Help system, edge states & visual polish
---

- 新增字段帮助系统，每个字段旁边添加 [?] 按钮，点击可查看说明、建议和示例
- 空字段状态显示骨架屏预览，引导用户填写
- AI 填充按钮增加 Tooltip 提示，输入框增加针对性占位文本
- CSS 设计 Token 统一对齐，补充 hover/focus 过渡动效

<!-- en -->

- Added field help system with [?] toggle showing explanations, tips, and examples
- Skeleton preview for empty fields to guide user input
- AI Fill button tooltip and field-specific placeholder text
- CSS design token alignment with hover/focus/transition polish
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/data/announcements/__tests__/announcements.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/announcements/
git commit -m "feat: add announcement data loader with markdown parsing"
```

---

### Task 4: Tutorial steps data

**Files:**
- Create: `src/data/tutorial-steps.ts`
- Create: `src/data/__tests__/tutorial-steps.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/__tests__/tutorial-steps.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { tutorialSteps } from '../tutorial-steps';

describe('tutorialSteps', () => {
  it('has exactly 10 steps', () => {
    expect(tutorialSteps).toHaveLength(10);
  });

  it('every step has required fields', () => {
    for (const step of tutorialSteps) {
      expect(step.targetSelector).toBeTruthy();
      expect(step.title.zh).toBeTruthy();
      expect(step.title.en).toBeTruthy();
      expect(step.description.zh).toBeTruthy();
      expect(step.description.en).toBeTruthy();
      expect(['top', 'bottom', 'left', 'right']).toContain(step.placement);
    }
  });

  it('uses data-tutorial selectors', () => {
    for (const step of tutorialSteps) {
      expect(step.targetSelector).toMatch(/\[data-tutorial=/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/data/__tests__/tutorial-steps.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create tutorial steps data**

Create `src/data/tutorial-steps.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/data/__tests__/tutorial-steps.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/tutorial-steps.ts src/data/__tests__/tutorial-steps.test.ts
git commit -m "feat: add tutorial steps data with 10-step onboarding flow"
```

---

### Task 5: Add i18n strings

**Files:**
- Modify: `src/i18n/locales/zh.json`
- Modify: `src/i18n/locales/en.json`

- [ ] **Step 1: Add Chinese strings**

Add these sections to `src/i18n/locales/zh.json` (after the `"common"` section):

```json
  "announcement": {
    "title": "更新公告",
    "version": "v{{version}}",
    "noAnnouncements": "暂无公告"
  },
  "tutorial": {
    "next": "下一步",
    "prev": "上一步",
    "skip": "跳过教程",
    "finish": "完成",
    "step": "{{current}} / {{total}}"
  }
```

Also add to `"topBar"` section:

```json
    "announcement": "公告",
    "tutorial": "教程"
```

- [ ] **Step 2: Add English strings**

Add matching sections to `src/i18n/locales/en.json`:

```json
  "announcement": {
    "title": "What's New",
    "version": "v{{version}}",
    "noAnnouncements": "No announcements"
  },
  "tutorial": {
    "next": "Next",
    "prev": "Back",
    "skip": "Skip tutorial",
    "finish": "Finish",
    "step": "{{current}} / {{total}}"
  }
```

And in `"topBar"`:

```json
    "announcement": "What's New",
    "tutorial": "Tutorial"
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/zh.json src/i18n/locales/en.json
git commit -m "feat: add i18n strings for announcement and tutorial"
```

---

### Task 6: AnnouncementModal component

**Files:**
- Create: `src/components/modals/AnnouncementModal.tsx`
- Create: `tests/components/AnnouncementModal.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/AnnouncementModal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnouncementModal from '../../src/components/modals/AnnouncementModal';
import type { Announcement } from '../../src/data/announcements';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) => {
      if (typeof fallback === 'string') return fallback;
      if (key === 'announcement.version') return `v${(fallback as Record<string, unknown>)?.version ?? ''}`;
      return key;
    },
    i18n: { language: 'zh' },
  }),
}));

const mockAnnouncements: Announcement[] = [
  {
    version: '0.6.0',
    date: '2026-04-09',
    title: { zh: '帮助系统上线', en: 'Help system launched' },
    content: { zh: '<p>新增帮助系统</p>', en: '<p>Added help system</p>' },
  },
  {
    version: '0.5.0',
    date: '2026-04-01',
    title: { zh: 'AI 填充', en: 'AI Fill' },
    content: { zh: '<p>AI 功能</p>', en: '<p>AI feature</p>' },
  },
];

describe('AnnouncementModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AnnouncementModal open={false} onClose={vi.fn()} announcements={mockAnnouncements} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders announcements when open', () => {
    render(
      <AnnouncementModal open={true} onClose={vi.fn()} announcements={mockAnnouncements} />
    );
    expect(screen.getByText('帮助系统上线')).toBeInTheDocument();
    expect(screen.getByText('AI 填充')).toBeInTheDocument();
  });

  it('renders content HTML', () => {
    render(
      <AnnouncementModal open={true} onClose={vi.fn()} announcements={mockAnnouncements} />
    );
    expect(screen.getByText('新增帮助系统')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <AnnouncementModal open={true} onClose={onClose} announcements={mockAnnouncements} />
    );
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn();
    render(
      <AnnouncementModal open={true} onClose={onClose} announcements={mockAnnouncements} />
    );
    // Click the backdrop (the outermost overlay div)
    await userEvent.click(screen.getByTestId('announcement-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/components/AnnouncementModal.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AnnouncementModal**

Create `src/components/modals/AnnouncementModal.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Announcement } from '@/data/announcements';

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

export default function AnnouncementModal({
  open,
  onClose,
  announcements,
}: AnnouncementModalProps) {
  const { t, i18n } = useTranslation();
  const backdropRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language === 'en' ? 'en' : 'zh';

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      data-testid="announcement-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div className="bg-bg-surface rounded-xl shadow-xl w-full max-w-[600px] mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-ink-primary">
            {t('announcement.title', '更新公告')}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          {announcements.length === 0 ? (
            <p className="text-ink-muted text-sm text-center py-8">
              {t('announcement.noAnnouncements', '暂无公告')}
            </p>
          ) : (
            <div className="space-y-6">
              {announcements.map((item, index) => (
                <div
                  key={item.version}
                  className={`${index === 0 ? 'border-l-2 border-accent-primary pl-4' : 'pl-4'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-ink-primary text-accent-primary">
                      {t('announcement.version', { version: item.version })}
                    </span>
                    <span className="text-xs text-ink-muted">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-ink-primary mb-2">
                    {item.title[lang]}
                  </h3>
                  <div
                    className="text-sm text-ink-secondary leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:text-sm [&_p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: item.content[lang] }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/components/AnnouncementModal.test.tsx
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/modals/AnnouncementModal.tsx tests/components/AnnouncementModal.test.tsx
git commit -m "feat: add AnnouncementModal with bilingual release notes display"
```

---

### Task 7: SpotlightOverlay component

**Files:**
- Create: `src/components/tutorial/SpotlightOverlay.tsx`

- [ ] **Step 1: Create SpotlightOverlay**

Create `src/components/tutorial/SpotlightOverlay.tsx`:

```tsx
interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  padding?: number;
}

export function SpotlightOverlay({ targetRect, padding = 8 }: SpotlightOverlayProps) {
  if (!targetRect) return null;

  const x = targetRect.left - padding;
  const y = targetRect.top - padding;
  const w = targetRect.width + padding * 2;
  const h = targetRect.height + padding * 2;

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      data-testid="spotlight-overlay"
    >
      {/* Semi-transparent overlay with cutout via box-shadow */}
      <div
        className="absolute rounded-lg transition-all duration-300 ease-in-out"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tutorial/SpotlightOverlay.tsx
git commit -m "feat: add SpotlightOverlay with box-shadow highlight cutout"
```

---

### Task 8: TutorialTooltip component

**Files:**
- Create: `src/components/tutorial/TutorialTooltip.tsx`

- [ ] **Step 1: Create TutorialTooltip**

Create `src/components/tutorial/TutorialTooltip.tsx`:

```tsx
import { useTranslation } from 'react-i18next';

interface TutorialTooltipProps {
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  current: number;
  total: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  targetRect: DOMRect;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
}

const TOOLTIP_GAP = 12;

function computePosition(
  placement: 'top' | 'bottom' | 'left' | 'right',
  targetRect: DOMRect,
): React.CSSProperties {
  const tooltipWidth = 320;
  switch (placement) {
    case 'bottom':
      return {
        top: targetRect.bottom + TOOLTIP_GAP,
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      };
    case 'top':
      return {
        bottom: window.innerHeight - targetRect.top + TOOLTIP_GAP,
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      };
    case 'right':
      return {
        top: targetRect.top + targetRect.height / 2 - 40,
        left: targetRect.right + TOOLTIP_GAP,
      };
    case 'left':
      return {
        top: targetRect.top + targetRect.height / 2 - 40,
        right: window.innerWidth - targetRect.left + TOOLTIP_GAP,
      };
  }
}

export function TutorialTooltip({
  title,
  description,
  current,
  total,
  placement,
  targetRect,
  onPrev,
  onNext,
  onSkip,
}: TutorialTooltipProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'zh';
  const isFirst = current === 0;
  const isLast = current === total - 1;

  const style: React.CSSProperties = {
    ...computePosition(placement, targetRect),
    width: 320,
  };

  return (
    <div
      className="fixed z-[61] bg-bg-surface rounded-xl shadow-xl border border-border-default p-4 transition-all duration-300"
      style={style}
      data-testid="tutorial-tooltip"
    >
      {/* Title + progress */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-ink-primary">{title[lang]}</h3>
        <span className="text-xs text-ink-muted">
          {t('tutorial.step', { current: current + 1, total })}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-ink-secondary leading-relaxed mb-4">
        {description[lang]}
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-xs text-ink-muted hover:text-ink-secondary transition-colors"
        >
          {t('tutorial.skip', '跳过教程')}
        </button>
        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border-default text-ink-secondary hover:bg-bg-muted transition-colors"
            >
              {t('tutorial.prev', '上一步')}
            </button>
          )}
          <button
            onClick={onNext}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-ink-primary text-accent-primary hover:opacity-90 transition-colors"
          >
            {isLast ? t('tutorial.finish', '完成') : t('tutorial.next', '下一步')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tutorial/TutorialTooltip.tsx
git commit -m "feat: add TutorialTooltip with positioning and navigation"
```

---

### Task 9: TutorialOverlay orchestrator

**Files:**
- Create: `src/components/tutorial/TutorialOverlay.tsx`
- Create: `tests/components/TutorialOverlay.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/TutorialOverlay.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TutorialOverlay } from '../../src/components/tutorial/TutorialOverlay';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'tutorial.next': '下一步',
        'tutorial.prev': '上一步',
        'tutorial.skip': '跳过教程',
        'tutorial.finish': '完成',
      };
      if (key === 'tutorial.step') return `${opts?.current} / ${opts?.total}`;
      return map[key] ?? key;
    },
    i18n: { language: 'zh' },
  }),
}));

// Mock tutorial steps — only 2 steps for simpler test
vi.mock('../../src/data/tutorial-steps', () => ({
  tutorialSteps: [
    {
      targetSelector: '[data-tutorial="step-one"]',
      title: { zh: '步骤一', en: 'Step One' },
      description: { zh: '描述一', en: 'Description one' },
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tutorial="step-two"]',
      title: { zh: '步骤二', en: 'Step Two' },
      description: { zh: '描述二', en: 'Description two' },
      placement: 'top',
    },
  ],
}));

describe('TutorialOverlay', () => {
  beforeEach(() => {
    // Create mock target elements in the DOM
    const el1 = document.createElement('div');
    el1.setAttribute('data-tutorial', 'step-one');
    el1.getBoundingClientRect = () => ({
      top: 100, left: 100, bottom: 140, right: 300,
      width: 200, height: 40, x: 100, y: 100, toJSON: () => {},
    });
    document.body.appendChild(el1);

    const el2 = document.createElement('div');
    el2.setAttribute('data-tutorial', 'step-two');
    el2.getBoundingClientRect = () => ({
      top: 300, left: 100, bottom: 340, right: 300,
      width: 200, height: 40, x: 100, y: 300, toJSON: () => {},
    });
    document.body.appendChild(el2);
  });

  it('renders nothing when not active', () => {
    const { container } = render(
      <TutorialOverlay active={false} onComplete={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders first step when active', () => {
    render(<TutorialOverlay active={true} onComplete={vi.fn()} />);
    expect(screen.getByText('步骤一')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('advances to next step on click', async () => {
    render(<TutorialOverlay active={true} onComplete={vi.fn()} />);
    await userEvent.click(screen.getByText('下一步'));
    expect(screen.getByText('步骤二')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('calls onComplete when finishing last step', async () => {
    const onComplete = vi.fn();
    render(<TutorialOverlay active={true} onComplete={onComplete} />);
    await userEvent.click(screen.getByText('下一步'));
    await userEvent.click(screen.getByText('完成'));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('calls onComplete when skipping', async () => {
    const onComplete = vi.fn();
    render(<TutorialOverlay active={true} onComplete={onComplete} />);
    await userEvent.click(screen.getByText('跳过教程'));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/components/TutorialOverlay.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement TutorialOverlay**

Create `src/components/tutorial/TutorialOverlay.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { tutorialSteps } from '@/data/tutorial-steps';
import { SpotlightOverlay } from './SpotlightOverlay';
import { TutorialTooltip } from './TutorialTooltip';

interface TutorialOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export function TutorialOverlay({ active, onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Reset step when tutorial starts
  const [prevActive, setPrevActive] = useState(false);
  if (active && !prevActive) {
    setStep(0);
  }
  if (prevActive !== active) {
    setPrevActive(active);
  }

  // Find and track the target element for the current step
  useEffect(() => {
    if (!active) return;

    const updateRect = () => {
      const selector = tutorialSteps[step]?.targetSelector;
      if (!selector) return;
      const el = document.querySelector(selector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [active, step]);

  const handleNext = useCallback(() => {
    if (step >= tutorialSteps.length - 1) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, onComplete]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  if (!active) return null;

  const currentStep = tutorialSteps[step];
  if (!currentStep || !targetRect) return null;

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />
      {/* Clickable backdrop to block interaction outside the tooltip */}
      <div className="fixed inset-0 z-[60]" />
      <TutorialTooltip
        title={currentStep.title}
        description={currentStep.description}
        current={step}
        total={tutorialSteps.length}
        placement={currentStep.placement}
        targetRect={targetRect}
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={onComplete}
      />
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/components/TutorialOverlay.test.tsx
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tutorial/ tests/components/TutorialOverlay.test.tsx
git commit -m "feat: add TutorialOverlay with step navigation and spotlight"
```

---

### Task 10: Update TopBar with icon buttons

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: Add new props and buttons to TopBar**

Replace the full `TopBar.tsx` content:

```tsx
import { useTranslation } from 'react-i18next';
import { Megaphone, GraduationCap } from 'lucide-react';
import { setUILanguage } from '@/i18n/config';
import type { Language } from '@/compiler/types';

function UILanguageToggle() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language as Language;

  return (
    <div className="flex items-center rounded-sm border border-border-default text-sm">
      <button
        type="button"
        className={`px-2 py-0.5 font-medium rounded-l-sm transition-colors ${
          currentLang === 'zh'
            ? 'bg-ink-primary text-accent-primary'
            : 'bg-transparent text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
        }`}
        onClick={() => setUILanguage('zh')}
      >
        {t('common.zh')}
      </button>
      <button
        type="button"
        className={`px-2 py-0.5 font-medium rounded-r-sm transition-colors ${
          currentLang === 'en'
            ? 'bg-ink-primary text-accent-primary'
            : 'bg-transparent text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
        }`}
        onClick={() => setUILanguage('en')}
      >
        {t('common.en')}
      </button>
    </div>
  );
}

interface TopBarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenAnnouncement: () => void;
  onStartTutorial: () => void;
}

export function TopBar({
  onOpenHistory,
  onOpenSettings,
  onOpenAnnouncement,
  onStartTutorial,
}: TopBarProps) {
  const { t } = useTranslation();

  const iconButtonClass =
    'text-ink-secondary hover:text-ink-primary transition-colors p-1 rounded-md hover:bg-bg-muted';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border-default bg-bg-surface px-5 h-12">
      <h1
        className="text-xl font-extrabold text-ink-primary"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {t('topBar.appName')}
      </h1>

      <nav className="flex items-center gap-4">
        <button
          onClick={onOpenAnnouncement}
          className={iconButtonClass}
          title={t('topBar.announcement', '公告')}
          data-tutorial="announcement-button"
        >
          <Megaphone size={18} />
        </button>
        <button
          onClick={onStartTutorial}
          className={iconButtonClass}
          title={t('topBar.tutorial', '教程')}
          data-tutorial="tutorial-button"
        >
          <GraduationCap size={18} />
        </button>
        <button
          onClick={onOpenHistory}
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
          data-tutorial="history-button"
        >
          {t('topBar.history')}
        </button>
        <button
          onClick={onOpenSettings}
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
          data-tutorial="settings-button"
        >
          {t('topBar.settings')}
        </button>
        <UILanguageToggle />
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify build** (will fail — PageLayout not yet updated)

This will produce a type error in PageLayout since TopBar now expects 2 new props. That's expected — we'll fix it in the next task.

- [ ] **Step 3: Commit TopBar only**

```bash
git add src/components/layout/TopBar.tsx
git commit -m "feat: add announcement and tutorial icon buttons to TopBar"
```

---

### Task 11: Wire PageLayout props

**Files:**
- Modify: `src/components/layout/PageLayout.tsx`

- [ ] **Step 1: Add new props to PageLayout**

Add to `PageLayoutProps` interface (after `onOpenSettings`):

```ts
  onOpenAnnouncement: () => void;
  onStartTutorial: () => void;
```

Add to the destructured props and pass them to `TopBar`:

```tsx
<TopBar
  onOpenHistory={onOpenHistory}
  onOpenSettings={onOpenSettings}
  onOpenAnnouncement={onOpenAnnouncement}
  onStartTutorial={onStartTutorial}
/>
```

- [ ] **Step 2: Verify build** (will fail — App.tsx doesn't pass these props yet)

Expected type error in App.tsx. Proceed to next task.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/PageLayout.tsx
git commit -m "feat: thread announcement and tutorial props through PageLayout"
```

---

### Task 12: App.tsx integration

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports and state**

Add these imports at the top of `src/App.tsx`:

```ts
import AnnouncementModal from '@/components/modals/AnnouncementModal';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { announcements, latestVersion } from '@/data/announcements';
```

Add state variables (after `historyOpen` state):

```ts
const [announcementOpen, setAnnouncementOpen] = useState(false);
const [tutorialActive, setTutorialActive] = useState(false);
```

- [ ] **Step 2: Add auto-trigger useEffect**

Add this `useEffect` after the existing `prefsApplied` + UI language migration effect:

```ts
// Auto-trigger tutorial and announcement on first visit / new version
useEffect(() => {
  if (!prefsApplied) return;

  const needsTutorial = preferences.tutorialCompleted !== 'true';
  const needsAnnouncement =
    latestVersion !== '' &&
    preferences.lastSeenAnnouncementVersion !== latestVersion;

  if (needsTutorial) {
    setTutorialActive(true);
    // Announcement will be checked after tutorial completes
  } else if (needsAnnouncement) {
    setAnnouncementOpen(true);
  }
}, [prefsApplied]); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Add tutorial completion handler**

Add this callback (near the other handlers):

```ts
const handleTutorialComplete = useCallback(async () => {
  setTutorialActive(false);
  await updatePreference('tutorialCompleted', 'true');

  // After tutorial, check if announcement needs showing
  if (
    latestVersion !== '' &&
    preferences.lastSeenAnnouncementVersion !== latestVersion
  ) {
    setAnnouncementOpen(true);
  }
}, [preferences.lastSeenAnnouncementVersion, updatePreference]);

const handleAnnouncementClose = useCallback(async () => {
  setAnnouncementOpen(false);
  if (latestVersion) {
    await updatePreference('lastSeenAnnouncementVersion', latestVersion);
  }
}, [updatePreference]);
```

- [ ] **Step 4: Pass new props to PageLayout and mount new components**

Update the `PageLayout` call to add the two new props:

```tsx
onOpenAnnouncement={() => setAnnouncementOpen(true)}
onStartTutorial={() => setTutorialActive(true)}
```

Add the new components after `HistoryModal`, before the closing `</>`:

```tsx
<AnnouncementModal
  open={announcementOpen}
  onClose={handleAnnouncementClose}
  announcements={announcements}
/>
<TutorialOverlay
  active={tutorialActive}
  onComplete={handleTutorialComplete}
/>
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate announcement modal and tutorial overlay in App"
```

---

### Task 13: Add data-tutorial attributes to target components

**Files:**
- Modify: `src/components/task-selector/TaskSelector.tsx`
- Modify: `src/components/editor/IntentField.tsx`
- Modify: `src/components/editor/AddFieldPanel.tsx`
- Modify: `src/components/preview/PreviewArea.tsx`
- Modify: `src/components/preview/CopyButton.tsx`
- Modify: `src/components/editor/AiFillButton.tsx`

For each file, add the `data-tutorial` attribute to the component's root/relevant element. The TopBar buttons already have their attributes from Task 10.

- [ ] **Step 1: TaskSelector — add `data-tutorial="task-selector"`**

In `src/components/task-selector/TaskSelector.tsx`, add to the root `<div>`:

```tsx
<div className="px-5 py-3" data-tutorial="task-selector">
```

- [ ] **Step 2: IntentField — add `data-tutorial="intent-field"`**

In `src/components/editor/IntentField.tsx`, add to the root `<div>`:

```tsx
<div className="flex flex-col gap-1" data-tutorial="intent-field">
```

- [ ] **Step 3: AddFieldPanel — add `data-tutorial="add-field-panel"`**

In `src/components/editor/AddFieldPanel.tsx`, add to BOTH the collapsed button and the expanded panel root:

For the collapsed button:
```tsx
<button ... data-tutorial="add-field-panel">
```

For the expanded panel div:
```tsx
<div ref={panelRef} className="rounded-lg overflow-hidden border border-border-default" data-tutorial="add-field-panel">
```

- [ ] **Step 4: PreviewArea — add `data-tutorial="preview-area"` and `data-tutorial="format-selector"`**

In `src/components/preview/PreviewArea.tsx`, add to the root element:

```tsx
<div className="flex flex-col h-full" data-tutorial="preview-area">
```

And add to the format button container (the `<div className="flex gap-1">` that wraps the format pills):

```tsx
<div className="flex gap-1" data-tutorial="format-selector">
```

- [ ] **Step 5: CopyButton — add `data-tutorial="copy-button"`**

In `src/components/preview/CopyButton.tsx`, add to the `<button>` element:

```tsx
<button ... data-tutorial="copy-button">
```

- [ ] **Step 6: AiFillButton — add `data-tutorial="ai-fill-button"`**

In `src/components/editor/AiFillButton.tsx`, add to both root `<div>` elements (the no-API-key branch and the normal branch):

```tsx
<div className="flex flex-col items-end" data-tutorial="ai-fill-button">
```

- [ ] **Step 7: Run full test suite**

```bash
npm run test
```

Expected: all tests pass (some existing snapshot tests may need updating if they include the new attributes).

- [ ] **Step 8: Run build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/task-selector/TaskSelector.tsx src/components/editor/IntentField.tsx src/components/editor/AddFieldPanel.tsx src/components/preview/PreviewArea.tsx src/components/preview/CopyButton.tsx src/components/editor/AiFillButton.tsx
git commit -m "feat: add data-tutorial attributes to all tutorial target elements"
```

---

### Task 14: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify first-visit flow**

Open the app in an incognito/private browser window (clean IndexedDB). Expected:
1. Tutorial starts automatically with step 1 (task selector highlighted)
2. Navigate through all 10 steps with Next/Back buttons
3. After completing tutorial, announcement modal pops up with v0.6.0 release notes
4. Close announcement, verify it doesn't reappear on page refresh

- [ ] **Step 3: Verify TopBar re-entry**

1. Click the tutorial icon (GraduationCap) in TopBar → tutorial restarts from step 1
2. Click the announcement icon (Megaphone) in TopBar → announcement modal opens
3. Verify both work correctly after re-entry

- [ ] **Step 4: Verify language switching**

1. Switch UI language to English, open announcement → English content shown
2. Restart tutorial → English titles and descriptions shown

- [ ] **Step 5: Run full test suite one final time**

```bash
npm run test && npm run build
```

Expected: all pass, build clean.
