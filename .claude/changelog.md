# Changelog

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