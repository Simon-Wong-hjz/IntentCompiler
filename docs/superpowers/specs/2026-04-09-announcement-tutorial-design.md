# Announcement & Tutorial System Design

Two new features for Intent Compiler: a version-driven announcement popup (Release Notes) and an interactive spotlight tutorial for first-time onboarding.

## 1. Announcement System

### Data Format

Individual Markdown files in `src/data/announcements/`, one per version:

```
src/data/announcements/
├── v0.6.0.md
├── v0.5.0.md
└── index.ts      ← Vite glob import + parser
```

Each `.md` file uses YAML frontmatter for metadata, with Chinese as default body and `<!-- en -->` delimiter for the English section:

```md
---
version: "0.6.0"
date: "2026-04-09"
title: 新增帮助系统与视觉优化
title_en: Help system & visual polish
---

- 新增字段帮助系统，支持 [?] 按钮切换
- 空字段状态显示骨架屏预览

<!-- en -->

- Added field help system with interactive [?] toggle
- Skeleton preview for empty fields
```

### Loader (`src/data/announcements/index.ts`)

1. `import.meta.glob('./*.md', { query: '?raw' })` loads all `.md` files as raw strings
2. Parse YAML frontmatter using project's existing `js-yaml` dependency
3. Split body by `<!-- en -->` marker into zh/en content
4. Convert Markdown to HTML via `marked` library
5. Sort by date descending, export as `Announcement[]`

```ts
export interface Announcement {
  version: string
  date: string
  title: { zh: string; en: string }
  content: { zh: string; en: string }  // HTML strings (rendered from Markdown)
}
```

### Modal (`src/components/modals/AnnouncementModal.tsx`)

- Follows existing modal pattern: fixed overlay, backdrop click to close, Escape key handler
- Header: title + close button
- Scrollable body: all announcements rendered in reverse-chronological order
- Each entry: version badge, date, rendered HTML content
- Latest entry highlighted with accent-colored left border
- Content rendered via `dangerouslySetInnerHTML` (safe — source is project-owned `.md` files)
- Respects current UI language for content selection

### Read Detection

- Stored in Dexie `preferences` table: key `lastSeenAnnouncementVersion`
- On app load: compare `lastSeenAnnouncementVersion` with `announcements[0].version`
- Mismatch or missing → auto-open modal
- On modal close → write current version to preferences
- No unread badge; auto-popup on new version is sufficient

## 2. Tutorial System

### Step Data (`src/data/tutorial-steps.ts`)

```ts
export interface TutorialStep {
  targetSelector: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  placement: 'top' | 'bottom' | 'left' | 'right'
}
```

10 steps in order:

| # | Target | Description |
|---|--------|-------------|
| 1 | Task selector area | Choose a task type |
| 2 | Editor area / intent field | Edit fields |
| 3 | Add fields panel | Expand optional fields |
| 4 | Preview area | Live preview |
| 5 | Format selector in preview header | Switch output format |
| 6 | Copy button | Copy result |
| 7 | History button in TopBar | View history |
| 8 | AI fill button | AI-assisted filling |
| 9 | Settings button in TopBar | Open settings |
| 10 | Tutorial icon in TopBar | Re-enter tutorial anytime |

Target elements marked with `data-tutorial="xxx"` attributes for stable selector targeting.

### Components

**`src/components/tutorial/TutorialOverlay.tsx`** — orchestrator:
- Manages current step index, navigation (prev/next/skip)
- Queries target element via `document.querySelector(targetSelector)`
- Computes position with `getBoundingClientRect()`
- Delegates rendering to child components

**`src/components/tutorial/SpotlightOverlay.tsx`** — pure presentation:
- Full-screen fixed overlay with semi-transparent background
- `box-shadow` technique to create transparent highlight cutout around target element
- Smooth transition on step change

**`src/components/tutorial/TutorialTooltip.tsx`** — pure presentation:
- Positioned adjacent to target element based on `placement`
- Content: step title, description, progress indicator ("3 / 10")
- Navigation: "上一步" / "下一步" buttons; last step shows "完成"
- "跳过教程" skip link

### First-Time Detection

- Stored in Dexie `preferences` table: key `tutorialCompleted`
- On app load: if `tutorialCompleted` is not `true` → auto-start tutorial
- On completion or skip → set `tutorialCompleted` to `true`
- Manual re-entry from TopBar always starts from step 1, does not reset `tutorialCompleted`

## 3. TopBar Changes

Two icon buttons added to the right side, before the existing "历史" button:

```
[意图编译器]                    [📢] [📖] [历史] [设置] [中文|EN]
                                 ^     ^
                          Announcement  Tutorial
```

- Icons: lucide-react (`Megaphone` or `Bell` for announcement; `GraduationCap` or `CircleHelp` for tutorial)
- Style: matches existing TopBar button styling with hover transitions
- No emoji — lucide icons only

## 4. Interaction Flow

### Priority on First Visit

When both features trigger simultaneously (first visit):

1. **Tutorial first** — builds foundational understanding
2. **Announcement after** — tutorial completion callback checks and triggers announcement if needed

### State in App.tsx

```ts
const [announcementOpen, setAnnouncementOpen] = useState(false)
const [tutorialActive, setTutorialActive] = useState(false)
```

Auto-trigger logic runs in a `useEffect` after preferences are loaded:
- Check `tutorialCompleted` → if false, start tutorial
- Tutorial's `onComplete` callback checks `lastSeenAnnouncementVersion` → if stale, open announcement
- If tutorial already completed, directly check announcement version

## 5. Dependencies

| Dependency | Purpose | Size |
|-----------|---------|------|
| `marked` | Markdown → HTML rendering | ~7KB gzipped |

All other needs covered by existing dependencies (`js-yaml` for frontmatter parsing, `react-i18next` for language, `dexie` for persistence).

## 6. File Summary

New files:
- `src/data/announcements/*.md` — announcement content files
- `src/data/announcements/index.ts` — glob loader + parser
- `src/data/tutorial-steps.ts` — tutorial step definitions
- `src/components/modals/AnnouncementModal.tsx` — announcement modal
- `src/components/tutorial/TutorialOverlay.tsx` — tutorial orchestrator
- `src/components/tutorial/SpotlightOverlay.tsx` — overlay with highlight cutout
- `src/components/tutorial/TutorialTooltip.tsx` — step tooltip

Modified files:
- `src/components/layout/TopBar.tsx` — add announcement + tutorial icon buttons
- `src/App.tsx` — new state, auto-trigger logic, pass props to new components
- `src/storage/preferences.ts` — add `lastSeenAnnouncementVersion` and `tutorialCompleted` to `PreferenceKey` type
- Various components — add `data-tutorial="xxx"` attributes to target elements
- `src/i18n/locales/en.json` + `zh.json` — new UI strings for tutorial and announcement
