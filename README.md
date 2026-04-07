# Intent Compiler

> A web-based tool for structuring AI prompts through guided, template-driven editing.

Intent Compiler helps you "compile" your intent into well-structured prompts. Select a task type, fill in the relevant fields, and get a clean, copy-ready prompt — no AI required by default, with optional AI-assisted field filling.

## Features

- **6 Task Types** — Ask, Create, Transform, Analyze, Ideate, Execute — each with tailored field templates
- **Progressive Disclosure** — Only essential fields shown by default; add optional fields as needed
- **4 Output Formats** — Markdown, JSON, YAML, XML — all first-class citizens
- **Live Preview** — See your compiled prompt update in real-time as you edit
- **Bilingual** — Full English and Chinese support for both UI and output
- **AI-Enhanced Mode** — Optional field filling via OpenAI or Anthropic APIs
- **Local Persistence** — Settings and compilation history stored in IndexedDB
- **Privacy-First** — Pure client-side SPA; API keys never leave your browser except to the AI provider

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v3** + **shadcn/ui**
- **react-i18next** for bilingual support
- **Dexie.js** for IndexedDB storage
- **Vitest** + **React Testing Library** for testing

## Getting Started

> [!NOTE]
> This project is under active development. Setup instructions will be added once the initial scaffolding is complete.

## Documentation

- [Product Requirements Document](docs/prd/intent-compiler-prd.md)
- [UI/UX Design Specification](docs/design/frontend-design.md)
- [Implementation Roadmap](docs/plans/intent-compiler-roadmap.md)

## License

[Apache License 2.0](LICENSE) — Copyright 2026 Simon Huang
