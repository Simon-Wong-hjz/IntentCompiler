# Changelog

## [2026-04-09] - Announcement & Tutorial System
- Created `src/data/announcements/index.ts` — announcement data loader: YAML frontmatter parser, `<!-- en -->` bilingual split, `marked` Markdown→HTML rendering, Vite glob import
- Created `src/data/announcements/v0.6.0.md` — first announcement file with bilingual release notes for Phase 6
- Created `src/data/announcements/__tests__/announcements.test.ts` — 5 tests: frontmatter parsing, bilingual split, HTML rendering, zh fallback, error case
- Created `src/data/tutorial-steps.ts` — 10-step declarative tutorial config with `TutorialStep` interface (targetSelector, bilingual title/description, placement)
- Created `src/data/__tests__/tutorial-steps.test.ts` — 3 tests: step count, required fields, unique selectors
- Created `src/components/modals/AnnouncementModal.tsx` — scrollable modal with version badges, accent border on latest, `dangerouslySetInnerHTML` for pre-rendered content
- Created `src/components/tutorial/SpotlightOverlay.tsx` — full-screen overlay with `box-shadow: 0 0 0 9999px` cutout technique
- Created `src/components/tutorial/TutorialTooltip.tsx` — positioned tooltip with `computePosition()` for 4 placements, step counter, prev/next/skip buttons
- Created `src/components/tutorial/TutorialOverlay.tsx` — orchestrator: step navigation, DOM querying, resize/scroll tracking, auto-skip for missing targets, Escape key dismissal
- Created `tests/components/AnnouncementModal.test.tsx` — 5 tests covering render, content, close, backdrop, empty state
- Created `tests/components/TutorialOverlay.test.tsx` — 5 tests covering render, navigation, skip, completion, step counter
- Modified `src/components/layout/TopBar.tsx` — added Megaphone + GraduationCap icon buttons, `data-tutorial` attributes on all 4 nav buttons
- Modified `src/components/layout/PageLayout.tsx` — threaded `onOpenAnnouncement` and `onStartTutorial` props
- Modified `src/App.tsx` — added auto-trigger logic (tutorial first → announcement), state management, preference persistence
- Modified `src/storage/preferences.ts` — added `lastSeenAnnouncementVersion` and `tutorialCompleted` preference keys
- Modified `src/hooks/useStorage.ts` — added new preference defaults
- Modified 7 components with `data-tutorial` attributes: TaskSelector, IntentField, AddFieldPanel, PreviewArea, PreviewHeader, CopyButton, AiFillButton
- Added bilingual i18n strings for announcement and tutorial sections in en.json and zh.json
- Fixed tutorial auto-skip bug: steps targeting conditionally-rendered elements now skip gracefully with adjusted step counter
- **Totals**: 22 test files / 180 tests pass; tsc clean; 14 commits

## [2026-04-09] - Phase 6: Help System + Edge States + Visual Polish
- Created `src/data/help-content.ts` — bilingual (en/zh) help content for all 45 PRD fields with `whatIsThis`, `suggestions`, and `example` sections
- Created `src/data/__tests__/help-content.test.ts` — 4 integrity tests verifying field coverage, bilingual completeness, and no extra keys
- Created `src/components/help/HelpCard.tsx` — inline expandable help card with 200ms slide animation, warm yellow styling
- Modified `src/components/editor/FieldLabel.tsx` — [?] badge now interactive toggle button with active state (black bg + gold text), renders HelpCard between label row and input
- Modified `src/compiler/compiler.ts` — added `buildSkeleton()` producing placeholder OrderedFields for template preview
- Modified `src/hooks/useCompiler.ts` — returns `skeletonOutput` alongside `compiledOutput` when task selected but all fields empty
- Modified `src/components/preview/PreviewArea.tsx` — shows skeleton in ink-hint color; threaded `skeletonOutput` prop
- Modified `src/components/editor/AiFillButton.tsx` — added hover tooltip "请先输入意图" when button disabled due to empty intent
- Modified `src/components/editor/fields/TextareaField.tsx` + `TextField.tsx` — auto-resolve field-specific placeholders from i18n `fieldPlaceholders.*` before falling back to generic hint
- Added `fieldPlaceholders` i18n entries for 12 key fields (context, requirements, constraints, goal, role, audience, source_content, subject, problem, current_state, plan, scope)
- Added `ai.enterIntentFirst` i18n key (en: "Enter your intent first", zh: "请先输入意图")
- Modified `src/index.css` — added Google Fonts @import, font-sans/font-mono/spacing tokens to @theme, focus-visible ring, universal interactive transition
- Modified `src/components/preview/PreviewHeader.tsx` — added `hover:bg-bg-muted` to inactive format pills and language toggle
- Modified `src/components/layout/TopBar.tsx` — added `hover:bg-bg-muted` to inactive language toggle segments
- Modified `src/components/editor/fields/ComboField.tsx` — added `hover:bg-bg-muted` to unselected combo pills
- **Totals**: 18 test files / 162 tests pass; tsc clean; build 553KB JS + 31KB CSS

