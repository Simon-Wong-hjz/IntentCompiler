# Changelog

## [2026-04-05] - Create detailed MVP implementation plan
- Created `docs/plans/` with 9 files: overview + 8 chunks covering full MVP implementation
- Chunks: bootstrap & types, compiler & validator, renderers, data layer, template system, i18n/routing/layout, builder page, templates page & polish
- Plan includes TDD test code, exact file paths, complete implementations, and commit steps
- Based on all 17 PRD docs and ADR-001 architecture decisions

## [2026-04-05] - Reposition project for Agent era: emphasize intent compilation over prompt tooling
- **Renamed "Prompt IR" → "Intent IR"** across all 13 files (PRD, ADR, README, CLAUDE.md) and code type `PromptIR` → `IntentIR` in ADR
- **Updated output framing**: one-liners in README.md, CLAUDE.md, 01-summary.md now describe multi-target output (prompt, Agent instructions, etc.) instead of "stable prompt"
- **Redefined Renderer** as "输出适配层" (output adaptation layer) in 05-core-concepts.md and 11-rendering-strategy.md, with post-MVP targets for Agent instructions and MCP tool parameters
- **Adjusted non-goals** in 06-product-scope.md: changed from "Agent/Workflow Builder is a different direction" to "we compile intents, not execute them" — leaving Agent input adaptation as a natural extension
- **Added Agent era competitive analysis** in 03-competitive-analysis.md: new category "Agent IDE" (Claude Code, Cursor, Windsurf, Devin) with analysis of why intent compilation is upstream of Agent execution
- **Added "壁垒 6"** (Agent-era moat) to competitive defense section
- **Updated roadmap** Phase 4 in 14-roadmap.md: added Agent output adaptation and tool chain integration as explicit goals
- **Updated IR role boundaries** in 10-ir-schema-role.md: added "Agent 运行时状态管理" to non-responsibilities, added multi-target output to responsibilities
- **Updated ADR-001** overview to reflect multi-target output positioning

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
