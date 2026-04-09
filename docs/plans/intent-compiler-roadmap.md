# Plan: Intent Compiler

> Source PRD: `docs/prd/intent-compiler-prd.md`
> Frontend Design: `docs/design/frontend-design.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Architecture**: Pure frontend SPA. No backend server in default mode. AI mode calls provider APIs directly from the browser. Deployed as a static build via Nginx on Alibaba Cloud.
- **Tech stack**: React 19 + TypeScript 6, Vite 8, Tailwind CSS v4 + shadcn/ui, react-i18next, Dexie.js, js-yaml, fast-xml-parser.
- **Page layout**: Fixed top bar → scrolling task type selector → 50/50 editor + preview split. Minimum viewport width 1024px. Both panels scroll independently.
- **Brand identity**: Sunflower + Ink — `#f5c518` accent on `#fffdf5` page background, `#1a1a1a` ink. Plus Jakarta Sans for Latin text, system fonts for Chinese.
- **Task types**: Ask, Create, Transform, Analyze, Ideate, Execute — each mapped to a verb and mental model. This is a core identity element used throughout navigation and UI.
- **Field classification model**: Every field has two independent attributes — Scope (Universal / Task) and Visibility (Default / Optional). Both are configured per task type.
- **Field ordering**: intent → task-specific default fields → universal default fields → user-added optional fields → custom fields. Consistent in both editor and compiled output.
- **Input types**: textarea, text, select (rendered as pill buttons), combo (pills + text input), list, toggle, number, key-value.
- **Output formats**: Markdown, JSON, YAML, XML — all equal, all preserve field ordering by importance.
- **Storage**: IndexedDB via Dexie.js with schema versioning. Three stores: preferences, history, templates (templates store reserved for future custom template feature).
- **AI provider interface**: Abstract interface supporting OpenAI and Anthropic in v1, designed for extensibility. API keys stored in IndexedDB, never sent anywhere except the provider's API.

---

## Phase 1: Project Setup + Single-Task Compile Loop

**User stories**: 1, 2, 4, 8, 10, 11, 23, 24, 25

### What to build

Scaffold the project and deliver the thinnest possible end-to-end compile loop: a user selects a task type, fills in fields, sees a live Markdown preview, and copies the result.

Set up the project with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. Establish the page layout skeleton: fixed top bar (logo only, other top-bar items are placeholder/noop), task type selector area, and the 50/50 editor + preview split with independent scrolling.

Build the Template Registry data model defining all 6 task types with their verb/mental-model labels, but only wire the Ask task type's full field definitions. The task type selector renders all 6 cards with correct styling and states (default/selected/hover), but only Ask populates the editor.

Implement the editor area with: the Intent field (elevated styling with golden border and shadow per design spec) and Ask's remaining default fields. For this phase, only textarea and text input type renderers are needed (Intent, context, requirements, constraints, output_format, question_type, audience — render select/combo/list fields as simple text inputs temporarily).

Build the Compiler engine that receives field data and produces ordered output. Implement the Markdown formatter. Wire the live preview panel (monospace font, correct styling) that updates in real-time as the user edits. Implement the "Copy to Clipboard" button with success/error states.

### Acceptance criteria

- [x] Project scaffolds and runs via `npm run dev` with Vite + React + TypeScript + Tailwind + shadcn/ui
- [x] Page layout matches design spec: fixed top bar, task selector, 50/50 editor+preview split
- [x] All 6 task type cards display with verb + mental model, correct styling for default/selected/hover states
- [x] Selecting Ask populates the editor with Intent (elevated styling) + default fields
- [x] Selecting any other task type shows a "coming soon" or empty state (graceful degradation)
- [x] Textarea and text input types render correctly with design spec styling
- [x] Live preview shows compiled Markdown output, updating in real-time as fields change
- [x] Compiled output orders fields by importance (intent first, then core fields)
- [x] Empty optional fields are omitted from compiled output
- [x] "Copy to Clipboard" button copies preview content, shows success/error feedback
- [x] Copy button is disabled when preview has no meaningful content

---

## Phase 2: Complete Task Types + All Input Types + Progressive Disclosure

**User stories**: 3, 5, 6, 7, 26, 27, 28, 29, 30, 31, 32

### What to build

Extend the system to support all 6 task types with their full field definitions and all input type renderers.

Complete the Template Registry with field definitions for Create, Transform, Analyze, Ideate, and Execute. Each task type's default and optional fields, scopes, and visibilities match the PRD field tables exactly.

Implement all remaining input type renderers per the design spec:
- **select**: Horizontal pill buttons (single selection)
- **combo**: Pill buttons + text input in a unified container
- **list**: Ordered list editor with drag-to-reorder, add/delete items
- **toggle**: Track + circle switch with descriptive label
- **number**: Stepper with +/- buttons and direct input
- **key-value**: Dynamic key-value pair editor

