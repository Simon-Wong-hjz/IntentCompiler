# Changelog

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