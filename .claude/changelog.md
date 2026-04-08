# Changelog

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