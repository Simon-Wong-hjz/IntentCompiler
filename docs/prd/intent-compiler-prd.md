# Intent Compiler PRD

## Problem Statement

Users who frequently interact with AI — whether through chat interfaces or agent-based workflows — must always start with text input. Crafting well-structured prompts that clearly convey intent, constraints, and requirements is a significant cognitive burden. However, not all conversations or tasks warrant the same level of effort in structuring input.

The result is a dilemma: unstructured input leads to lower-quality AI responses and more back-and-forth clarification, while manually structuring every interaction is exhausting and unsustainable. Users need a tool that bridges this gap — lowering the floor of effort required while raising the floor of output quality.

## Solution

Intent Compiler is a web-based tool that helps users "compile" their intent into structured prompts through a guided, template-driven editing experience.

Core principles:

1. **Task-type driven templates**: Six built-in task types, each mapped to a clear user mental model (a verb describing what the user wants to do), with tailored fields that guide users toward better-structured input.
2. **Progressive disclosure**: Only essential fields are shown by default. Additional fields are available on demand, grouped by relevance, with clear descriptions and usage hints.
3. **No AI required by default**: The tool works purely through template-based formatting and assembly — no API calls, no accounts. Users can optionally provide an API key to enable AI-enhanced compilation.
4. **Multiple output formats**: Markdown, JSON, YAML, XML — users choose the format that fits their workflow.
5. **Bilingual (Chinese / English)**: Both the UI and compiled output support Chinese and English.

## User Stories

1. As a user, I want to select a task type that matches my intent (Ask / Create / Transform / Analyze / Ideate / Execute), so that I see relevant fields tailored to my task.
2. As a user, I want each task type to display a clear verb and mental model description (e.g., "Ask — I want to know something"), so that I can quickly identify the right type without reading lengthy explanations.
3. As a user, I want to see only essential fields by default when I select a task type, so that I'm not overwhelmed by a wall of form fields.
4. As a user, I want to fill in only the "intent" field and generate a usable prompt, so that the minimum effort to use the tool is extremely low.
5. As a user, I want to add optional fields from a categorized list (task-specific fields first, then universal fields), so that I can progressively enrich my prompt when needed.
6. As a user, I want each addable field to have a one-line description and a usage hint (when to add it, what to write), so that I understand its purpose without external documentation.
7. As a user, I want to add custom key-value fields, so that I can express requirements not covered by the built-in template.
8. As a user, I want to see a live preview of the compiled output on the right side of the editor, so that I can see the effect of my input in real time.
9. As a user, I want to switch between output formats (Markdown / JSON / YAML / XML) and see the preview update immediately, so that I can choose the format that fits my workflow.
10. As a user, I want the compiled output to order fields by importance (intent and core fields first, optional fields after), so that the output implicitly communicates priority regardless of format.
11. As a user, I want to copy the compiled output to my clipboard with one click, so that I can paste it directly into my AI interaction interface.
12. As a user, I want to switch the UI language between Chinese and English, so that I can use the tool in my preferred language.
13. As a user, I want the compiled output to respect the selected UI language (field labels, section headers), so that the prompt I paste is in the language I need.
14. As a user, I want to provide an AI API key to enable AI-assisted field filling, so that AI can parse my brief intent and populate template fields for me.
15. As a user, I want my API key to be stored securely in my browser and never sent to any server other than the AI provider, so that I trust the tool with my credentials.
16. As a user with AI configured, I want to write a brief intent and click an AI fill button next to the Intent input, so that AI populates the other template fields based on my intent.
17. As a user with AI configured, I want AI fill to only populate fields currently displayed in the editor by default, so that I stay in control of the template structure.
18. As a user with AI configured, I want an option "Allow AI to add fields" that lets AI discover and add relevant optional fields, so that I can get a more comprehensive prompt when I choose to.
19. As a user, I want to review and edit AI-filled fields before compiling, so that I retain full control over the final output.
20. As a user, I want to save my preferences (language, default output format, API key) locally, so that I don't have to reconfigure the tool every time I visit.
21. As a user, I want to save and reuse custom templates, so that I can build on my frequently used patterns.
22. As a user, I want to view my compilation history, so that I can revisit or reuse previous prompts.
23. As a user, I want the tool to work entirely in my browser with no backend dependency (in non-AI mode), so that I have full control over my data.
24. As a user, I want to use the tool on a desktop browser with a well-designed layout, so that I can efficiently compile prompts on my primary workspace. (Mobile adaptation deferred to future iteration.)
25. As a user selecting "Ask", I want to see intent, context, requirements, constraints, output_format, question_type, and audience as default fields, so that the template is optimized for asking questions.
26. As a user selecting "Create", I want to see intent, context, requirements, constraints, output_format, content_type, key_points, and tone as default fields, so that the template is optimized for creation tasks.
27. As a user selecting "Transform", I want to see intent, context, requirements, constraints, output_format, source_content, and transform_type as default fields, so that the template is optimized for content transformation.
28. As a user selecting "Analyze", I want to see intent, context, requirements, constraints, output_format, subject, analyze_type, and criteria as default fields, so that the template is optimized for analysis tasks.
29. As a user selecting "Ideate", I want to see intent, context, requirements, constraints, output_format, problem, current_state, goal, and assumptions as default fields, so that the template is optimized for ideation and problem-solving.
30. As a user selecting "Execute", I want to see intent, context, requirements, constraints, output_format, plan, and goal as default fields, so that the template is optimized for agent task instructions.
31. As a user, I want the addable field list to show task-specific optional fields above universal optional fields, so that the most relevant options are easy to find.
32. As a user, I want fields to support both free text input and predefined options (e.g., question_type: factual / conceptual / how-to / opinion), so that I have guidance without losing flexibility.

