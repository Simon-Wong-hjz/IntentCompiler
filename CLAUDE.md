# Intent Compiler

A web-based tool for structuring AI prompts through guided, template-driven editing. Users "compile" their intent into well-structured prompts across 6 task types, with optional AI-assisted field filling.

## Project Status

**Phase**: Pre-implementation (specs complete, ready to build)

### Key Specs

- **PRD**: `docs/prd/intent-compiler-prd.md` — 32 user stories, field definitions, module design
- **UI/UX Design**: `docs/design/frontend-design.md` — Layout, components, color tokens, typography
- **Roadmap**: `docs/plans/intent-compiler-roadmap.md` — 6-phase vertical-slice plan
- **Phase Plans**: `docs/superpowers/plans/` — Detailed per-phase implementation plans with acceptance criteria

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| UI | Tailwind CSS v3 + shadcn/ui |
| i18n | react-i18next |
| Storage | IndexedDB via Dexie.js |
| Serialization | js-yaml, fast-xml-parser |
| Testing | Vitest + React Testing Library + jsdom |
| Deployment | Static build → Nginx (Alibaba Cloud) |

## Architecture

### Core Modules

```
src/
├── registry/       # Template Registry — 6 task type schemas + field configs
├── compiler/       # Compiler — field data → ordered structured output
├── formatters/     # Output Formatter — MD, JSON, YAML, XML serializers
├── components/     # Editor UI — split-pane editor + live preview
├── i18n/           # Bilingual UI + output language support (EN/ZH)
├── ai/             # AI Connector — optional OpenAI + Anthropic field filling
└── storage/        # Dexie.js — preferences, history, custom templates
```

### 6 Task Types

| Type | Verb | Mental Model |
|------|------|-------------|
| Ask | Ask / 提问 | "I want to know something" |
| Create | Create / 创作 | "I want to make something" |
| Transform | Transform / 转化 | "I have content, change its form" |
| Analyze | Analyze / 分析 | "Help me judge / understand" |
| Ideate | Ideate / 构思 | "Help me think / design" |
| Execute | Execute / 执行 | "Do a multi-step task for me" |

### Field Classification Model

Every field has two independent attributes:
- **Scope**: Universal (all task types) or Task-specific
- **Visibility**: Default (shown immediately) or Optional (in "Add Field" panel)

These are configured per task type in the Template Registry.

## Development Conventions

### Code Style

- TypeScript strict mode enabled
- Functional React components with hooks
- Tailwind utility classes; use shadcn/ui components where applicable
- All UI text must go through i18n (`useTranslation` hook), never hardcoded strings

### Testing Strategy

- **Unit test**: Template Registry, Compiler, Output Formatters — test behavior, not implementation
- **Integration test**: Storage (Dexie.js) CRUD and schema versioning
- **Manual/visual review**: Editor UI, i18n, AI Connector
- Test files live alongside source: `foo.ts` → `foo.test.ts`

### Build & Run (once scaffolded)

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run Vitest
npm run lint         # Lint check
```

## Implementation Phases

1. **Phase 1**: Project setup + Ask task type + Markdown compile loop
2. **Phase 2**: All 6 task types + all input type renderers + progressive disclosure
3. **Phase 3**: JSON/YAML/XML formatters + react-i18next bilingual support
4. **Phase 4**: Dexie.js persistence — settings modal + history modal
5. **Phase 5**: AI-enhanced mode — OpenAI + Anthropic field filling
6. **Phase 6**: Help system + edge states + visual polish

Each phase has detailed acceptance criteria in `docs/superpowers/plans/`.

## Design Identity

- **Brand**: "Sunflower + Ink" — golden yellow (#f5c518) on cream (#fffdf5), rich black (#1a1a1a)
- **Typography**: Plus Jakarta Sans (Latin) + system fonts (Chinese)
- **Layout**: Fixed top bar → task selector → 50/50 split (editor | preview)
- **Minimum viewport**: 1024px (desktop-first; mobile deferred)

## Key Decisions

- **No backend**: Pure frontend SPA. AI calls go directly from browser to provider API.
- **Template Registry is single source of truth**: All field definitions, scopes, and grouping centralized.
- **Progressive disclosure**: Only default fields shown; optional fields in collapsible panel.
- **Bilingual from day one**: All UI and output support EN/ZH.
- **All 4 output formats are first-class**: MD, JSON, YAML, XML — not afterthoughts.
