# Changelog

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