## Implementation Decisions

### Architecture

- **Pure frontend SPA** — no backend server required in default mode. AI-enhanced mode calls AI provider APIs directly from the browser.
- **Deployment**: Static build served via Nginx on Alibaba Cloud server.

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React + TypeScript | Mature ecosystem for complex form/editor UIs |
| Build | Vite | Fast development experience |
| Styling | Tailwind CSS + shadcn/ui | shadcn/ui provides accessible, Tailwind-native components copied into the project (no dependency lock-in); ideal for form-heavy UIs |
| i18n | react-i18next | Mainstream React i18n solution |
| Storage | IndexedDB via Dexie.js | Built-in versioning for template schema migration; structured data with indexes; no 5MB localStorage limit |
| Serialization | js-yaml, fast-xml-parser | JSON and Markdown handled natively; YAML and XML need lightweight third-party libraries |
| Deployment | Static build → Alibaba Cloud Nginx | Simple, no server runtime needed |

### Module Design

**Template Registry**
- Defines the 6 task type schemas and their field configurations.
- Manages the relationship between universal fields and task-specific fields.
- Controls per-task-type field defaults, grouping, and sort order.
- Interface: `getTemplate(taskType)` returns the full field definition including defaults, optionals, and grouping metadata.

**Compiler**
- Core engine: receives user-filled field data and compiles into output text.
- Controls field ordering by importance (intent → core fields → optional fields).
- In non-AI mode: pure template assembly and formatting.
- In AI-enhanced mode: sends field data to AI API for optimization.
- Interface: `compile(fields, format, options)` returns compiled text.

**Output Formatter**
- Four serialization strategies: Markdown, JSON, YAML, XML.
- Uniform interface, each format implemented independently.
- All formats preserve field ordering by importance.
- Interface: `format(compiledData, formatType)` returns final text string.

**Editor UI**
- Split-pane layout: left side is the template field editor, right side is live preview.
- Editor layout (core editing area only):
  1. **Task type selector**: mapped to verb + mental model labels (e.g., "Ask — I want to know something / 提问 — 我想知道一件事").
  2. **Intent input area**: visually elevated, standalone position — reflects its status as the universal required field. AI fill button is placed adjacent to this input.
  3. **AI options**: "Allow AI to add fields" checkbox beneath the Intent area (visible only when AI is configured).
  4. **Field editor**: default fields shown immediately; addable fields in a collapsible panel, grouped (task-specific first, universal second), each with description and usage hint.
  5. **Custom field support**: key-value pair input.
  6. **One-click copy** to clipboard.
- **Note**: The editor layout defines only the core editing area. Page-level elements (history, API key configuration, language toggle, user preferences) belong to the surrounding page layout, which is to be designed separately.

**i18n**
- Bilingual support (Chinese / English) for all UI copy: field names, descriptions, hints, buttons, labels.
- Compiled output templates are bilingual — output language follows UI language setting.
- `output_language` field in compiled output is independent — it specifies the language the AI should respond in, not the language of the prompt itself.