## [2026-04-09] - Phase 5: AI-Enhanced Mode
- Created `src/ai/types.ts` — AiProvider interface, AiFillRequest/Response/VerifyResult types
- Created `src/ai/prompt-builder.ts` — System prompt and user message construction for AI field filling
- Created `src/ai/providers/openai.ts` — OpenAI provider using fetch() to chat completions API (GPT-4o)
- Created `src/ai/providers/anthropic.ts` — Anthropic provider using fetch() to messages API (Claude Sonnet), with CORS limitation handling
- Created `src/ai/connector.ts` — AI connector orchestrator: provider factory, prompt building, response validation
- Created `src/components/editor/AiFillButton.tsx` — Four-state button (idle/disabled/loading/result) with animated progress bar
- Created `src/hooks/useAiFill.ts` — Hook orchestrating AI fill flow: prerequisite validation, provider call, status management
- Modified `src/components/editor/IntentField.tsx` — Added AiFillButton in label row + "Allow AI to add fields" checkbox
- Modified `src/components/editor/EditorArea.tsx` — Pass AI-filled state for bg-accent-light tinting
- Modified `src/components/editor/FieldRenderer.tsx` — Apply yellow tint to AI-filled field containers
- Modified `src/components/layout/PageLayout.tsx` — Thread AI props from App to EditorArea
- Modified `src/components/modals/SettingsModal.tsx` — Replaced Phase 4 mock verifier with real provider.verifyKey() calls
- Modified `src/App.tsx` — Added AI state management, wired useAiFill hook, field value updates from AI responses
- Created tests: `tests/ai/prompt-builder.test.ts`, `tests/ai/providers/openai.test.ts`, `tests/ai/providers/anthropic.test.ts`, `tests/ai/connector.test.ts`
- Added i18n translations for all AI UI text (English + Chinese)
- Added CSS keyframe animations for AI fill progress bar and fade-in effect
- **Totals**: 17 test files / 154 tests pass; lint clean; tsc clean

## [2026-04-09] - Phase 4: Persistence — Settings + History
- Created Dexie.js database schema (v1) with preferences, history, templates stores (`src/storage/db.ts`)
- Added preferences CRUD helpers with typed `PreferenceKey` union (`src/storage/preferences.ts`)
- Added history CRUD helpers with newest-first sorted retrieval (`src/storage/history.ts`)
- Added React storage hooks: `usePreferences` and `useHistory` (`src/hooks/useStorage.ts`)
- Added mock API key verifier for Phase 4 (`src/storage/apiKeyVerifier.ts`) — real verification in Phase 5
- Added bilingual relative timestamp utility (`src/utils/relativeTime.ts`) — "刚刚"/"just now" etc.
- Created `SettingsModal` with Output Defaults (language + format pill selectors) and AI Configuration (provider, API key with masked input, mock verification) (`src/components/modals/SettingsModal.tsx`)
- Created `HistoryModal` with sorted records, task type badges, inline load/delete confirmations, Clear All, and empty state (`src/components/modals/HistoryModal.tsx`)
- Added i18n keys for Settings and History modals (en.json + zh.json: `settings.*`, `history.*`, `common.cancel/load/delete`)
- Wired TopBar History/Settings as clickable modal triggers (removed disabled state)
- Added `onAfterCopy` callback chain through `PageLayout → PreviewArea → CopyButton` for history recording
- Wired App.tsx: load output defaults from Dexie on mount, one-time localStorage→Dexie migration for UI language, modal state, history save on copy, record loading into editor
- Added 3 test files: `db.test.ts` (4 tests), `preferences.test.ts` (7 tests), `history.test.ts` (8 tests) — all using fake-indexeddb
- **Totals**: 13 test files / 123 tests pass; lint clean; build 512KB JS + 31KB CSS

