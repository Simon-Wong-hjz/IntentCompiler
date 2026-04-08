# Phase 1: Project Setup + Single-Task Compile Loop

**Status**: Complete (with post-Phase-1 UX refinements)
**Date**: 2026-04-07
**Branch**: `feat/implementation`
**Commits**: 28+ (35c035a..HEAD)

## What Was Built

End-to-end compile loop: user selects "Ask" task type, fills fields, sees live Markdown preview, copies result.

### Architecture (4-layer pipeline)

```
Registry (task schemas) → Compiler (order + filter) → Formatter (render) → UI (edit + preview)
```

### Actual Tech Stack (differs from original spec)

| Layer | Planned | Actual |
|-------|---------|--------|
| React | 18 | **19.2** |
| TypeScript | ~5.x | **6.0** |
| Vite | ~5.x | **8.0** |
| Tailwind CSS | v3 + tailwind.config.ts | **v4 + @tailwindcss/postcss + @theme block in CSS** |
| Vitest | ~1.x | **4.1** |
| shadcn/ui Radix | @radix-ui/* scoped | **radix-ui unscoped** |

### File Structure (27 source + 4 test files)

```
src/
├── App.tsx                             # Root: state + compile loop wiring
├── main.tsx                            # React DOM entry
├── index.css                           # Tailwind @theme tokens + body font
├── vite-env.d.ts                       # Vite env types
├── lib/
│   ├── utils.ts                        # cn() class merging
│   └── format.ts                       # keyToLabel() shared utility
├── registry/
│   ├── types.ts                        # TaskType, FieldDefinition, TaskTemplate, etc.
│   ├── template-registry.ts            # getTemplate(), getAllTaskTypes()
│   └── task-types/ask.ts              # Ask: 7 field definitions
├── compiler/
│   ├── types.ts                        # OrderedField, Formatter, OutputFormat
│   └── compiler.ts                     # compileFields() — order, filter, label
├── formatters/
│   ├── index.ts                        # getFormatter() registry
│   └── markdown.ts                     # MarkdownFormatter: # Section headers
├── hooks/
│   ├── useCompiler.ts                  # Reactive field → output via useMemo
│   └── useClipboard.ts                # Copy with idle/success/error states
├── components/
│   ├── ui/button.tsx                   # shadcn Button (not used in Phase 1 UI)
│   ├── layout/
│   │   ├── TopBar.tsx                  # Fixed header with logo + placeholder nav
│   │   └── PageLayout.tsx             # Full page: top bar + selector + 50/50 split
│   ├── task-selector/
│   │   ├── TaskCard.tsx               # Single card with default/selected/hover states
│   │   └── TaskSelector.tsx           # 6-card responsive grid
│   ├── editor/
│   │   ├── EditorArea.tsx             # Intent + field list + empty states (Chinese)
│   │   ├── IntentField.tsx            # Conditional glow: red when empty, gold when filled+focused
│   │   ├── FieldRenderer.tsx          # Routes field defs → input components (Chinese labels via keyToLabelZh)
│   │   └── fields/
│   │       ├── TextareaField.tsx      # Auto-expanding textarea
│   │       └── TextField.tsx          # Single-line text input
│   └── preview/
│       ├── PreviewArea.tsx            # Monospace output pane (accepts canCopy prop)
│       └── CopyButton.tsx            # 3-state copy button (Chinese labels)
└── types/
    └── index.ts                        # Barrel re-export

tests/
├── setup.ts                            # jest-dom/vitest setup
├── registry/template-registry.test.ts  # 5 tests
├── compiler/compiler.test.ts           # 5 tests
└── formatters/markdown.test.ts         # 5 tests
```

### Test Coverage

- **15 unit tests** across 3 files — all pass
- Registry: 6 task types, Ask field definitions, field ordering, input types
- Compiler: field ordering, empty omission, definition order, label generation
- Formatter: section headers, blank line separation, multiline, empty array, ordering

### Quality Checks

| Check | Status |
|-------|--------|
| `npm run test` | 15/15 pass |
| `npx tsc --noEmit` | Clean |
| `npm run build` | 224ms, 228KB JS + 28KB CSS |
| `npm run lint` | 0 errors, 1 warning (shadcn button, expected) |

## Key Implementation Decisions

1. **No tailwind.config.ts** — Tailwind v4 uses `@theme {}` in CSS instead
2. **vite.config.ts imports from `vitest/config`** — Required for Vitest 4 type compatibility
3. **`baseUrl` removed from tsconfig.app.json** — Deprecated in TS 6; `paths` works standalone
4. **`keyToLabel()` extracted to `src/lib/format.ts`** — Used by compiler for output labels; `keyToLabelZh()` added for Chinese UI labels
5. **select/combo/list fields use text/textarea fallbacks** — Proper input components deferred to Phase 2
6. **Non-Ask task types show "即将推出"** — Fields will be populated in Phase 2
7. **Chinese-first UI** — All UI strings default to Chinese; English is i18n secondary (Phase 3). See CLAUDE.md "Language Priority"
8. **Intent field conditional glow** — Red border+glow when empty (required indicator); gold border+glow when non-empty+focused; default border when non-empty+unfocused
9. **`canCopy` separated from `hasContent`** — Copy button disabled when Intent is empty (even if other fields have content); preview display still uses `hasContent`
10. **Task switching preserves Intent** — Intent value retained across type switches; confirmation dialog shown if non-Intent fields have content

## Known Gaps (by design, addressed in later phases)

- Only Ask task type has fields (Phase 2 adds remaining 5)
- Only Markdown output format (Phase 3 adds JSON/YAML/XML)
- No i18n framework — UI is hardcoded Chinese; react-i18next bilingual support deferred to Phase 3
- Enum option values still in English (Phase 2 will localize alongside proper Select/Combo components)
- No field help (?) buttons or operation hints (Phase 2: FieldLabel component)
- No persistence — settings/history lost on refresh (Phase 4)
- No AI-assisted field filling (Phase 5)
- No help system, keyboard shortcuts, or edge-state polish (Phase 6)
- shadcn Button CSS variables not mapped to design tokens (cosmetic, Phase 6)

## Impact on Subsequent Phases

The actual tech stack versions differ significantly from the original plans (React 19, TS 6, Tailwind v4, Vite 8, Vitest 4). Key implications:
- Phase 2-6 code snippets referencing `tailwind.config.ts` must use `@theme` block instead
- Any `vite.config.ts` modifications must keep the `vitest/config` import
- shadcn component additions via CLI may need manual file relocation (alias resolution issue)
- React 19 hook semantics should be verified for Phase 4-5 custom hooks
