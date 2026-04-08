# Documentation Debt: 2026-04-08

## README.md
- [ ] Tech stack says "React 18" — actual is React 19.2; update to match CLAUDE.md
- [ ] Tech stack says "Tailwind CSS v3" — actual is Tailwind CSS v4; update to match
- [ ] Tech stack lists "Vite" without version — actual is Vite 8
- [ ] Tech stack lists "TypeScript" without version — actual is TypeScript 6
- [ ] Tech stack says "Vitest" without version — actual is Vitest 4.1
- [ ] Features section lists all 6 phases' features as if built (bilingual, AI mode, persistence, 4 formats) — should indicate current state or add "planned" markers
- [ ] Getting Started says "Setup instructions will be added once the initial scaffolding is complete" — scaffolding IS complete; add `npm install && npm run dev`
- [ ] Missing build/test commands that exist in CLAUDE.md

## docs/
- [ ] `docs/plans/intent-compiler-roadmap.md` — top-level tech stack doesn't specify versions ("React + TypeScript, Vite"); should match CLAUDE.md versions (React 19, TS 6, Vite 8, etc.)
- [ ] `docs/plans/intent-compiler-roadmap.md` — Phase 1 acceptance criteria still has unchecked `- [ ]` checkboxes; could be confusing since Phase 1 is complete; consider checking them off or noting completion