**AI Connector**
- Optional module, activated when user provides an API key.
- **Core function**: AI-assisted field filling. User writes a brief intent → AI parses it and populates template fields.
- Two fill modes:
  - **Default**: fill only fields currently displayed in the editor (default fields + any user-added optional fields).
  - **"Allow AI to add fields"**: AI can discover relevant optional fields, fill them, and add them to the editor.
- Prerequisite: user has selected a task type and filled the Intent field.
- **v1 provider support**: OpenAI and Anthropic. Abstract interface designed for extensibility to other providers.
- Handles API calls, error handling, key validation.
- API key stored in IndexedDB, never sent to any server other than the AI provider.

**Storage (Dexie.js)**
- `templates` store: custom/saved templates with task type and version.
- `preferences` store: user settings (language, default format, etc.).
- `history` store: compilation history with task type and timestamp.
- Schema versioning via Dexie's built-in migration mechanism.

### Task Types and Field Design

**Six task types**, each mapped to a verb and user mental model:

| Task Type | Verb | Mental Model (EN) | Mental Model (ZH) |
|-----------|------|-------------------|-------------------|
| Ask | 提问 | "I want to know something" | "我想知道一件事" |
| Create | 创作 | "I want to make something" | "我想做出一样东西" |
| Transform | 转化 | "I have content, change its form" | "我有内容，换一种形式" |
| Analyze | 分析 | "Help me judge / understand" | "帮我判断/理解" |
| Ideate | 构思 | "Help me think / design" | "帮我想办法" |
| Execute | 执行 | "Do a multi-step task for me" | "帮我做一个多步骤任务" |

**Field Classification Model**

Every field has two independent attributes:
- **Scope**: Universal (shared by all task types) or Task (belongs to a specific task type)
- **Visibility**: Default (shown in editor on task selection) or Optional (available in "add field" panel)

Both attributes can be configured per task type. A universal field can be re-scoped to Task for a specific task type (e.g., `goal` is Universal for most types but Task for Ideate and Execute). Changing scope does NOT automatically change visibility — they are independent decisions.

**Field Input Types:**

Input type definitions:
- `text` — single-line free text input
- `textarea` — multi-line free text input
- `select` — dropdown with predefined options only
- `combo` — predefined options + free text custom input
- `list` — ordered list of text items (add/remove)
- `toggle` — boolean on/off
- `number` — numeric input
- `key-value` — dynamic key-value pair editor

| Field | Input Type | Predefined Options (if applicable) |
|-------|------------|-------------------------------------|
| intent | textarea | — |
| context | textarea | — |
| requirements | list | — |
| constraints | list | — |
| output_format | combo | paragraph / list / table / code / step-by-step |
| goal | textarea | — |
| role | text | — |
| audience | text | — |
| assumptions | list | — |
| scope | text | — |
| priority | text | — |
| output_language | combo | Chinese / English / ... |
| detail_level | select | summary / standard / in-depth |
| tone | combo | formal / casual / technical / friendly |
| thinking_style | select | direct answer / step-by-step / pros-and-cons |
| examples | textarea | — |
| anti_examples | textarea | — |
| references | textarea | — |
| custom_fields | key-value | — |
| question_type | select | factual / conceptual / how-to / opinion |
| knowledge_level | combo | beginner / intermediate / expert |
| content_type | combo | email / article / doc / code / script |
| key_points | list | — |
| tech_stack | text | — |
| target_length | text | — |
| structure | textarea | — |
| include_tests | toggle | — |
| source_content | textarea | — |
| transform_type | select | summarize / translate / rewrite / simplify / format convert |
| preserve | list | — |
| subject | textarea | — |
| analyze_type | select | evaluate / compare / data interpretation |
| criteria | list | — |
| compared_subjects | list | — |
| benchmark | textarea | — |
| problem | textarea | — |
| current_state | textarea | — |
| idea_count | number | — |
| evaluation_criteria | list | — |
| tradeoff_preference | text | — |
| plan | textarea | — |
| tools_to_use | list | — |
| checkpoints | list | — |
| error_handling | textarea | — |
| success_criteria | list | — |

**Per-task-type field tables (Scope and Visibility):**

**Ask (提问):**

