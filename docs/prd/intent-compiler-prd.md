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
14. As a user, I want to provide an AI API key to enable AI-enhanced compilation, so that the tool can optimize and refine my structured input into a higher-quality prompt.
15. As a user, I want my API key to be stored securely in my browser and never sent to any server other than the AI provider, so that I trust the tool with my credentials.
16. As a user, I want to save my preferences (language, default output format, API key) locally, so that I don't have to reconfigure the tool every time I visit.
17. As a user, I want to save and reuse custom templates, so that I can build on my frequently used patterns.
18. As a user, I want to view my compilation history, so that I can revisit or reuse previous prompts.
19. As a user, I want the tool to work entirely in my browser with no backend dependency (in non-AI mode), so that I have full control over my data.
20. As a user, I want to use the tool on both desktop and mobile browsers, so that I can compile prompts wherever I am.
21. As a user selecting "Ask", I want to see intent, context, requirements, constraints, output_format, question_type, and audience as default fields, so that the template is optimized for asking questions.
22. As a user selecting "Create", I want to see intent, context, requirements, constraints, output_format, content_type, key_points, and tone as default fields, so that the template is optimized for creation tasks.
23. As a user selecting "Transform", I want to see intent, context, requirements, constraints, output_format, source_content, and transform_type as default fields, so that the template is optimized for content transformation.
24. As a user selecting "Analyze", I want to see intent, context, requirements, constraints, output_format, subject, analyze_type, and criteria as default fields, so that the template is optimized for analysis tasks.
25. As a user selecting "Ideate", I want to see intent, context, requirements, constraints, output_format, problem, current_state, desired_outcome (goal), assumptions, and goal as default fields, so that the template is optimized for ideation and problem-solving.
26. As a user selecting "Execute", I want to see intent, context, requirements, constraints, output_format, plan, and goal as default fields, so that the template is optimized for agent task instructions.
27. As a user, I want the addable field list to show task-specific optional fields above universal optional fields, so that the most relevant options are easy to find.
28. As a user, I want fields to support both free text input and predefined options (e.g., question_type: factual / conceptual / how-to / opinion), so that I have guidance without losing flexibility.

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
- Task type selector mapped to verb + mental model labels (e.g., "Ask — I want to know something / 提问 — 我想知道一件事").
- Default fields shown immediately; addable fields in a collapsible panel, grouped (task-specific first, universal second), each with description and usage hint.
- Custom field support via key-value pair input.
- One-click copy to clipboard.

**i18n**
- Bilingual support (Chinese / English) for all UI copy: field names, descriptions, hints, buttons, labels.
- Compiled output templates are bilingual — output language follows UI language setting.
- `output_language` field in compiled output is independent — it specifies the language the AI should respond in, not the language of the prompt itself.

**AI Connector**
- Optional module, activated when user provides an API key.
- Abstract interface supporting multiple AI providers (OpenAI, Anthropic, etc.).
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

**Universal fields (shared by all task types):**

Default shown (5):
- `intent` (required) — core intent, one sentence
- `context` — background information
- `requirements` — what must be satisfied
- `constraints` — what to avoid, boundaries
- `output_format` — desired output form

Optional (14):
- `goal` — desired end state or outcome (promoted to default for Ideate, Execute)
- `role` — role the AI should assume
- `audience` — target audience for the output (promoted to default for Ask)
- `assumptions` — premises AI should take as given (promoted to default for Ideate)
- `scope` — boundary of what to cover
- `priority` — what matters most when trade-offs arise
- `output_language` — language the AI should respond in
- `detail_level` — summary / standard / in-depth
- `tone` — formal / casual / technical (promoted to default for Create)
- `thinking_style` — direct answer / step-by-step / pros-and-cons
- `examples` — reference examples
- `anti_examples` — counter-examples of what is not wanted
- `references` — specific sources or materials
- `custom_fields` — user-defined key-value pairs

**Task-specific fields:**

**Ask:**
| Field | Default | Description |
|-------|---------|-------------|
| question_type | Y | Question type: factual / conceptual / how-to / opinion |
| knowledge_level | | User's existing knowledge on the topic |

Universal promotions: `audience`

**Create:**
| Field | Default | Description |
|-------|---------|-------------|
| content_type | Y | What to create: email / article / doc / code / script |
| key_points | Y | Must-include points or core functionality |
| tech_stack | | Language, framework, libraries (code scenarios) |
| target_length | | Expected length or scale |
| structure | | Expected structure or outline |
| include_tests | | Whether to include tests (code scenarios) |

Universal promotions: `tone`

**Transform:**
| Field | Default | Description |
|-------|---------|-------------|
| source_content | Y | Original content to transform |
| transform_type | Y | Transformation: summarize / translate / rewrite / simplify / format convert |
| preserve | | Information or characteristics that must be preserved |
| target_length | | Expected length after transformation |

Universal promotions: none

**Analyze:**
| Field | Default | Description |
|-------|---------|-------------|
| subject | Y | Object or content to analyze |
| analyze_type | Y | Analysis type: evaluate / compare / data interpretation |
| criteria | Y | Evaluation dimensions |
| compared_subjects | | Comparison items (comparison scenario, supports multiple) |
| benchmark | | Reference standard or baseline |

Universal promotions: none

**Ideate:**
| Field | Default | Description |
|-------|---------|-------------|
| problem | Y | Problem to solve or direction to explore |
| current_state | Y | Current situation description |
| idea_count | | How many ideas/options to generate |
| evaluation_criteria | | How to judge idea quality |
| tradeoff_preference | | Trade-off preference (e.g., speed vs quality, cost vs performance) |

Universal promotions: `goal`, `assumptions`

**Execute:**
| Field | Default | Description |
|-------|---------|-------------|
| plan | Y | Known steps or workflow; can be left empty for AI to plan, or paste an existing plan |
| tools_to_use | | Tools the agent must use in this task |
| checkpoints | | Where to pause for confirmation |
| error_handling | | Strategy when errors occur |
| success_criteria | | How to determine task completion |

Universal promotions: `goal`

### Progressive Disclosure Mechanism

- On task type selection, show: universal default fields + task-specific default fields + promoted universal fields.
- "Add field" panel is collapsible, divided into two groups:
  - **Task-specific optional fields** (shown first) — fields unique to the selected task type.
  - **Universal optional fields** (shown second) — remaining universal fields not already displayed.
- Each addable field displays: field name, one-line description, and a usage scenario hint.
- Custom fields are always available at the bottom of the add panel.

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
- **AI-powered intent parsing from natural language** — the non-AI mode relies on users filling template fields. Natural language → structure extraction is not in scope.
- **Prompt library / community sharing** — no social features, no marketplace.
- **Direct AI integration in the editor** (e.g., "chat with AI inside the tool") — the tool generates prompts; users paste them elsewhere.
- **Mobile-native apps** — web responsive is sufficient; no native iOS/Android builds.
- **Role Play task type** — deferred to a future version; can be approximated with Ask or Create.

## Further Notes

- **AI-enhanced mode** is an incremental feature. The core product must deliver full value without AI. AI mode refines and optimizes the compiled output but does not change the fundamental interaction model.
- **Template versioning** is important from day one. As the product evolves, template schemas will change. Dexie.js's built-in migration mechanism handles this, but schema changes should be backward-compatible where possible.
- **The "verb + mental model" mapping** (Ask/Create/Transform/Analyze/Ideate/Execute) is a core product identity element. It should be prominently displayed in the task type selector and consistently used across all UI and documentation.
- **Custom fields** are an escape hatch. If analytics later show that certain custom fields are frequently used, they should be considered for promotion into built-in fields.
