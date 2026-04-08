# Verification Focus: 2026-04-08

## Must Verify

| Item | Status | Comment |
|------|--------|---------|
| 15 unit tests pass: `npm run test` — covers registry, compiler, and markdown formatter | PASS | 15/15 pass, 921ms |
| Production build succeeds: `npm run build` — should produce ~228KB JS + ~28KB CSS | PASS | 228.59KB JS + 28.17KB CSS, built in 704ms |
| Dev server starts: `npm run dev` — app loads with cream background, top bar, 6 task cards | PASS | HTTP 200; Playwright confirms cream bg, top bar with logo, 6 Chinese task cards |

## Should Verify

| Item | Status | Comment |
|------|--------|---------|
| Module CLAUDE.md files are accurate after ba129e2 restructuring: check `src/registry/CLAUDE.md`, `src/compiler/CLAUDE.md`, `src/components/CLAUDE.md` against actual code | PASS | All 3 accurate; minor: compiler/CLAUDE.md references ../formatters/ correctly but framing could be clearer |
| Phase 2 plan (`docs/superpowers/plans/2026-04-07-intent-compiler-phase2-task-types.md`) incorporates all 13 audit findings from `.claude/progress/2026-04-07/02-phase-plan-audit.md` | PASS | All 13 items addressed — tech stack versions, Chinese-first notes, Intent glow, task-switch behavior |

## Safe to Ignore
- Non-Ask task types showing "即将推出" placeholder — intentional, Phase 2 scope
- Enum option labels still in English (e.g., question_type options) — Phase 2 will add Chinese labels
- shadcn Button CSS variables lint warning — expected, cosmetic fix deferred to Phase 6
- No i18n framework installed — react-i18next is Phase 3 scope
- No persistence — IndexedDB/Dexie.js is Phase 4 scope