| Field | Scope | Visibility | Description |
|-------|-------|------------|-------------|
| intent | Universal | Default (required) | Core intent, one sentence |
| context | Universal | Default | Background information |
| requirements | Universal | Default | What must be satisfied |
| constraints | Universal | Default | What to avoid, boundaries |
| output_format | Universal | Default | Desired output form |
| question_type | Task | Default | Question type: factual / conceptual / how-to / opinion |
| audience | Task | Default | Target audience for the output |
| knowledge_level | Task | Optional | User's existing knowledge on the topic |
| goal | Universal | Optional | Desired end state or outcome |
| role | Universal | Optional | Role the AI should assume |
| assumptions | Universal | Optional | Premises AI should take as given |
| scope | Universal | Optional | Boundary of what to cover |
| priority | Universal | Optional | What matters most when trade-offs arise |
| output_language | Universal | Optional | Language the AI should respond in |
| detail_level | Universal | Optional | Summary / standard / in-depth |
| tone | Universal | Optional | Formal / casual / technical |
| thinking_style | Universal | Optional | Direct answer / step-by-step / pros-and-cons |
| examples | Universal | Optional | Reference examples |
| anti_examples | Universal | Optional | Counter-examples of what is not wanted |
| references | Universal | Optional | Specific sources or materials |
| custom_fields | Universal | Optional | User-defined key-value pairs |

**Create (创作):**

| Field | Scope | Visibility | Description |
|-------|-------|------------|-------------|
| intent | Universal | Default (required) | Core intent, one sentence |
| context | Universal | Default | Background information |
| requirements | Universal | Default | What must be satisfied |
| constraints | Universal | Default | What to avoid, boundaries |
| output_format | Universal | Default | Desired output form |
| content_type | Task | Default | What to create: email / article / doc / code / script |
| key_points | Task | Default | Must-include points or core functionality |
| tone | Task | Default | Formal / casual / technical |
| tech_stack | Task | Optional | Language, framework, libraries (code scenarios) |
| target_length | Task | Optional | Expected length or scale |
| structure | Task | Optional | Expected structure or outline |
| include_tests | Task | Optional | Whether to include tests (code scenarios) |
| goal | Universal | Optional | Desired end state or outcome |
| role | Universal | Optional | Role the AI should assume |
| audience | Universal | Optional | Target audience for the output |
| assumptions | Universal | Optional | Premises AI should take as given |
| scope | Universal | Optional | Boundary of what to cover |
| priority | Universal | Optional | What matters most when trade-offs arise |
| output_language | Universal | Optional | Language the AI should respond in |
| detail_level | Universal | Optional | Summary / standard / in-depth |
| thinking_style | Universal | Optional | Direct answer / step-by-step / pros-and-cons |
| examples | Universal | Optional | Reference examples |
| anti_examples | Universal | Optional | Counter-examples of what is not wanted |
| references | Universal | Optional | Specific sources or materials |
| custom_fields | Universal | Optional | User-defined key-value pairs |

**Transform (转化):**

| Field | Scope | Visibility | Description |
|-------|-------|------------|-------------|
| intent | Universal | Default (required) | Core intent, one sentence |
| context | Universal | Default | Background information |
| requirements | Universal | Default | What must be satisfied |
| constraints | Universal | Default | What to avoid, boundaries |
| output_format | Universal | Default | Desired output form |
| source_content | Task | Default | Original content to transform |
| transform_type | Task | Default | Transformation: summarize / translate / rewrite / simplify / format convert |
| preserve | Task | Optional | Information or characteristics that must be preserved |
| target_length | Task | Optional | Expected length after transformation |
| goal | Universal | Optional | Desired end state or outcome |
| role | Universal | Optional | Role the AI should assume |
| audience | Universal | Optional | Target audience for the output |
| assumptions | Universal | Optional | Premises AI should take as given |
| scope | Universal | Optional | Boundary of what to cover |
| priority | Universal | Optional | What matters most when trade-offs arise |
| output_language | Universal | Optional | Language the AI should respond in |
| detail_level | Universal | Optional | Summary / standard / in-depth |
| tone | Universal | Optional | Formal / casual / technical |
| thinking_style | Universal | Optional | Direct answer / step-by-step / pros-and-cons |
| examples | Universal | Optional | Reference examples |
| anti_examples | Universal | Optional | Counter-examples of what is not wanted |
| references | Universal | Optional | Specific sources or materials |
| custom_fields | Universal | Optional | User-defined key-value pairs |