## [2026-04-09] - Manual acceptance fixes: 6 issues across list fields, i18n, formatters, and UX
- **List field only renders non-empty items**: Added `newItem.trim()` guard in `handleAdd`; compiler filters empty strings from arrays before passing to formatters; add-item row moved outside bordered container with dashed border for visual separation
- **Enum option values i18n**: Added 33 option translations to both locale files (`options` section); compiler translates combo field values via `getOptionLabel()` based on output language; ComboField pills display translated text via `t('options.${option}')`
- **Removed invisible add-field animation**: Stripped `row-slide-up` keyframe, `removingFieldKey` state, `isRemoving` prop, and `setTimeout` from AddFieldPanel; `onAddField` now fires immediately
- **Renamed "字段" to "项目"**: Updated 5 Chinese strings, 5 English strings (Field→Item), and `format.ts` hardcoded fallback; more intuitive for non-technical users
- **Key-value pairs output as top-level entries**: JSON, YAML, XML formatters now expand KV pairs into individual entries (key as heading, value as content) instead of nesting under "自定义项目"; matches existing Markdown formatter behavior
- **XML Chinese tag support fixed**: `sanitizeTagName` regex updated from ASCII-only to Unicode-aware (`\p{L}\p{N}` with `u` flag); CJK characters now preserved in XML tag names per XML 1.0 spec
- Updated AddFieldPanel + ComboField tests to match new i18n text; 104 tests pass, build clean (400KB JS + 30KB CSS)

## [2026-04-08] - Removable optional fields with collapse animation
- **Added optional fields are now removable**: Each field added from AddFieldPanel shows a "✕" button on hover (top-right, `group-hover:opacity-100`); clicking triggers a `field-collapse` CSS animation before removal
- **`field-collapse` keyframe**: Uses `grid-template-rows: 1fr → 0fr` trick to animate any content height smoothly without hardcoded max-height; 200ms ease-in matches AddFieldPanel's row-slide-up timing
- **State changes**: `onRemoveField(fieldKey)` in App.tsx removes field from `addedFields` and deletes its value from `fieldValues`; prop threaded through PageLayout → EditorArea
- 74 tests pass, build clean (302KB JS + 30KB CSS)

## [2026-04-08] - UI polish batch 2: 7 fixes for field editing, compiler ordering, and visual hierarchy
- **ListField empty adds**: Removed `newItem.trim()` guard — "+" now always adds a row, even when input is empty, allowing batch row creation
- **ToggleField knob overflow fixed**: Switched from 1.5px fractional border to 2px integer border; knob 14→12px with explicit `left: 0` positioning; 2px clearance on all sides eliminates subpixel overflow
- **KeyValueField editable pairs**: `SortablePair` now renders `<input>` elements (was read-only `<span>`); added `onUpdate` callback; empty adds allowed (matching ListField)
- **AddFieldPanel slide-up remove**: Replaced 400ms flash+delay with 200ms `row-slide-up` CSS animation — clicked field collapses upward, rows below slide to fill the gap, then `onAddField` fires; removed unused `flash-success` keyframe
- **Compiled output matches editor order**: Lifted `addedFields` state from EditorArea to App.tsx; compiler now receives `displayOrderFields = [intent, ...defaults, ...addedOptionals]` instead of template-order fields
- **KeyValueField markdown output**: Each pair now renders as its own `# key\nvalue` section (was `- **key**: value` bullets under single heading); pairs with all-whitespace key+value are skipped
- **Visual separation in editor**: Field labels: `text-sm font-bold text-ink-primary` (was `text-xs font-semibold text-ink-muted`); removed `uppercase`/`tracking-wide` (meaningless for Chinese); inter-field gap: 24px (was 10px); added `border-t` dividers between fields; heavier `border-border-default` separator before AddFieldPanel
- Updated AddFieldPanel test to match synchronous add behavior; 74 tests pass, build clean (301KB JS + 30KB CSS)

