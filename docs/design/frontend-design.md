# Intent Compiler — Frontend UI/UX Design Spec

## Design Direction

**Visual Style**: Friendly editor — approachable, warm, generous spacing, rounded corners. Designed for a broad audience, not just developers.

**Brand Identity**: Sunflower + Ink — golden yellow (#f5c518) highlights on clean white, contrasted with rich black (#1a1a1a). High personality, high contrast, distinctive and impossible to confuse with other tools.

**Typography**:
- Latin: Plus Jakarta Sans (Google Fonts) — geometric, rounded letterforms matching the friendly brand
- Chinese: System fonts — PingFang SC (Mac), Microsoft YaHei (Windows), Noto Sans SC (Linux)
- Monospace (preview area): SF Mono, Cascadia Code, Consolas, monospace
- Weight usage: 400 body, 500 labels, 600 emphasis, 700 headings, 800 brand/logo

**Font size scale** (used throughout this spec):
- `text-xs`: 12px — labels, hints, badges, secondary info
- `text-sm`: 14px — body text, field content, descriptions
- `text-base`: 16px — primary UI text, task card verbs
- `text-lg`: 18px — modal titles, section headings
- `text-xl`: 20px — logo / brand name

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| `bg-page` | #fffdf5 | Page background |
| `bg-surface` | #ffffff | Cards, inputs, panels |
| `bg-muted` | #f5f3ef | Secondary backgrounds, inactive tabs |
| `bg-accent-light` | #fff3cd | Light yellow backgrounds, unselected pills |
| `bg-accent-warm` | #fff8e1 | Help cards, info banners |
| `accent-primary` | #f5c518 | Primary accent — borders, highlights, active indicators |
| `accent-primary-shadow` | rgba(245,197,24,0.1) | Subtle glow on Intent field |
| `ink-primary` | #1a1a1a | Primary text, selected backgrounds |
| `ink-secondary` | #555555 | Secondary text |
| `ink-muted` | #999999 | Labels, field names |
| `ink-hint` | #bbbbbb | Operation hints, placeholder text |
| `ink-disabled` | #cccccc | Disabled elements, drag handles |
| `border-default` | #e8e2d8 | Default borders |
| `border-light` | #f0ebe4 | Dividers, subtle separators |
| `border-accent` | #f0e6c8 | Accent-tinted borders |
| `status-success` | #44aa99 | Verified, success states |
| `status-danger` | #ee5555 | Delete, destructive actions |

## Spacing and Sizing

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small pills, language toggle segments |
| `radius-md` | 6px | Buttons, option pills, format tabs |
| `radius-lg` | 8px | Input fields, cards, panels |
| `radius-xl` | 12px | Modals |
| `gap-field` | 10px | Vertical gap between fields in editor |
| `gap-section` | 12px | Gap between editor and preview |
| `padding-input` | 8px | Internal padding of input fields |
| `padding-page` | 20px | Horizontal page padding |

## Page Layout

### Structure

```
┌──────────────────────────────────────────────────┐
│  Top Bar (fixed, border-bottom)                   │
├──────────────────────────────────────────────────┤
│  Task Type Selector (scrolls with page)           │
├────────────────────┬─────────────────────────────┤
│  Editor (left)     │  Preview (right)             │
│  overflow-y: auto  │  overflow-y: auto            │
│                    │  (sticky container)           │
│  50%               │  50%                          │
└────────────────────┴─────────────────────────────┘
```

- **Top Bar**: Fixed at top. Contains: Logo (left), History / Settings / UI Language toggle (right).
- **Task Selector**: Below top bar, scrolls with page content. 6 cards in a responsive grid — single row on wide screens (≥1280px), wraps to 3×2 on narrower viewports.
- **Editor + Preview**: Fill remaining viewport height. Separated by a 1.5px vertical divider (`border-light`). Both sides scroll independently. Split ratio is 50/50, not resizable.
- **Minimum supported viewport width**: 1024px. Below this width, the layout is not optimized (mobile adaptation is deferred per PRD).

### Top Bar

```
[Intent Compiler]                    [History] [Settings] [EN|中]
```

- Logo: Plus Jakarta Sans 800, `text-xl`, `ink-primary`
- Navigation items: `text-sm`, font-weight 500, `ink-secondary`, clickable
- UI Language toggle: Segmented control with `radius-sm`. Active segment: `ink-primary` bg + `accent-primary` text. Inactive: `ink-muted` text. This is intentionally high-contrast (black+gold) to match the brand identity.
- History and Settings open centered Modals (see Modal section)

### Scrolling Behavior

- **Top Bar**: Fixed, never scrolls
- **Task Selector**: Part of page flow, scrolls out of view as user scrolls down. Once a task type is selected, users rarely switch — it does not need to be sticky.
- **Editor (left)**: Independent vertical scroll. Contains all fields + "Add Field" button.
- **Preview (right)**: Independent vertical scroll. The preview container itself is sticky (stays in viewport), but its internal content scrolls when output is long. "Copy to Clipboard" button is pinned at the bottom of the preview panel (never scrolls away).

## Task Type Selector

Six cards in a responsive grid. Each card displays:
- **Verb** (e.g., "Ask") — `text-base`, font-weight 700
- **Mental model** (e.g., "I want to know something") — `text-xs`, muted color

**States**:
- Default: `bg-surface`, 1.5px `border-accent` border, `radius-lg`
- Selected: `ink-primary` background, `accent-primary` text, 2px `accent-primary` border (thicker border distinguishes this from secondary controls like format pills and language toggles that use the same color scheme)
- Hover: Slight background tint (`bg-accent-light`)

**i18n**: Card content follows UI language. EN: "Ask — I want to know something". 中文: "提问 — 我想知道一件事".

## Editor Area (Left)

### Field Display Order

Fields are displayed in the editor in the following order:
1. Intent (always first)
2. Default fields for the selected task type, in the order defined by the template registry (same order as PRD field tables)
3. User-added optional fields, appended at the bottom in the order they were added
4. Custom fields (key-value), always last

When AI adds optional fields (via "Allow AI to add fields"), they are inserted at position 3 (after default fields, before custom fields).

### Field Label Pattern

Every field label consists of three elements in this exact order:

```
FIELD_NAME [?]   operation hint
```

1. **Field name**: `text-xs`, uppercase, `ink-muted`, font-weight 600, letter-spacing 0.5px. Follows UI language setting (single language at a time).
2. **Help icon (?)**: 16×16px circle, `bg-muted` background, `ink-muted` text. Positioned immediately after the field name (margin-left 4px). Explains what this field is and when to use it.
3. **Operation hint**: `text-xs`, `ink-hint` color. Positioned after the ? icon (margin-left 8px). Describes how to interact with the input. Follows UI language. Hints per input type:

| Input Type | Hint (EN) | Hint (中文) |
|------------|-----------|-------------|
| textarea | Enter text freely | 自由输入文本 |
| text | Enter text freely | 自由输入文本 |
| select | Click to select one | 点击选择一项 |
| combo | Select or type custom | 选择或输入自定义值 |
| list | Add items to list | 添加列表项 |
| toggle | Toggle on/off | 开关切换 |
| number | Click +/− or type number | 点击+/−或输入数字 |
| key-value | Add key-value pairs | 添加键值对 |

### Help (?) Expanded State

Clicking ? expands an inline help card below the label, above the input:

- ? icon inverts to `ink-primary` bg + `accent-primary` text when active
- Help card: `bg-accent-warm` background, 1.5px `accent-primary` border, `radius-lg`, 10px 12px padding
- Content structure:
  - **What is this?** — One-line description
  - **Suggestions** — When to use, what to write (optional, per field)
  - **Example** — Concrete usage example (optional, per field)
- Click ? again to collapse

### Input Type Rendering

> **Note on `select` type**: The PRD describes `select` as "dropdown with predefined options only." This design spec renders `select` as horizontal pill buttons instead — this is an intentional UX decision for better discoverability and fewer clicks. The PRD description should be updated to reflect this.

**textarea** — Multi-line input. `bg-surface`, 1.5px `border-default`, `radius-lg`, `padding-input`. Min-height varies by field importance (Intent: 48px, others: 36px). Auto-expands with content.

**text** — Single-line input. Same styling as textarea but fixed single-line height.

**select** — Horizontal pill buttons. Selected: `bg-accent-light`, `ink-primary` text, font-weight 600, 1.5px `accent-primary` border. Unselected: `bg-surface`, `ink-muted`, 1px `border-default`. Single selection only.

**combo** — Two-part container: pill buttons on top (same styling as select), separated by a 1px `border-light` divider from a text input below. Both parts share a single outer border (`border-default`, `radius-lg`) to form a unified visual group. The text input shows placeholder "or type custom value..." in `ink-hint`.

**list** — Ordered list editor inside a bordered container (`radius-lg`).
- Each item: drag handle (⠿, `ink-disabled`) + text content + delete button (✕, `ink-disabled`, hover: `status-danger`).
- Items separated by 1px `border-light` dividers.
- Bottom row: "+" icon + "Add item..." placeholder.
- Drag-to-reorder supported.

**toggle** — 36×20px track. On: `accent-primary` track + `ink-primary` 16×16px circle (right). Off: `border-default` track + `ink-muted` circle (left). Accompanied by a descriptive label to the right.

**number** — Stepper: [−] button + value display + [+] button.
- − button: `bg-surface`, `border-default`, `ink-muted`
- + button: `ink-primary` bg, `accent-primary` text
- Value: `bg-surface`, `border-default`, font-weight 600, centered, min-width 40px
- Also accepts direct numeric input.

**key-value** — Bordered container (`radius-lg`).
- Each pair: key (font-weight 600, `bg-muted` badge, `radius-sm`) + value (regular text) + delete (✕).
- Bottom row: "+ key" / "value" placeholders for adding new pairs.

### Intent Field (Special Treatment)

Intent has elevated visual treatment:
- Border: 2px `accent-primary` (thicker than other fields)
- Box shadow: `accent-primary-shadow`
- AI Fill button: positioned in the label row, right-aligned. `ink-primary` bg + `accent-primary` text, `radius-md`, font-weight 700.
- Below the input: "Allow AI to add fields" checkbox with its own ? help icon.

### Add Field Button and Panel

**Collapsed state**: Full-width button, `bg-surface`, 1.5px dashed `border-default`, `radius-lg`. Text: "+ Add Field" (follows UI language), font-weight 600.

**Expanded state**: Replaces the button with a bordered panel (`radius-lg`), divided into sections:

1. **★ Recommended** (header: `ink-primary` bg, `accent-primary` text, font-weight 700)
   - Maps to: task-scoped optional fields (Scope = Task, Visibility = Optional in PRD)
2. **Others** (header: `bg-muted`, `ink-muted` text, font-weight 700)
   - Maps to: universal optional fields (Scope = Universal, Visibility = Optional in PRD)
3. **custom_fields** (footer: `bg-accent-warm` background, `border-accent` top border)
   - Always at the bottom

Each addable field row:
- Field name + [?] help icon (follows the same label pattern)
- One-line description below the name (`text-xs`, `ink-muted`)
- Golden "+" button on the right (`accent-primary`, `text-lg`, font-weight 700)
- Clicking "+" adds the field to the editor (appended to position 3 per field display order) and removes it from the panel

### AI Fill

**Prerequisite**: Task type selected + Intent not empty + API key configured in Settings.

**Button states**:
- Idle: `ink-primary` bg, `accent-primary` text, "✨ AI Fill"
- Disabled: Same layout but 40% opacity, no hover effect. Shown when prerequisites are not met.
- Loading: `accent-primary` bg, `ink-primary` text, "⟳ Filling...", disabled. Indeterminate progress bar below (3px track, animated stripe moving left-to-right — AI API calls do not provide progress callbacks).
- Success: Returns to idle state. Message below intent: "✓ Filled N fields" in `status-success`. Message fades after 3 seconds.
- Error: Returns to idle state. Message below intent: "✗ Fill failed: [reason]" in `status-danger`. Common reasons: "Network error", "Invalid API key", "Rate limited". Message persists until dismissed or next attempt.

**"Allow AI to add fields" checkbox**:
- Unchecked (default): AI only fills fields currently displayed in the editor.
- Checked: AI can discover and add relevant optional fields.
- Has its own ? help icon explaining behavior with examples.
- Hidden when no API key is configured.

**AI-filled fields**: Receive a subtle `bg-accent-light` background tint so users can identify which fields were auto-populated. Users can edit any value before compiling.

## Preview Area (Right)

### Preview Header

Two controls in a single row:

```
OUTPUT [EN|中]                    [MD] [JSON] [YAML] [XML]
```

- **Output Language** (left): Label "OUTPUT" (`text-xs`, `ink-muted`, font-weight 600, follows UI language) + segmented toggle [EN|中]. Controls the language of compiled output (field labels, section headers). Initializes from Settings default, overridable per session.
- **Output Format** (right): Four format pills. Selected: `ink-primary` bg + `accent-primary` text. Unselected: `bg-muted` + `ink-muted`. Initializes from Settings default, overridable per session.

### Preview Content

- Monospace font (SF Mono / Cascadia Code / Consolas / monospace), `text-sm`, `ink-secondary`, line-height 1.8
- White-space: pre-wrap
- Background: `bg-surface`, 1.5px `border-default`, `radius-lg`
- Content updates in real-time as user edits fields
- Scrolls independently when content exceeds viewport

### Copy to Clipboard

- Full-width button, pinned at preview panel bottom (flex-shrink: 0, with top border separator)
- `accent-primary` bg, `ink-primary` text, font-weight 700, `radius-lg`
- **States**:
  - Active: Normal appearance, clickable
  - Disabled: 40% opacity when preview has no content (no task selected or no fields filled). Not clickable.
  - Success: Text briefly changes to "✓ Copied!" (1.5 seconds), then reverts
  - Error: Text briefly changes to "✗ Copy failed" in `status-danger` (rare, clipboard API failure)

## Modals

### Common Behavior

- Trigger: Click Top Bar entry (History / Settings)
- Appearance: Fade-in centered modal + semi-transparent backdrop (rgba(0,0,0,0.3))
- Dismissal: Click ✕ / click backdrop / press Escape
- Sizing: max-width 560px, `radius-xl`, box-shadow for elevation
- Auto-save: Settings changes save immediately, no manual save button

### Settings Modal

Structure:

```
┌─ Settings 设置 ─────────────────── ✕ ─┐
│                                        │
│  OUTPUT DEFAULTS 输出默认值              │
│                                        │
│  Default Output Language 默认输出语言 [?]│
│  [English] [中文]                       │
│  ↳ subtitle: can be overridden         │
│                                        │
│  Default Output Format 默认输出格式 [?]  │
│  [Markdown] [JSON] [YAML] [XML]        │
│  ↳ subtitle: can be overridden         │
│                                        │
│  ─── AI CONFIGURATION ───              │
│                                        │
│  AI Provider                           │
│  [OpenAI] [Anthropic]                  │
│                                        │
│  API Key                               │
│  [sk-••••••••••3kF9        ] [Show]    │
│                                        │
│  ✓ Key verified — OpenAI GPT-4o        │
│                                        │
│  🔒 Security note...                   │
└────────────────────────────────────────┘
```

- **Output Defaults section**: Default Output Language + Default Output Format. Both with ? help and subtitle explaining "Can be overridden per session".
- **AI Configuration section**: Separated by a labeled divider. Provider selector (pill buttons) + API Key input (masked by default, Show/Hide toggle) + verification status + security note.
- **API Key verification**: Triggered on blur or Enter. Sends a minimal test request to validate.
  - Success: Green status bar — "✓ Key verified — [provider] [model]"
  - Failure (invalid key): Red status bar — "✗ Invalid API key. Please check and try again."
  - Failure (network): Red status bar — "✗ Could not verify key. Check your network connection."
  - When verification fails, the API Key input receives a `status-danger` border.
- **Provider switching**: Each provider stores its own API key independently. Switching provider reveals that provider's stored key (or an empty input if none configured). Keys are never deleted when switching — both can coexist.
- API Key storage: IndexedDB only, never sent anywhere except the AI provider's API.

### History Modal

Structure:

```
┌─ History 历史记录 ───────────────── ✕ ─┐
│                                        │
│  [Ask]  How do React hooks compare...  │
│         2 min ago · Markdown        🗑 │
│  ───────────────────────────────────── │
│  [Create] Write a Python script to...  │
│           1 hour ago · JSON         🗑 │
│  ───────────────────────────────────── │
│  ...                                   │
│                                        │
│  5 records              Clear All 清空 │
└────────────────────────────────────────┘
```

- List sorted by time descending (newest first)
- Each record: Task type badge + intent text (truncated with ellipsis) + relative timestamp + output format + delete icon
- Task type badge: Current session's task type uses `ink-primary` bg + `accent-primary` text. Others use `bg-accent-light` + `ink-primary` text + `border-accent`.
- **Loading a record**: If the editor currently has unsaved field data (any field is non-empty), show an inline confirmation: "Load this record? Current editor content will be replaced." with [Cancel] [Load] buttons. If the editor is empty, load directly without confirmation.
- Delete (🗑): Click → inline confirmation (item text briefly replaced with "Delete?") → remove on confirm.
- Footer: Record count (left) + "Clear All" in `status-danger` color (right). Clear All requires confirmation.
- Scrollable list area with max-height constraint.

**When history records are created**: A history record is automatically saved when the user clicks "Copy to Clipboard." Each copy action creates a new record containing: task type, all field values, output language, and output format at the time of copying.

## i18n Behavior

All visible text in the UI follows the UI Language toggle (Top Bar):
- Field names, operation hints, ? help content, button labels, modal titles, placeholder text, the "OUTPUT" label in preview header
- When EN is active, only English is shown. When 中文 is active, only Chinese is shown.
- Mockups in this spec show both languages side-by-side for design review purposes only. The actual implementation renders a single language at a time.

Output Language (preview header) is independent of UI Language:
- Controls the language of compiled output (field labels and section headers in the preview)
- A user can have UI in English but output in Chinese, or vice versa

## Empty and Edge States

**No task type selected**: Editor area shows a centered prompt — "Select a task type above to begin" (follows UI language). Preview area shows the same message. Copy button is disabled.

**Task selected, no fields filled**: Preview shows an empty compiled template skeleton with field placeholders (e.g., `# Intent\n[Enter your intent...]`), giving users a preview of the output structure. Copy button is disabled.

**Intent empty**: AI Fill button is visually present but disabled (40% opacity, no hover effect). Tooltip on hover: "Enter your intent first".

**No API key configured**: AI Fill button shows a lock icon instead of ✨. Clicking it opens the Settings modal scrolled to the AI Configuration section. "Allow AI to add fields" checkbox is hidden.

**History empty**: Modal body shows centered message — "No history yet" with a subtle illustration or icon.

**Field with no input**: Shows placeholder text in `ink-hint` color describing what to enter.

**Preview content empty** (all fields empty or only boolean toggles): Preview shows the template skeleton as described in "Task selected, no fields filled" above.

## Deferred Features

The following PRD features do not have UI surfaces in this spec and are deferred to future iterations:

- **Custom template save/reuse** (PRD user story 21): Save, name, list, and load custom templates. Will require a template management UI surface (likely a new modal or section).
- **Mobile adaptation** (PRD out of scope): Current design targets desktop only (minimum 1024px viewport width).