**Analyze (分析):**

| Field | Scope | Visibility | Description |
|-------|-------|------------|-------------|
| intent | Universal | Default (required) | Core intent, one sentence |
| context | Universal | Default | Background information |
| requirements | Universal | Default | What must be satisfied |
| constraints | Universal | Default | What to avoid, boundaries |
| output_format | Universal | Default | Desired output form |
| subject | Task | Default | Object or content to analyze |
| analyze_type | Task | Default | Analysis type: evaluate / compare / data interpretation |
| criteria | Task | Default | Evaluation dimensions |
| compared_subjects | Task | Optional | Comparison items (comparison scenario, supports multiple) |
| benchmark | Task | Optional | Reference standard or baseline |
| goal | Universal | Optional | Desired end state or outcome |
| role | Universal | Optional | Role the AI should assume |
| audience | Universal | Optional | Target audience for the output |
| assumptions | Universal | Optional | Premises AI should take as given |
| scope | Universal | Optional | Boundary of what to cover |
| priority | Universal | Optional | What matters most when trade-offs arise |
| output_language | Universal | Optional | Language the AI should respond in |
| detail_level | Universal | Optional | Summary / standard / in-depth |
| tone | Universal | Optional | Formal / casual / technical |
| thinking_style | Universal | Optional | Direct answer / step-by-step / pros-and-cons |
| examples | Universal | Optional | Reference examples |
| anti_examples | Universal | Optional | Counter-examples of what is not wanted |
| references | Universal | Optional | Specific sources or materials |
| custom_fields | Universal | Optional | User-defined key-value pairs |

**Ideate (构思):**

| Field | Scope | Visibility | Description |
|-------|-------|------------|-------------|
| intent | Universal | Default (required) | Core intent, one sentence |
| context | Universal | Default | Background information |
| requirements | Universal | Default | What must be satisfied |
| constraints | Universal | Default | What to avoid, boundaries |
| output_format | Universal | Default | Desired output form |
| problem | Task | Default | Problem to solve or direction to explore |
| current_state | Task | Default | Current situation description |
| goal | Task | Default | Desired end state or outcome |
| assumptions | Task | Default | Premises AI should take as given |
| idea_count | Task | Optional | How many ideas/options to generate |
| evaluation_criteria | Task | Optional | How to judge idea quality |
| tradeoff_preference | Task | Optional | Trade-off preference (e.g., speed vs quality, cost vs performance) |
| role | Universal | Optional | Role the AI should assume |
| audience | Universal | Optional | Target audience for the output |
| scope | Universal | Optional | Boundary of what to cover |
| priority | Universal | Optional | What matters most when trade-offs arise |
| output_language | Universal | Optional | Language the AI should respond in |
| detail_level | Universal | Optional | Summary / standard / in-depth |
| tone | Universal | Optional | Formal / casual / technical |
| thinking_style | Universal | Optional | Direct answer / step-by-step / pros-and-cons |
| examples | Universal | Optional | Reference examples |
| anti_examples | Universal | Optional | Counter-examples of what is not wanted |
| references | Universal | Optional | Specific sources or materials |
| custom_fields | Universal | Optional | User-defined key-value pairs |

**Execute (执行):**

| Field | Scope | Visibility | Description |
|-------|-------|------------|-------------|
| intent | Universal | Default (required) | Core intent, one sentence |
| context | Universal | Default | Background information |
| requirements | Universal | Default | What must be satisfied |
| constraints | Universal | Default | What to avoid, boundaries |
| output_format | Universal | Default | Desired output form |
| plan | Task | Default | Known steps or workflow; can be left empty for AI to plan, or paste an existing plan |
| goal | Task | Default | Desired end state or outcome |
| tools_to_use | Task | Optional | Tools the agent must use in this task |
| checkpoints | Task | Optional | Where to pause for confirmation |
| error_handling | Task | Optional | Strategy when errors occur |
| success_criteria | Task | Optional | How to determine task completion |
| role | Universal | Optional | Role the AI should assume |
| audience | Universal | Optional | Target audience for the output |
| assumptions | Universal | Optional | Premises AI should take as given |
| scope | Universal | Optional | Boundary of what to cover |
| priority | Universal | Optional | What matters most when trade-offs arise |
| output_language | Universal | Optional | Language the AI should respond in |
| detail_level | Universal | Optional | Summary / standard / in-depth |
| tone | Universal | Optional | Formal / casual / technical |
| thinking_style | Universal | Optional | Direct answer / step-by-step / pros-and-cons |
| examples | Universal | Optional | Reference examples |
| anti_examples | Universal | Optional | Counter-examples of what is not wanted |
| references | Universal | Optional | Specific sources or materials |
| custom_fields | Universal | Optional | User-defined key-value pairs |