## [2026-04-08] - UI polish: 9 fixes across field components, AddFieldPanel, and global interactions
- **Help button restyled**: Circled `?` at superscript position with visible border ring, hover accent color, and `cursor-help` — replaces flat invisible badge (FieldLabel + AddFieldPanel)
- **ListField "+" button fixed**: Changed from `<span>` to `<button>` with `onClick={handleAdd}`; fixed drag animation snap-back by using stable `useRef` counter IDs instead of index-based `item-${i}`
- **KeyValueField "+" button fixed + drag support**: Same `<span>→<button>` fix; added full @dnd-kit sortable context with drag handles (⠿), matching ListField pattern
- **Merged SelectField into ComboField**: Removed `'select'` from `InputType`, deleted `SelectField.tsx`, changed all 15 `inputType: 'select'` entries to `'combo'` across 6 task type files. ComboField is a superset (pills + custom text input)
- **ToggleField animation fixed**: Added `p-0` to reset default button padding; adjusted knob size (14×14) and positioning (`top: 1.5px`, `translateX: 2px/18px`) to stay within switch bounds. Removed redundant "是/否 — {name}" text label
- **AddFieldPanel smooth expand/collapse**: Entrance `slide-expand` animation (250ms) + exit `slide-collapse` animation (200ms); `scrollIntoView` on expand; add-field feedback with 400ms green flash + ✓ checkmark before field is added
- **"其他" header restyled**: Changed from `bg-bg-page text-ink-muted` to gold `bg-bg-accent-light text-ink-primary`, matching "自定义字段" header
- **Global cursor:pointer**: Added `button:not(:disabled) { cursor: pointer }` CSS rule to `index.css`
- Updated module CLAUDE.md files and tests for select→combo rename; 74 tests pass, build clean (300KB JS)

## [2026-04-08] - Phase 2: All 6 task types + all input type renderers + progressive disclosure
- **5 new task type definitions**: Created `create.ts`, `transform.ts`, `analyze.ts`, `ideate.ts`, `execute.ts` in `src/registry/task-types/` — each exports a complete `TaskTemplate` with universal defaults, task defaults, task optionals, and universal optionals ending with `custom_fields`
- **Extended Ask with optional fields**: Added `knowledge_level` (task optional) and 13 universal optionals to `ask.ts` so all 6 types share the same progressive disclosure structure
- **Updated template-registry**: Replaced 5 stub entries (`fields: []`) with imported modules; changed `getTemplate()` return type from `TaskTemplate | undefined` to `TaskTemplate` (throws on unknown type)
- **FieldLabel component**: `src/components/editor/FieldLabel.tsx` — standardized label pattern with Chinese field names via `keyToLabelZh()` and Chinese operation hints (`自由输入文本`, `点击选择一项`, `添加列表项`, etc.). Integrated into IntentField, TextareaField, TextField
- **Expanded FIELD_LABELS_ZH**: Added 35 Chinese labels covering all field keys across all 6 task types
- **6 new field components**: SelectField (pill buttons), ComboField (pills + custom text input), ListField (with @dnd-kit drag-reorder), ToggleField (custom switch), NumberField (stepper +/−), KeyValueField (key-value pair manager)
- **Updated FieldRenderer**: Full dispatch for all 8 `InputType` variants; replaced Phase 1 fallbacks with dedicated components
- **Type system widening**: Changed `fieldValues` from `Record<string, string>` to `Record<string, unknown>` across App.tsx, PageLayout.tsx, EditorArea.tsx, useCompiler.ts; updated MarkdownFormatter to format arrays as bullet lists, booleans as 是/否, key-value pairs as `**key**: value`
- **AddFieldPanel**: Progressive disclosure panel with "★ 推荐" (task optionals), "其他" (universal optionals), "自定义字段" sections; Chinese descriptions for all optional fields
- **EditorArea integration**: Manages `addedFields` state, renders default + added optional fields, shows AddFieldPanel for remaining optionals; resets `addedFields` on task type switch
- **Refactored TextareaField/TextField props**: Changed from `(fieldKey, label, value, onChange)` to `(field, value, onChange)` — components now self-derive labels from `FieldDefinition`
- **New dependencies**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for ListField drag-reorder
- **Tests**: 72 total (was 15) — added `all-task-types.test.ts` (30 tests), `SelectField.test.tsx` (5), `ListField.test.tsx` (6), `AddFieldPanel.test.tsx` (7); updated `template-registry.test.ts` for new return type and populated Create fields
- **Build**: 298KB JS + 29KB CSS (was 228KB + 28KB)

