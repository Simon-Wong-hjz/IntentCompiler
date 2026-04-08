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
        │   ├── IntentField       # Always first, elevated styling
        │   ├── FieldRenderer × N # One per field definition
        │   │   └── TextField / TextareaField / ComboField / ListField
        │   │       / ToggleField / NumberField / KeyValueField
        │   └── AddFieldPanel     # Progressive disclosure for optional fields
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
│   ├── EditorArea.tsx     # Left pane — iterates fields, manages addedFields state
│   ├── FieldRenderer.tsx  # Switch on inputType → delegates to specific field component
│   ├── FieldLabel.tsx     # Standardized label: Chinese name + [?] + operation hint
│   ├── IntentField.tsx    # Elevated intent field with focus/empty glow states
│   ├── AddFieldPanel.tsx  # Progressive disclosure panel (★ 推荐 / 其他 / 自定义字段)
│   └── fields/
│       ├── TextField.tsx       # Single-line input
│       ├── TextareaField.tsx   # Multi-line auto-expanding input
│       ├── (SelectField removed — merged into ComboField)
│       ├── ComboField.tsx      # Pill buttons + custom text input
│       ├── ListField.tsx       # Ordered list with @dnd-kit drag-reorder
│       ├── ToggleField.tsx     # Custom toggle switch (是/否)
│       ├── NumberField.tsx     # Stepper with +/− buttons
│       └── KeyValueField.tsx   # Key-value pair manager
├── modals/
│   ├── SettingsModal.tsx  # Output defaults + AI configuration (API type, key, endpoint, model)
│   └── HistoryModal.tsx   # Sorted history records with load/delete/clear confirmations
├── preview/
│   ├── PreviewArea.tsx    # Right pane — displays compiledOutput
│   └── CopyButton.tsx     # Copies output to clipboard (useClipboard hook)
└── ui/
    └── button.tsx         # shadcn/ui Button primitive
```

## Key Patterns

### FieldRenderer Switch

`FieldRenderer` maps `inputType` to the right component:
- `'textarea'` → `TextareaField`
- `'text'` → `TextField`
- `'combo'` → `ComboField` (pills + text input; selecting a pill clears text and vice versa. Replaces former SelectField)
- `'list'` → `ListField` (ordered items with add/edit/delete/drag-reorder via @dnd-kit)
- `'toggle'` → `ToggleField` (custom switch, 是/否 label)
- `'number'` → `NumberField` (stepper with direct input)
- `'key-value'` → `KeyValueField` (add/delete key-value pairs)
- Default fallback → `TextField`

### FieldLabel Pattern

All field components use `FieldLabel` which renders: **Chinese label** (via `keyToLabelZh()`) + **[?] badge** + **Chinese operation hint** (e.g., "自由输入文本", "点击选择一项").

### Modal Patterns

Both `SettingsModal` and `HistoryModal` follow the same interaction pattern:
- **Backdrop click**: Clicking the backdrop overlay (`ref={backdropRef}`) closes the modal
- **Escape key**: A `useEffect` listener on `keydown` calls `onClose()` on Escape. In `HistoryModal`, Escape first dismisses any active confirmation prompt before closing the modal itself
- **Props**: `open: boolean` + `onClose: () => void` — parent controls visibility
- **Conditional render**: Early-return `null` when `!open`, so internal state resets on each open

`HistoryModal` also manages inline confirmation state (`confirmLoadId`, `confirmDeleteId`, `confirmClearAll`) for destructive actions.

### State Flow

All state lives in `App.tsx`:
- `selectedType: TaskType | null` — which task type is active
- `fieldValues: Record<string, unknown>` — user input keyed by field key (supports string, string[], boolean, number, KeyValuePair[])
- Modal open/close: `settingsOpen` and `historyOpen` boolean state in App.tsx

`EditorArea` manages local `addedFields: FieldDefinition[]` state for progressive disclosure.

Storage hooks (`usePreferences` and `useHistory` from `hooks/useStorage.ts`) provide persistence state and actions to `App.tsx`, which passes them to modals via props.

State flows down via props: `App → PageLayout → EditorArea/PreviewArea`, `App → SettingsModal/HistoryModal`.

### Progressive Disclosure

Fields are split by `visibility`:
- **Default fields** (`visibility: 'default'`): Always shown when task type is selected
- **Optional fields** (`visibility: 'optional'`): Hidden in `AddFieldPanel`, user clicks "+" to add them to the editor

`AddFieldPanel` groups optional fields into:
- **★ 推荐**: Task-scoped optional fields (most relevant to this task type)
- **其他**: Universal optional fields (apply to any task type)
- **自定义字段**: The `custom_fields` key-value field (always at bottom)

### Task Type Switching

When switching task types, `App.tsx` preserves the `intent` field value but clears everything else. If the user has filled non-intent fields, a `window.confirm()` dialog asks for confirmation. `EditorArea` resets its `addedFields` state on type change.

## Conventions

- **Labels**: Derived from field keys via `keyToLabelZh()` (`lib/format.ts`), not hardcoded in components
- **Placeholders**: Chinese text (e.g., "自由输入", "添加项...") — will be i18n'd in Phase 3
- **Field component props**: All field components take `(field: FieldDefinition, value: T, onChange: (v: T) => void)` where T matches the field's data type
- **shadcn/ui**: Use `components/ui/` primitives; add new ones via `npx shadcn@latest add <component>`
- **Design tokens**: Use Tailwind utility classes mapped to `@theme` CSS custom properties (e.g., `bg-bg-surface`, `text-ink-primary`, `border-border-default`)