### Progressive Disclosure Mechanism

- Every field has two independent attributes: **Scope** (Universal / Task) and **Visibility** (Default / Optional). Both can be configured per task type.
- On task type selection, the editor shows all fields with Visibility = Default (regardless of Scope).
- The "Add field" panel is collapsible, divided into two groups:
  - **Task optional fields** (shown first) — fields with Scope = Task and Visibility = Optional.
  - **Universal optional fields** (shown second) — fields with Scope = Universal and Visibility = Optional.
- Each addable field displays: field name, one-line description, and a usage scenario hint.
- Custom fields are always available at the bottom of the add panel.
- A field's Scope and Visibility can be dynamically adjusted in future iterations (e.g., if analytics show a Universal Optional field is frequently added for a task type, it can be re-scoped or promoted).

### Output Compilation

- Four equal output formats: Markdown / JSON / YAML / XML.
- All formats order fields by importance: intent → task-specific core fields → requirements/constraints → optional fields → custom fields.
- Field ordering is controlled by the Compiler, consistent across all formats.

### i18n Strategy

- `output_language` is a field in the compiled output — it tells the AI what language to respond in. It is independent of the project's UI language.
- The project's UI language (Chinese / English) is a user preference toggle.
- All UI text (field names, descriptions, hints, buttons) has bilingual translations.
- Compiled output uses the UI language for structural elements (field labels, section headers).

## Testing Decisions

### What makes a good test

Tests should verify external behavior and user-visible outcomes, not implementation details. A good test answers: "if I change the internal implementation but keep the same interface contract, does this test still pass?"

### Modules to test

**Template Registry**
- Given a task type, returns correct default fields, optional fields, and grouping.
- Universal field promotions are applied correctly per task type.
- Field ordering is consistent.

**Compiler**
- Given field data and a format, produces correctly structured output.
- Field ordering by importance is preserved.
- Empty optional fields are omitted from output.
- Required field validation works.

**Output Formatter**
- Each format (MD / JSON / YAML / XML) produces valid, parseable output.
- Field ordering is preserved across all formats.

**Storage (Dexie.js)**
- Schema versioning and migration works correctly.
- CRUD operations on templates, preferences, and history.

### Modules not requiring dedicated tests (initially)

- **Editor UI**: Tested through manual interaction and visual review. Component-level tests can be added later.
- **AI Connector**: Depends on external API; tested via integration tests when AI mode is implemented.
- **i18n**: Verified through visual review of both language modes.

## Out of Scope

- **User accounts and cloud sync** — this is a pure client-side tool. No server-side storage, no login.
- **Natural language parsing without AI** — the non-AI mode relies on users filling template fields. Natural language → structure extraction requires the AI-enhanced mode.
- **Prompt library / community sharing** — no social features, no marketplace.
- **AI-powered chat or conversation inside the tool** — AI is limited to field filling; the tool generates prompts, users paste them elsewhere.
- **Mobile adaptation** — v1 focuses on desktop browsers; mobile layout deferred to future iteration.
- **Page-level layout visual design** — the features surrounding the editor (language toggle, API key configuration, history view, preferences panel) are functionally in scope, but their visual placement and layout within the overall page are to be designed separately.
- **Role Play task type** — deferred to a future version; can be approximated with Ask or Create.

## Further Notes

- **AI-enhanced mode** is an incremental feature. The core product must deliver full value without AI. AI mode assists with field filling (input side), not output optimization — it helps users populate template fields from a brief intent, but the compilation process remains the same.
- **Template versioning** is important from day one. As the product evolves, template schemas will change. Dexie.js's built-in migration mechanism handles this, but schema changes should be backward-compatible where possible.
- **The "verb + mental model" mapping** (Ask/Create/Transform/Analyze/Ideate/Execute) is a core product identity element. It should be prominently displayed in the task type selector and consistently used across all UI and documentation.
- **Custom fields** are an escape hatch. If analytics later show that certain custom fields are frequently used, they should be considered for promotion into built-in fields.
