# Intent Compiler

A web-based tool for structuring AI prompts through guided, template-driven editing. Users "compile" their intent into well-structured prompts across 6 task types, with optional AI-assisted field filling.

## Project Status

**Current Phase**: Phase 3 complete (JSON/YAML/XML formatters + react-i18next bilingual support)
**Next**: Phase 4 — Dexie.js persistence (settings modal + history modal)

### Key Specs

- **PRD**: `docs/prd/intent-compiler-prd.md` — 32 user stories, field definitions, module design
- **UI/UX Design**: `docs/design/frontend-design.md` — Layout, components, color tokens, typography
- **Roadmap**: `docs/plans/intent-compiler-roadmap.md` — 6-phase vertical-slice plan
- **Phase Plans**: `docs/superpowers/plans/` — Detailed per-phase plans with acceptance criteria

## Module Guidelines

- [Registry — Template & field schemas](src/registry/CLAUDE.md)
- [Compiler — Compilation pipeline & formatters](src/compiler/CLAUDE.md)
- [Components — UI patterns & layout](src/components/CLAUDE.md)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| UI | Tailwind CSS v4 + shadcn/ui |
| i18n | react-i18next |
| Storage | IndexedDB via Dexie.js (Phase 4) |
| Serialization | js-yaml, fast-xml-parser |
| Testing | Vitest + React Testing Library + jsdom |
| Deployment | Static build → Nginx (Alibaba Cloud) |

## Project Structure

```
src/
├── App.tsx                  # Root component — state management, task selection
├── main.tsx                 # Entry point
├── registry/                # Template Registry — task type schemas + field configs
├── compiler/                # Compiler — field data → OrderedField[] → formatted string
├── formatters/              # Output formatters (Markdown, JSON, YAML, XML)
├── components/
│   ├── layout/              # PageLayout, TopBar — app shell
│   ├── task-selector/       # TaskSelector, TaskCard — type picker
│   ├── editor/              # EditorArea, FieldRenderer, field components
│   ├── preview/             # PreviewArea, PreviewHeader, CopyButton — live output
│   └── ui/                  # shadcn/ui primitives (button, etc.)
├── i18n/                    # i18n config + locale files (en.json, zh.json)
├── hooks/                   # useCompiler, useClipboard
├── lib/                     # Utilities — format.ts, utils.ts
└── types/                   # Re-exports from registry + compiler types
```

## Development Conventions

- **Path alias**: `@/` maps to `src/` (configured in vite.config.ts + tsconfig)
- **TypeScript strict mode** enabled
- **Functional components** with hooks; no class components
- **Tailwind utility classes**; use shadcn/ui components where applicable
- **Chinese-first UI**: See Language Priority section below
- **Co-located tests**: `foo.ts` → `foo.test.ts` in the same directory
- **Type re-exports**: Shared types go through `src/types/index.ts`
- **Playwright screenshots**: Never save to the project root. Use the system temp directory (e.g. `os.tmpdir()` / `$TMPDIR`) for all Playwright screenshots and artifacts

### Build & Run

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run Vitest
npm run lint         # ESLint check
```

## Implementation Phases

1. **Phase 1** ✅: Project setup + Ask task type + Markdown compile loop
2. **Phase 2** ✅: All 6 task types + all input type renderers + progressive disclosure
3. **Phase 3** ✅: JSON/YAML/XML formatters + react-i18next bilingual support
4. **Phase 4**: Dexie.js persistence — settings modal + history modal
5. **Phase 5**: AI-enhanced mode — OpenAI + Anthropic field filling
6. **Phase 6**: Help system + edge states + visual polish

## Design Identity

- **Brand**: "Sunflower + Ink" — golden yellow (#f5c518) on cream (#fffdf5), rich black (#1a1a1a)
- **Typography**: Plus Jakarta Sans (Latin) + system fonts (Chinese)
- **Layout**: Fixed top bar → task selector → 50/50 split (editor | preview)
- **Minimum viewport**: 1024px (desktop-first; mobile deferred)

## Language Priority

- **Chinese (中文) is the primary UI language**; English is the i18n secondary language
- All UI text defaults to Chinese; English translations available via react-i18next
- When adding new user-facing strings, always write Chinese first
- The compiled prompt output follows the UI language
- **UI terminology**: Frontend uses "项目" (items) instead of "字段" (fields) to be friendlier to non-technical users. Code internals still use "field".

## Key Decisions

- **No backend**: Pure frontend SPA. AI calls go directly from browser to provider API.
- **Template Registry is single source of truth**: All field definitions, scopes, and grouping centralized.
- **Progressive disclosure**: Only default fields shown; optional fields in collapsible panel.
- **All 4 output formats are first-class**: MD, JSON, YAML, XML — not afterthoughts.
