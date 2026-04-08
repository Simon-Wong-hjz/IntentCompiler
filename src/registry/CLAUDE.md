# Registry Module

The Template Registry is the **single source of truth** for all task type definitions and field configurations. Every field the user sees in the editor originates from a `TaskTemplate` registered here.

## Key Types (`types.ts`)

- **`TaskType`**: Union of 6 task identifiers — `'ask' | 'create' | 'transform' | 'analyze' | 'ideate' | 'execute'`
- **`InputType`**: How a field renders — `'textarea' | 'text' | 'select' | 'combo' | 'list' | 'toggle' | 'number' | 'key-value'`
- **`FieldDefinition`**: Describes one field — `key`, `inputType`, `scope` (universal/task), `visibility` (default/optional), optional `options[]`, optional `required`
- **`TaskTemplate`**: Combines a `TaskType` with bilingual `verb`/`mentalModel` labels and a `fields[]` array

## File Layout

```
registry/
├── types.ts               # Type definitions (TaskType, FieldDefinition, TaskTemplate)
├── template-registry.ts   # Central registry — getTemplate(), getAllTaskTypes()
└── task-types/
    └── ask.ts             # Ask task field definitions (Phase 1)
    # create.ts, transform.ts, etc. will be added in Phase 2
```

## How to Add a New Task Type

1. Create `task-types/<type>.ts` exporting a `FieldDefinition[]` array (follow `ask.ts` as reference)
2. Import it in `template-registry.ts` and add a `TaskTemplate` entry to the `templates` array
3. The field order in the array determines render order in the editor

## Field Classification Model

Every field has two independent axes:
- **Scope**: `'universal'` (appears in all task types, e.g., intent) or `'task'` (task-specific)
- **Visibility**: `'default'` (shown immediately) or `'optional'` (hidden in "Add Field" panel)

Phase 2 will implement progressive disclosure — filtering fields by visibility.

## Conventions

- Field `key` values use `camelCase` (e.g., `'outputFormat'`, `'targetAudience'`)
- Bilingual strings use `{ en: string; zh: string }` — Chinese is primary
- The `templates` array in `template-registry.ts` is not exported; access via `getTemplate()` / `getAllTaskTypes()`