## [2026-04-08] - Restructure CLAUDE.md into modular architecture
- Rewrote root `CLAUDE.md` as concise navigation hub (~95 lines): fixed stale project status ("Pre-implementation" → Phase 1 complete), corrected tech stack versions (React 19, TypeScript 6, Vite 8, Tailwind v4), replaced planned `src/` tree with actual structure, added `@/` path alias convention, added links to module-level CLAUDE.md files
- Created `src/registry/CLAUDE.md` — Template Registry guidance: types, how to add task types, field classification model, naming conventions
- Created `src/compiler/CLAUDE.md` — Compiler pipeline docs: two-stage flow (compileFields → Formatter), how to add formatters, hook integration
- Created `src/components/CLAUDE.md` — UI patterns: component hierarchy diagram, FieldRenderer switch pattern, state flow, task-switching behavior, shadcn/ui conventions

## [2026-04-07] - Add Chinese-first notes and fix defaults in Phase 2-6 plans
- **Phase 3**: Added Chinese-First Localization Note; fixed `getStoredLanguage()` fallback from `'en'` to `'zh'`; fixed `fallbackLng` from `'en'` to `'zh'`; fixed `outputLanguage` default state from `'en'` to `'zh'`; updated audit note to mention `keyToLabelZh()` alongside `keyToLabel()`; added notes about preserving canCopy/Intent glow/task-switch behaviors
- **Phase 4**: Added Chinese-First Localization Note; fixed `DEFAULT_PREFERENCES` `uiLanguage` and `defaultOutputLanguage` from `'en'` to `'zh'`; fixed HistoryModal `uiLanguage` fallback from `'en'` to `'zh'`; added notes about preserving canCopy/Intent glow/task-switch behaviors
- **Phase 5**: Added Chinese-First Localization Note; noted AiFillButton English placeholders will be replaced by i18n in Task 15; added notes about preserving canCopy/Intent glow/task-switch behaviors
- **Phase 6**: Added Chinese-First Localization Note; added notes about preserving canCopy/Intent glow/task-switch behaviors
- **Phase 2 Task 18**: Added critical warning about `setFieldValues({})` conflict with Intent preservation — replaced with `setAddedFields([])` only, since field-value reset is already handled by `handleSelectType` in App.tsx

## [2026-04-07] - Chinese-first UI, Intent field visual states, task switching UX
- **Chinese-first UI**: Switched all hardcoded UI strings from English to Chinese — TopBar (历史/设置), TaskSelector (verb.zh/mentalModel.zh), EditorArea, PreviewArea, IntentField, CopyButton, FieldRenderer; added `keyToLabelZh()` mapping in `src/lib/format.ts`; swapped language toggle to show 中 as active; updated CLAUDE.md with Language Priority section
- **Intent field**: Added focus tracking + conditional glow — red border/shadow when empty (status-danger), gold border/shadow when non-empty+focused (accent-primary), gold border only when non-empty+unfocused; added `--color-status-danger-shadow` CSS token in `src/index.css`
- **Copy button**: Disabled when Intent is empty — added `canCopy` prop chain through App→PageLayout→PreviewArea→CopyButton (separate from `hasContent` which controls preview display)
- **Task switching**: Intent value preserved when switching task types; confirmation dialog (`window.confirm`) shown when non-Intent fields have content; cancel aborts the switch
- **Intent non-focused state**: Changed non-empty + unfocused Intent border from always-gold to `border-border-default`, matching other fields' neutral state
- **Phase 2 plan**: Added Chinese-first localization note covering OPERATION_HINTS, FIELD_DESCRIPTIONS, enum option display labels, and FieldLabel displayName

