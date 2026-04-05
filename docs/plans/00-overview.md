# Intent Compiler MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based intent compiler that transforms user task intentions into structured Intent IR and renders them into reusable prompts — no backend, no AI required for core flow.

**Architecture:** SPA with React 19 + TypeScript. Core pipeline: Form State (Zustand) → IR Compiler → Intent IR (canonical JSON) → Renderer → Prompt Output. All data persisted locally via Dexie (IndexedDB). Template presets provide task-type-specific form configurations.

**Tech Stack:** React 19, Vite, TypeScript (strict), Zustand, Dexie 4, Tailwind CSS, shadcn/ui, react-hook-form + zod, React Router v7, react-i18next, Vitest

---

## File Structure Overview

```
src/
  core/
    ir/
      types.ts              # Intent IR TypeScript types (from JSON Schema v0.2)
      form-types.ts         # Builder form state types
      compiler.ts           # Form state → Intent IR compilation
      validator.ts          # IR validation rules (R-001 ~ R-006)
      schema.ts             # Zod schema for IR validation
      __tests__/
    renderer/
      types.ts              # Renderer interfaces
      natural-language.ts   # Pure NL renderer
      hybrid-json.ts        # Mixed JSON renderer (default)
      hybrid-text.ts        # Mixed text renderer
      pure-json.ts          # Pure JSON renderer
      field-promotion.ts    # Field-tiered rendering logic
      index.ts              # Renderer registry + factory
      __tests__/
    template/
      types.ts              # Template definition types
      presets/               # 8 built-in task type templates
        index.ts
        production-evaluation.ts
        mechanism-check.ts
        problem-modeling.ts
        quick-lookup.ts
        code-generation.ts
        comparison-decision.ts
        open-exploration.ts
        text-rewrite.ts
      __tests__/
  features/
    home/
      HomePage.tsx
      components/
        TemplateCard.tsx
        RecentDrafts.tsx
    builder/
      BuilderPage.tsx
      components/
        BuilderForm.tsx       # Main form (react-hook-form)
        FieldGroup.tsx        # Collapsible field sections
        PreviewPanel.tsx      # Right-side rendered output
        RendererSelector.tsx  # Render mode toggle
        ValidationWarnings.tsx
        CopyExportBar.tsx     # Copy/save/export actions
    templates/
      TemplatesPage.tsx
      components/
        TemplateList.tsx
        TemplateDetail.tsx
  shared/
    components/
      Layout.tsx             # App shell with nav
      AppNav.tsx
    hooks/
      useDebounce.ts
      useCompiler.ts         # Form → IR → Render pipeline hook
      useDraft.ts            # Auto-save draft hook
    db/
      index.ts               # Dexie instance + schema
      operations.ts          # CRUD helpers
    stores/
      builder-store.ts       # Form state + compile state
      app-store.ts           # UI preferences, active route context
    i18n/
      index.ts               # i18next config
      zh.json
      en.json
  App.tsx
  main.tsx
  router.tsx                 # React Router config
```

---

## Chunks

| Chunk | File | Description |
|-------|------|-------------|
| 1 | [01-bootstrap-types.md](01-bootstrap-types.md) | Project scaffold, Tailwind, Vitest, IR types, Zod schema |
| 2 | [02-compiler-validator.md](02-compiler-validator.md) | Form types, IR Compiler, IR Validator (R-002~R-006) |
| 3 | [03-renderers.md](03-renderers.md) | Field promotion, 4 renderers (NL, hybrid-json, hybrid-text, pure-json) |
| 4 | [04-data-layer.md](04-data-layer.md) | Dexie DB, Zustand stores, auto-save draft hook |
| 5 | [05-template-system.md](05-template-system.md) | Template types, 8 task-type presets |
| 6 | [06-ui-layout-home.md](06-ui-layout-home.md) | i18n, React Router, Layout shell, Home page |
| 7 | [07-ui-builder.md](07-ui-builder.md) | Builder page — form, preview panel, copy/export |
| 8 | [08-ui-templates-polish.md](08-ui-templates-polish.md) | Template management page, final integration |
