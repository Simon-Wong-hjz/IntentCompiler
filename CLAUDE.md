# Intent Compiler - Claude Code Guide

## Project Overview

Intent Compiler is a structured intent builder that compiles user task intentions into stable, reusable prompts. It uses templates as entry points, Prompt IR as the core protocol, and Renderers as the output mechanism.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **State:** Zustand
- **Storage:** Dexie (IndexedDB)
- **Styling:** Tailwind CSS
- **Deploy:** Cloudflare Pages

## Documentation

- Product requirements: `docs/prd/` (17 modular files with YAML frontmatter)
- Architecture decisions: `docs/adr/`
- Doc index & agent guide: `docs/README.md`

## Conventions

- **Language:** Code and comments in English; docs may be in Chinese
- **Commits:** Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Changelog:** Update `.claude/changelog.md` with every change (same commit)