## [2026-04-07] - Update Phase 2-6 plans with Phase 1 audit findings
- Updated tech stack sections in all 5 phase plans (Phase 2-6) to reflect actual versions: React 19.2, TypeScript 6, Vite 8, Tailwind CSS v4, Vitest 4.1
- Added audit note blocks to each phase plan referencing `.claude/progress/2026-04-07/02-phase-plan-audit.md`
- Fixed Phase 4 path typo: `.worktrees/clean-start` → `.worktrees/implementation`
- Updated Phase 6 Task 12 CSS to use Tailwind v4 `@theme {}` block instead of `:root` CSS variables
- Updated Phase 5 Task 7 CSS note to clarify keyframes go outside `@theme` block
- Added notes about unscoped `radix-ui` package for shadcn/ui Dialog in Phase 4
- Added note about `keyToLabel()` utility evaluation in Phase 3

## [2026-04-07] - Batch 8, Tasks 20-22: Wiring + Polish
- **Task 20**: Replaced stub `src/App.tsx` with full compile loop — `useState` for selectedType and fieldValues, `useCompiler` for output, `useCallback` handlers, renders `PageLayout` with all props wired
- **Task 21**: Updated `src/components/editor/EditorArea.tsx` to accept `selectedType` prop; added two empty states: "Select a task type" (no selection) and "Coming soon" (type selected but no fields). Updated `src/components/layout/PageLayout.tsx` to pass `selectedType` down to EditorArea
- **Task 22**: Added Google Fonts preconnect + Plus Jakarta Sans link to `index.html`; added `body` font-family stack (Plus Jakarta Sans → PingFang SC → Microsoft YaHei → Noto Sans SC → system-ui) with font smoothing to `src/index.css`

## [2026-04-07] - Batch 7, Tasks 16-19: EditorArea + PreviewArea + CopyButton + PageLayout
- **Task 16**: Created `src/components/editor/EditorArea.tsx` — separates intent field from other default fields, renders empty-state when no task type selected
- **Task 17**: Created `src/components/preview/PreviewArea.tsx` — monospace output pane with empty-state and CopyButton footer
- **Task 18**: Created `src/components/preview/CopyButton.tsx` — full-width button using `useClipboard` hook with idle/success/error states and disabled styling
- **Task 19**: Created `src/components/layout/PageLayout.tsx` — full-page layout composing TopBar, TaskSelector, EditorArea, and PreviewArea in a fixed 50/50 split

## [2026-04-07] - Batch 6, Tasks 13-15: Field Input Components
- **Task 13**: Created `src/components/editor/fields/TextareaField.tsx` — auto-expanding textarea with label, design tokens, and `minHeight` prop; created `src/components/editor/fields/TextField.tsx` — single-line input with matching styling
- **Task 14**: Created `src/components/editor/IntentField.tsx` — elevated textarea with golden `border-accent-primary` border, 4px shadow glow via CSS custom property, and auto-expand behavior
- **Task 15**: Created `src/components/editor/FieldRenderer.tsx` — switch-based router mapping `FieldDefinition.inputType` to TextareaField/TextField; Phase 1 fallbacks for `select`, `combo`, `list`

## [2026-04-07] - Batch 5, Tasks 10-12: Layout + Task Selection UI
- **Task 10**: Created `src/components/layout/TopBar.tsx` — fixed top bar with logo, disabled History/Settings buttons, and EN/中 language toggle pill
- **Task 11**: Created `src/components/task-selector/TaskCard.tsx` — button card with default/selected/hover visual states using design tokens
- **Task 12**: Created `src/components/task-selector/TaskSelector.tsx` — responsive 6-col (≥1280px) / 3-col (<1280px) grid consuming `getAllTaskTypes()` from registry