Build the "Add Field" panel with collapsed/expanded states. When expanded, show two sections: "Recommended" (task-scoped optional fields) and "Others" (universal optional fields), plus the custom_fields entry at the bottom. Each addable field shows its name, one-line description, and a golden "+" button. Adding a field moves it from the panel to the editor; removing it returns it to the panel.

Wire the field label pattern for every field: FIELD_NAME + [?] help icon (visual only in this phase — expand behavior deferred to Phase 6) + operation hint matching the input type.

### Acceptance criteria

- [x] All 6 task types populate the editor with their correct default fields when selected
- [x] Switching task type resets the editor and repopulates with the new type's defaults
- [x] All 8 input type renderers work correctly: textarea, text, select, combo, list, toggle, number, key-value
- [x] Select renders as horizontal pills with correct selected/unselected styling
- [x] Combo renders pills + text input in a single bordered container
- [x] List supports add, delete, and drag-to-reorder
- [x] "Add Field" button expands to a panel with "Recommended" and "Others" sections
- [x] Optional field grouping matches PRD: task-scoped optional fields first, universal optional fields second
- [x] Adding a field from the panel places it in the editor at the correct position (after defaults, before custom fields)
- [x] Custom fields (key-value) are available at the bottom of the add panel and always render last in the editor
- [x] Field labels show field name + [?] icon (non-functional placeholder) + operation hint
- [x] Compiled output (Markdown) includes all filled fields in correct importance order across all task types

---

## Phase 3: All Output Formats + i18n

**User stories**: 9, 12, 13

### What to build

Add the remaining output formats and full bilingual support, so the tool produces output in 4 formats and operates entirely in either English or Chinese.

Implement JSON, YAML, and XML formatters alongside the existing Markdown formatter. All formats preserve the same field ordering by importance. Wire the format selector tabs in the preview header (4 pills: MD / JSON / YAML / XML) with correct styling per design spec.

Integrate react-i18next. Add the UI language toggle (EN|中文) in the top bar as a segmented control. All UI text switches language: field names, operation hints, button labels, placeholder text, task type cards (verb + mental model), the "Add Field" panel labels, and the "OUTPUT" label in the preview header.

Add the Output Language toggle (EN|中文) in the preview header, independent of the UI language. Compiled output field labels and section headers follow the output language setting. A user can have the UI in English but output in Chinese, or vice versa.

### Acceptance criteria

- [x] JSON formatter produces valid, parseable JSON with fields ordered by importance
- [x] YAML formatter produces valid YAML (via js-yaml) with fields ordered by importance
- [x] XML formatter produces valid XML (via fast-xml-parser) with fields ordered by importance
- [x] Format selector tabs in preview header switch output format; preview updates immediately
- [x] UI language toggle switches all visible UI text between English and Chinese
- [x] Task type cards display verb + mental model in the current UI language
- [x] Field names, operation hints, placeholders, and button labels all follow UI language
- [x] Output language toggle in preview header is independent of UI language
- [x] Compiled output uses the output language for field labels and section headers
- [x] UI in English + output in Chinese works correctly (and vice versa)

---

## Phase 4: Persistence — Settings + History

**User stories**: 15, 20, 22

### What to build

Add persistent storage so preferences survive page reloads and compilation history is available for revisiting.

Set up Dexie.js with the preferences and history stores (templates store created but unused until custom templates feature). Define the schema with Dexie's versioning mechanism.

Build the Settings modal (triggered from top bar). Contains two sections: Output Defaults (default output language, default output format — both with pill selectors and "can be overridden per session" subtitles) and AI Configuration (provider selector, API key input with mask/show toggle, verification status, security note). Settings auto-save on change. API key stored in IndexedDB only.

Build the History modal (triggered from top bar). History records are created automatically when the user clicks "Copy to Clipboard" — each record captures task type, all field values, output language, and output format. The modal shows a scrollable list sorted by newest first, each entry with task type badge + truncated intent + relative timestamp + format indicator + delete button. Loading a record restores the editor state (with confirmation if the editor is non-empty). Supports individual delete and "Clear All" (with confirmation).

Wire the Settings defaults: on page load, the output language toggle and format selector initialize from stored preferences. API key presence determines AI Fill button state (lock icon vs. functional — full AI behavior is Phase 5).

### Acceptance criteria

