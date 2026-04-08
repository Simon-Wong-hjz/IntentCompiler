# Compiler Module

The compiler transforms raw field values into structured output. It works as a two-stage pipeline:

```
FieldDefinition[] + fieldValues → compileFields() → OrderedField[] → Formatter.format() → string
```

## Key Types (`types.ts`)

- **`OrderedField`**: `{ key, label, value }` — a compiled field ready for formatting
- **`Formatter`**: Interface with a single `format(fields: OrderedField[]): string` method
- **`OutputFormat`**: `'markdown' | 'json' | 'yaml' | 'xml'`
- **`Language`**: `'en' | 'zh'`

## Pipeline

### Stage 1: `compileFields()` (`compiler.ts`)

- Takes `FieldDefinition[]` (from registry) and `Record<string, unknown>` (user input)
- Iterates definitions **in order**, skipping empty values (`hasValue()` check)
- Converts each field key to a human-readable label via `keyToLabel()` from `lib/format.ts`
- Returns `OrderedField[]` — only fields the user actually filled in

### Stage 2: Formatter (`formatters/`)

- `getFormatter(format)` returns the appropriate `Formatter` implementation
- Currently only `MarkdownFormatter` exists; JSON/YAML/XML formatters come in Phase 3

## Formatters (`../formatters/`)

```
formatters/
├── index.ts          # getFormatter() — factory function
└── markdown.ts       # MarkdownFormatter — outputs "# Label\nValue" sections
```

### Adding a New Formatter

1. Create `formatters/<format>.ts` implementing the `Formatter` interface
2. Register it in `formatters/index.ts` via the `getFormatter()` switch/map
3. Each formatter receives `OrderedField[]` and returns a single string

## Hook Integration

`useCompiler` hook (`hooks/useCompiler.ts`) wraps both stages in a `useMemo`:
- Inputs: `fieldDefinitions`, `fieldValues`, `format`
- Returns: `{ compiledOutput: string, hasContent: boolean }`
- Recomputes only when inputs change (React memoization)

## Conventions

- Formatters are stateless classes — no side effects
- Labels are derived from field keys via `lib/format.ts`, not stored in field values
- Empty/null/whitespace-only values are excluded from output
