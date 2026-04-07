# Phase 2-6 Plan Audit Against Phase 1 Implementation

**Date**: 2026-04-07
**Context**: Phase 1 used newer versions than plans assumed. This doc captures all conflicts.

## Breaking Conflicts (code snippets won't work as written)

### 1. Tailwind v4 — no `tailwind.config.ts`

- **Plans assume**: Tailwind v3 with `tailwind.config.ts` file
- **Actual**: Tailwind v4 with `@tailwindcss/postcss` + `@theme {}` block in `src/index.css`
- **Affects**: Phase 3 (token references), Phase 6 (CSS additions)
- **Fix**: Any CSS token additions go into `@theme {}` block, not a config file

### 2. Vite config imports from `vitest/config`

- **Plans assume**: `import { defineConfig } from 'vite'`
- **Actual**: `import { defineConfig } from 'vitest/config'` (required for Vitest 4 type compat)
- **Affects**: Any phase modifying `vite.config.ts`
- **Fix**: Keep the `vitest/config` import

### 3. TypeScript 6 — `baseUrl` removed

- **Plans assume**: `baseUrl` in tsconfig
- **Actual**: `baseUrl` removed (deprecated in TS 6). `@/` alias works via `paths` in `tsconfig.app.json` + Vite `resolve.alias`
- **Affects**: Any tsconfig modifications
- **Fix**: Don't re-add `baseUrl`

### 4. React 19.2 (not 18)

- **Plans state**: "React 18 + TypeScript"
- **Actual**: React 19.2.4
- **Affects**: Phase 2-6 tech stack sections, hook behavior assumptions
- **Fix**: Update tech stack references; verify hook semantics for Phase 4-5 custom hooks

### 5. Vitest 4.1 (not 1.x/2.x)

- **Plans assume**: Vitest 1.x/2.x
- **Actual**: Vitest 4.1.3
- **Affects**: Phase 2-6 tech stack sections
- **Fix**: Update references; API is mostly compatible

### 6. shadcn/ui uses `radix-ui` unscoped package

- **Plans assume**: `@radix-ui/react-*` scoped packages
- **Actual**: `radix-ui` (unified unscoped package)
- **Affects**: Phase 2 (if adding Select/Combobox), Phase 4-5 (if adding Dialog)
- **Fix**: Use unscoped imports; shadcn CLI may need manual file relocation due to alias resolution issue

## Important Conflicts (needs update, won't break immediately)

### 7. `keyToLabel()` in `src/lib/format.ts`

- Plans don't reference this shared utility
- Phase 3 introduces i18n field labels that may replace this function
- **Action**: When implementing Phase 3, evaluate whether `keyToLabel()` becomes obsolete or needs i18n-aware replacement

### 8. Phase execution order dependency

- Phase 3 stores UI language in localStorage
- Phase 4 migrates it to Dexie
- **Action**: Phase 3 must be fully implemented before Phase 4 persistence wiring

### 9. Path typo in Phase 4

- Phase 4 plan references `.worktrees/clean-start` instead of `.worktrees/implementation`
- **Action**: Use actual working directory when executing

## Recommendation

Before executing each Phase, update its plan's:
1. Tech stack section (React 19.2, TS 6, Tailwind v4, Vite 8, Vitest 4.1)
2. Code snippets referencing `tailwind.config.ts` → `@theme` block in `src/index.css`
3. Code snippets referencing `import { defineConfig } from 'vite'` → `from 'vitest/config'`
4. Any Radix imports to use unscoped `radix-ui` package

**The Phase 1 implementation is the source of truth** — plans should be adapted to match, not the other way around.