- [x] Dexie.js database initializes with preferences and history stores on first visit
- [x] Settings modal opens from top bar, displays Output Defaults and AI Configuration sections
- [x] Output Defaults (language, format) persist across page reloads
- [x] Editor initializes output language and format from stored defaults
- [x] API key input supports mask/show toggle, stores key in IndexedDB
- [x] Provider selector (OpenAI / Anthropic) stores each provider's key independently
- [x] API key verification triggers on blur/Enter with success/failure status display
- [x] History record is auto-created on each "Copy to Clipboard" action
- [x] History modal shows records sorted by newest first with correct task type badge, truncated intent, timestamp, and format
- [x] Loading a history record restores editor state (task type, all fields, output language, format)
- [x] Loading prompts confirmation when editor has non-empty fields
- [x] Individual delete and "Clear All" work with confirmation
- [x] Settings modal auto-saves (no manual save button)

---

## Phase 5: AI-Enhanced Mode

**User stories**: 14, 16, 17, 18, 19

### What to build

Enable AI-assisted field filling, the optional enhancement that lets AI parse a brief intent and populate template fields.

Build the AI Connector module with an abstract provider interface. Implement concrete providers for OpenAI and Anthropic. The connector sends the user's intent, the current task type, and the target field list to the AI provider, then maps the AI response back to field values.

Wire the AI Fill button next to the Intent field. The button has four states per design spec: idle ("AI Fill"), disabled (prerequisites not met — 40% opacity), loading ("Filling..." with animated progress bar), and result (success message "Filled N fields" or error message with reason). Prerequisites: task type selected + intent not empty + API key configured and verified.

Implement the "Allow AI to add fields" checkbox below the Intent field. When unchecked (default), AI fills only fields currently in the editor. When checked, AI can discover and add relevant optional fields from the template. The checkbox is hidden when no API key is configured.

AI-filled fields receive a subtle background tint (`bg-accent-light`) so users can distinguish auto-populated values. Users can freely edit any AI-filled field before compiling.

Handle error states: network errors, invalid API key, rate limiting. Display actionable error messages per design spec.

### Acceptance criteria

- [x] AI Fill button appears next to Intent with correct idle/disabled/loading/success/error states
- [x] Button is disabled (40% opacity) when prerequisites are not met (no task type, empty intent, or no API key)
- [x] Clicking AI Fill with no API key configured shows lock icon and opens Settings modal to AI Configuration
- [x] AI Fill sends intent + task type + field list to the configured provider
- [x] Filled fields update in the editor and the preview updates in real-time
- [x] AI-filled fields show `bg-accent-light` background tint
- [x] "Allow AI to add fields" checkbox is hidden when no API key is configured
- [x] With checkbox unchecked: AI fills only currently displayed fields
- [x] With checkbox checked: AI can add optional fields not yet in the editor
- [x] Success state shows "Filled N fields" message that fades after 3 seconds
- [x] Error states show actionable messages: "Network error", "Invalid API key", "Rate limited"
- [x] Users can edit AI-filled values before compiling
- [x] Provider switching in Settings correctly routes AI requests to the selected provider

---

## Phase 6: Help System + Edge States + Visual Polish

**User stories**: 6 (help content depth), 24 (desktop layout quality)

### What to build

Complete the help system, implement all empty/edge states, and polish the visual experience to production quality.

Wire the [?] help icon on every field to expand an inline help card below the label. Each help card contains structured content: "What is this?" (one-line description), "Suggestions" (when to use, what to write), and "Example" (concrete usage). The ? icon inverts styling when active. Help content follows UI language. Clicking ? again collapses the card.

Implement all empty and edge states per the design spec:
- No task type selected: centered prompt in both editor and preview
- Task selected, no fields filled: preview shows template skeleton with placeholders
- Intent empty: AI Fill disabled with tooltip
- No API key configured: AI Fill shows lock icon, "Allow AI to add fields" hidden
- History empty: centered message with icon
- Field with no input: placeholder text in hint color

Polish visual details: verify all spacing, border radii, font weights, and color tokens match the design spec. Ensure hover states, focus states, and transitions are smooth. Confirm responsive behavior down to 1024px viewport width (task selector wraps to 3x2 grid on narrower viewports).

### Acceptance criteria

- [x] Every field's [?] icon expands an inline help card with "What is this?", "Suggestions" (where applicable), and "Example" (where applicable)
- [x] Help card styling matches design spec: `bg-accent-warm`, `accent-primary` border, correct padding
- [x] ? icon inverts to active styling when expanded; clicking again collapses
- [x] Help content follows UI language (switches on language toggle)
- [x] "No task type selected" state shows centered prompt in both editor and preview
- [x] "Task selected, no fields filled" state shows template skeleton in preview
- [x] "Intent empty" state disables AI Fill with tooltip on hover
- [x] "No API key" state shows lock icon on AI Fill, hides "Allow AI to add fields"
- [x] "History empty" state shows centered message
- [x] All spacing, color, typography, and border tokens match the design spec
- [x] Task selector wraps to 3x2 grid below 1280px viewport width
- [x] Layout remains usable down to 1024px viewport width
- [x] Copy button is pinned at preview panel bottom (never scrolls away)
