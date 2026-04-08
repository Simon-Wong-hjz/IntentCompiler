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

### 7. Chinese-first UI — plans assume English

- **Plans assume**: English UI text, i18n added in Phase 3
- **Actual**: All UI strings are now Chinese by default. `keyToLabelZh()` in `src/lib/format.ts` provides Chinese field labels. Language toggle shows 中 as active.
- **Affects**: Phase 2 (OPERATION_HINTS, FIELD_DESCRIPTIONS, enum option labels), Phase 3 (default locale should be `zh`, not `en`)
- **Fix**: All new user-facing strings must be Chinese. Phase 2 plan already has a "Chinese-First Localization Note" at the top. See CLAUDE.md "Language Priority" section.

### 8. Intent field has conditional visual states

- **Plans assume**: IntentField always has golden border and glow
- **Actual**: Three states — red border+glow when empty, gold border+glow when non-empty+focused, default border when non-empty+unfocused. `--color-status-danger-shadow` CSS token added.
- **Affects**: Phase 2 Task 8 (FieldLabel integration into IntentField) must preserve conditional glow logic
- **Fix**: When modifying IntentField, keep the `isEmpty`/`isFocused` state tracking and conditional `className`/`style`

### 9. Copy button disabled by Intent emptiness

- **Plans assume**: Copy disabled when `!hasContent` (no compiled output)
- **Actual**: Copy disabled when `!canCopy` — requires both content AND non-empty Intent. `canCopy` prop threaded through App→PageLayout→PreviewArea.
- **Affects**: Any phase modifying PreviewArea or CopyButton props
- **Fix**: Preserve the `canCopy` / `hasContent` separation

### 10. Task switching preserves Intent + shows confirmation

- **Plans assume**: Task switch clears all field values (Phase 2 Task 18 adds `setFieldValues({})` in a `useEffect`)
- **Actual**: `handleSelectType` in App.tsx preserves Intent value, shows `window.confirm` if non-Intent fields have content, and aborts on cancel.
- **Affects**: Phase 2 Task 18 (task-switch reset) — must NOT override this behavior with a blanket `setFieldValues({})`
- **Fix**: Phase 2 Task 18 should be skipped or adapted to work with existing App.tsx logic. The `addedFields` reset can be added to App.tsx's `handleSelectType` callback.

## Important Conflicts (needs update, won't break immediately)

### 11. `keyToLabel()` and `keyToLabelZh()` in `src/lib/format.ts`

- Plans don't reference these shared utilities
- `keyToLabel()` is used by the compiler for output section headers (English)
- `keyToLabelZh()` is used by FieldRenderer for Chinese UI labels
- Phase 3 introduces i18n field labels that may replace both functions
- **Action**: When implementing Phase 3, evaluate whether these become obsolete or need i18n-aware replacement

### 12. Phase execution order dependency

- Phase 3 stores UI language in localStorage
- Phase 4 migrates it to Dexie
- **Action**: Phase 3 must be fully implemented before Phase 4 persistence wiring

### 13. Path typo in Phase 4

- Phase 4 plan references `.worktrees/clean-start` instead of `.worktrees/implementation`
- **Action**: Use actual working directory when executing

## Recommendation

Before executing each Phase, update its plan's:
1. Tech stack section (React 19.2, TS 6, Tailwind v4, Vite 8, Vitest 4.1)
2. Code snippets referencing `tailwind.config.ts` → `@theme` block in `src/index.css`
3. Code snippets referencing `import { defineConfig } from 'vite'` → `from 'vitest/config'`
4. Any Radix imports to use unscoped `radix-ui` package

**The Phase 1 implementation is the source of truth** — plans should be adapted to match, not the other way around.
