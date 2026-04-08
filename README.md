# Intent Compiler

> A web-based tool for structuring AI prompts through guided, template-driven editing.

Intent Compiler helps you "compile" your intent into well-structured prompts. Select a task type, fill in the relevant fields, and get a clean, copy-ready prompt — no AI required by default, with optional AI-assisted field filling.

## Features

- **6 Task Types** — Ask, Create, Transform, Analyze, Ideate, Execute — each with tailored field templates
- **Progressive Disclosure** — Only essential fields shown by default; add optional fields as needed
- **Live Preview** — See your compiled prompt update in real-time as you edit
- **Markdown Output** — Compiled prompts in Markdown format (JSON, YAML, XML planned for Phase 3)
- **Privacy-First** — Pure client-side SPA; no backend server required
- **Bilingual** — Full English and Chinese support *(planned — Phase 3)*
- **AI-Enhanced Mode** — Optional field filling via OpenAI or Anthropic APIs *(planned — Phase 5)*
- **Local Persistence** — Settings and compilation history stored in IndexedDB *(planned — Phase 4)*

## Tech Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4** + **shadcn/ui**
- **react-i18next** for bilingual support (Phase 3)
- **Dexie.js** for IndexedDB storage (Phase 4)
- **Vitest** + **React Testing Library** for testing

## Getting Started

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run lint         # ESLint check
```

## Documentation

- [Product Requirements Document](docs/prd/intent-compiler-prd.md)
- [UI/UX Design Specification](docs/design/frontend-design.md)
- [Implementation Roadmap](docs/plans/intent-compiler-roadmap.md)

## License

[Apache License 2.0](LICENSE) — Copyright 2026 Simon Huang
