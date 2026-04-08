# Registry Module

The Template Registry is the **single source of truth** for all task type definitions and field configurations. Every field the user sees in the editor originates from a `TaskTemplate` registered here.

## Key Types (`types.ts`)

- **`TaskType`**: Union of 6 task identifiers — `'ask' | 'create' | 'transform' | 'analyze' | 'ideate' | 'execute'`
- **`InputType`**: How a field renders — `'textarea' | 'text' | 'combo' | 'list' | 'toggle' | 'number' | 'key-value'`
- **`FieldDefinition`**: Describes one field — `key`, `inputType`, `scope` (universal/task), `visibility` (default/optional), optional `options[]`, optional `required`
- **`TaskTemplate`**: Combines a `TaskType` with bilingual `verb`/`mentalModel` labels and a `fields[]` array

## File Layout

```
registry/
├── types.ts               # Type definitions (TaskType, FieldDefinition, TaskTemplate)
├── template-registry.ts   # Central registry — getTemplate(), getAllTaskTypes()
└── task-types/
    ├── ask.ts             # Ask task (7 defaults + 14 optionals)
    ├── create.ts          # Create task (8 defaults + 16 optionals)
    ├── transform.ts       # Transform task (7 defaults + 15 optionals)
    ├── analyze.ts         # Analyze task (8 defaults + 15 optionals)
    ├── ideate.ts          # Ideate task (9 defaults + 14 optionals)
    └── execute.ts         # Execute task (7 defaults + 16 optionals)
```

## How to Add a New Task Type

1. Create `task-types/<type>.ts` exporting a `TaskTemplate` object (follow `create.ts` as reference) — or export a `FieldDefinition[]` array (like `ask.ts`)
2. Import it in `template-registry.ts` and add it to the `templates` array
3. The field order in the array determines render order in the editor
4. All task types should end with `custom_fields` (key-value, universal, optional) as the last field

## Field Classification Model

Every field has two independent axes:
- **Scope**: `'universal'` (appears in all task types, e.g., intent) or `'task'` (task-specific)
- **Visibility**: `'default'` (shown immediately) or `'optional'` (hidden in "Add Field" panel)

Progressive disclosure is implemented in `EditorArea` — default fields are always shown, optional fields appear in the `AddFieldPanel` until the user adds them.

## Conventions

- Field `key` values use `snake_case` (e.g., `'output_format'`, `'target_length'`)
- Bilingual strings use `{ en: string; zh: string }` — Chinese is primary
- The `templates` array in `template-registry.ts` is not exported; access via `getTemplate()` / `getAllTaskTypes()`