## [2026-04-07] - Batch 4, Tasks 8-9: React Hooks
- **Task 8**: Created `src/hooks/useCompiler.ts` — `useCompiler(fieldDefinitions, fieldValues, format)` wraps `compileFields` + `getFormatter` in `useMemo`; returns `{ compiledOutput, hasContent }`
- **Task 9**: Created `src/hooks/useClipboard.ts` — `useClipboard(resetDelay)` wraps `navigator.clipboard.writeText`; returns `{ status, copy }` with `'idle' | 'success' | 'error'` states and auto-reset via `useRef` timeout

## [2026-04-07] - Batch 3, Tasks 6-7: Compiler Engine + Markdown Formatter (TDD)
- **Task 6**: Created `src/compiler/compiler.ts` — `compileFields()` iterates field definitions in order, omits empty values, generates human-readable labels via `keyToLabel()`; created `tests/compiler/compiler.test.ts` with 5 tests (all pass)
- **Task 7**: Created `src/formatters/markdown.ts` — `MarkdownFormatter` class implementing `Formatter` interface with `# Label\nvalue` sections separated by blank lines; created `src/formatters/index.ts` — `getFormatter()` registry + re-export; created `tests/formatters/markdown.test.ts` with 5 tests (all pass)

## [2026-04-07] - Batch 2, Task 5: Template Registry with Ask Task Type (TDD)
- Created `tests/registry/template-registry.test.ts` — 5 tests covering: all 6 task types presence, Ask default fields order, intent required flag, input type correctness, other templates stub existence
- Created `src/registry/task-types/ask.ts` — 7 field definitions for Ask task type (intent, context, requirements, constraints, output_format, question_type, audience)
- Created `src/registry/template-registry.ts` — `getTemplate()` and `getAllTaskTypes()` with all 6 task type stubs
- All 5 tests pass; `npx tsc --noEmit` clean

## [2026-04-07] - Batch 2, Task 4: Core Shared Types
- Created `src/registry/types.ts` — `InputType`, `TaskType`, `FieldScope`, `FieldVisibility`, `FieldDefinition`, `TaskTemplate`
- Created `src/compiler/types.ts` — `OutputFormat`, `Language`, `OrderedField`, `Formatter`
- Created `src/types/index.ts` — barrel re-export of all types
- Verified `npx tsc --noEmit` passes with no errors

## [2026-04-07] - Project Scaffolding (Batch 1, Tasks 1-3)
- **Task 1**: Scaffolded Vite 8 + React 19 + TypeScript 6 project; created `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `eslint.config.js`; added `strict: true` to tsconfig
- **Task 2**: Configured Tailwind CSS v4 via `@tailwindcss/postcss` with design tokens in `src/index.css`; manually created `components.json` (shadcn init couldn't resolve alias); added `src/lib/utils.ts` and `src/components/ui/button.tsx` from shadcn; added `@` path alias in `tsconfig.app.json` and `vite.config.ts`
- **Task 3**: Installed Vitest + React Testing Library + jsdom; created `tests/setup.ts`; added `test`/`test:watch` scripts to `package.json`

## [2026-04-07] - Initialize repository with CLAUDE.md and README.md
- Created `CLAUDE.md` with project overview, tech stack, architecture, conventions, and implementation phases
- Created `README.md` (EN) and `README.zh.md` (ZH) — features, tech stack, doc links; no unimplemented details
- Both files derived from existing specs in `docs/`

## [2026-04-07] - Create implementation plan
- Created `docs/plans/intent-compiler.md` with 6-phase vertical-slice implementation plan
- Phases: (1) Project Setup + Single-Task Compile Loop, (2) Complete Task Types + All Input Types + Progressive Disclosure, (3) All Output Formats + i18n, (4) Persistence — Settings + History, (5) AI-Enhanced Mode, (6) Help System + Edge States + Visual Polish
- User story 21 (custom template save/reuse) deferred to future version