# Changelog

## [2026-04-02] - Prepare repo for initial GitHub push
- Added `README.md` with project overview, tech stack, and status
- Added `.gitignore` for Node.js/Vite project
- Added `LICENSE` (Apache License 2.0)
- Added `CLAUDE.md` with project conventions for Claude Code

## [2026-04-02] - Restructure PRD and ADR into agent-friendly docs
- Split monolithic `intent_compiler_prd.md` (2165 lines) into 17 focused documents under `docs/prd/`
- Moved ADR from `docs/superpowers/specs/` to `docs/adr/001-tech-stack-design.md`
- Added `docs/README.md` as an index with agent usage guide
- Each document has YAML frontmatter (title, section, tags) for machine readability
- Removed original `intent_compiler_prd.md` and `docs/superpowers/` directory
