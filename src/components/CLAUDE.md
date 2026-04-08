# Components Module

All React components for the Intent Compiler UI. The layout follows a fixed hierarchy:

```
App (state owner)
└── PageLayout
    ├── TopBar                    # Header with app title
    ├── TaskSelector              # Horizontal task type picker
    │   └── TaskCard × 6         # One card per task type
    └── Split pane (50/50)
        ├── EditorArea            # Left: dynamic form
        │   └── FieldRenderer × N # One per field definition
        │       └── TextField / TextareaField
        └── PreviewArea           # Right: live compiled output
            └── CopyButton        # Copy-to-clipboard
```

## Directory Layout

```
components/
├── layout/
│   ├── PageLayout.tsx     # Main shell — assembles all sections
│   └── TopBar.tsx         # App header bar
├── task-selector/
│   ├── TaskSelector.tsx   # Task type selection row
│   └── TaskCard.tsx       # Individual task type button/card
├── editor/
│   ├── EditorArea.tsx     # Left pane — iterates fields, renders FieldRenderer per field
│   ├── FieldRenderer.tsx  # Switch on inputType → delegates to specific field component
│   ├── IntentField.tsx    # Wrapper for the always-visible intent field
│   └── fields/
│       ├── TextField.tsx       # Single-line input
│       └── TextareaField.tsx   # Multi-line input
├── preview/
│   ├── PreviewArea.tsx    # Right pane — displays compiledOutput
│   └── CopyButton.tsx     # Copies output to clipboard (useClipboard hook)
└── ui/
    └── button.tsx         # shadcn/ui Button primitive
```

## Key Patterns

### FieldRenderer Switch

`FieldRenderer` maps `inputType` to the right component. Currently handles:
- `'textarea'` → `TextareaField`
- `'text'` → `TextField`
- `'list'` → `TextareaField` (with "每行输入一项" placeholder)
- `'select'` / `'combo'` → `TextField` (with options shown in label)
- Default fallback → `TextField`

Phase 2 will add dedicated components for `select`, `combo`, `toggle`, `number`, `key-value`.

### State Flow

All state lives in `App.tsx`:
- `selectedType: TaskType | null` — which task type is active
- `fieldValues: Record<string, string>` — user input keyed by field key

State flows down via props: `App → PageLayout → EditorArea/PreviewArea`. No context providers yet.

### Task Type Switching

When switching task types, `App.tsx` preserves the `intent` field value but clears everything else. If the user has filled non-intent fields, a `window.confirm()` dialog asks for confirmation.

## Conventions

- **Labels**: Derived from field keys via `keyToLabelZh()` (`lib/format.ts`), not hardcoded in components
- **Placeholders**: Chinese text (e.g., "自由输入", "每行输入一项") — will be i18n'd in Phase 3
- **shadcn/ui**: Use `components/ui/` primitives; add new ones via `npx shadcn@latest add <component>`
- **No direct DOM styling**: Use Tailwind utility classes only
