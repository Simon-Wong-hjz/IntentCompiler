# Phase 3: All Output Formats + i18n -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JSON, YAML, and XML output formatters alongside the existing Markdown formatter, integrate full bilingual (EN/ZH) support for all UI text, and provide independent controls for UI language and output language.

**Architecture:** Three new formatter modules (`json.ts`, `yaml.ts`, `xml.ts`) implement the same `Formatter` interface, receiving pre-sorted `OrderedField[]` from the compiler and producing valid serialized output. The `react-i18next` library provides runtime language switching for all UI text via a single `translation` namespace with keys organized by section. UI language (TopBar toggle) and output language (PreviewHeader toggle) are independent pieces of state -- the compiler accepts `outputLanguage` to determine field label translations in compiled output while the UI renders in whichever language the user prefers.

**Tech Stack:** React 19.2, TypeScript 6, Vite 8, Tailwind CSS v4, react-i18next + i18next (UI translations), js-yaml (YAML serialization), fast-xml-parser (XML building), Vitest 4.1 (formatter tests)

> **Phase 1 Audit Note:** Phase 1 installed newer versions than originally planned. See `.claude/progress/2026-04-07/02-phase-plan-audit.md` for full details. Key differences: Tailwind v4 uses `@theme {}` block in `src/index.css` instead of `tailwind.config.ts`; TypeScript 6 has no `baseUrl`. Additionally, `src/lib/format.ts` contains both `keyToLabel()` (English, used by compiler for output) and `keyToLabelZh()` (Chinese, used by FieldRenderer for UI labels) — evaluate whether these become obsolete or need i18n-aware replacements when implementing this phase.

> **Chinese-First Localization Note:** CLAUDE.md establishes Chinese as the primary UI language. When implementing this phase:
> 1. **Task 9 (i18n config):** Default language must be `'zh'`, not `'en'`. `getStoredLanguage()` fallback and `fallbackLng` should both default to `'zh'`.
> 2. **Task 10 (App.tsx state):** `outputLanguage` initial state should be `'zh'`, not `'en'`.
> 3. **Task 11 (Compiler):** Default output language parameter should be `'zh'`.
> 4. **Task 14 (TopBar):** The existing Chinese-first UI toggle (中 as active) should be preserved; the i18n toggle replaces it functionally.
> 5. **Existing Chinese strings:** Phase 1 hardcoded Chinese UI strings (e.g., in CopyButton, EditorArea, IntentField, FieldRenderer). These will be migrated to i18n keys, with Chinese as the `zh.json` values.
>
> Additionally, preserve the following Phase 1 behaviors:
> - **`canCopy` prop chain** (App→PageLayout→PreviewArea→CopyButton): Copy button requires both content AND non-empty Intent. Do not merge `canCopy` with `hasContent`.
> - **Intent field conditional glow**: Three states — red border+glow when empty, gold border+glow when non-empty+focused, default border when non-empty+unfocused. Do not override when adding i18n to IntentField.
> - **Task switching preserves Intent**: `handleSelectType` in App.tsx preserves Intent value and shows `window.confirm` for non-Intent fields. Do not override this behavior.

---

## File Structure

```
Files to CREATE:
  src/formatters/json.ts              -- JSON formatter
  src/formatters/yaml.ts              -- YAML formatter (with ordering workaround)
  src/formatters/xml.ts               -- XML formatter
  src/components/preview/PreviewHeader.tsx  -- format pills + output language toggle
  src/i18n/config.ts                  -- i18next initialization
  src/i18n/locales/en.json            -- English translations (complete)
  src/i18n/locales/zh.json            -- Chinese translations (complete)
  tests/formatters/json.test.ts       -- JSON formatter tests
  tests/formatters/yaml.test.ts       -- YAML formatter tests
  tests/formatters/xml.test.ts        -- XML formatter tests

Files to MODIFY:
  package.json                        -- add dependencies
  src/formatters/index.ts             -- register all formatters
  src/App.tsx                         -- i18n provider, outputLanguage + outputFormat state
  src/compiler/compiler.ts            -- accept outputLanguage, translate field labels
  src/components/preview/PreviewArea.tsx  -- integrate PreviewHeader
  src/components/layout/TopBar.tsx    -- add UI language segmented control
  src/components/task-selector/TaskCard.tsx  -- use i18n for verb + mental model
  src/components/editor/FieldLabel.tsx      -- use i18n for field names + hints
  src/components/editor/AddFieldPanel.tsx   -- use i18n for section headers + descriptions
  src/components/editor/IntentField.tsx     -- use i18n for placeholders
  src/components/preview/CopyButton.tsx     -- use i18n for button text
```

---

### Task 1: Install Dependencies
**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install production dependencies**
```bash
npm install react-i18next i18next js-yaml fast-xml-parser
```

- [ ] **Step 2: Install type definitions for js-yaml**
```bash
npm install -D @types/js-yaml
```

- [ ] **Step 3: Verify all dependencies resolve**
```bash
npm ls react-i18next i18next js-yaml fast-xml-parser
```
Expected: all four packages listed with resolved versions, no `UNMET` or `ERR!` lines.

- [ ] **Step 4: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: add react-i18next, js-yaml, fast-xml-parser dependencies for Phase 3"
```

---

### Task 2: JSON Formatter -- Tests
**Files:**
- Create: `tests/formatters/json.test.ts`

- [ ] **Step 1: Write the failing tests**
Create `tests/formatters/json.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { JsonFormatter } from '../../src/formatters/json';
import type { OrderedField } from '../../src/types';

describe('JsonFormatter', () => {
  const formatter = new JsonFormatter();

  it('produces valid parseable JSON from ordered fields', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Write a REST API' },
      { key: 'context', label: 'Context', value: 'Node.js project' },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({
      Intent: 'Write a REST API',
      Context: 'Node.js project',
    });
  });

  it('preserves field ordering in output', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Do something' },
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure'] },
      { key: 'context', label: 'Context', value: 'Background info' },
    ];
    const result = formatter.format(fields);
    const keys = Object.keys(JSON.parse(result));
    expect(keys).toEqual(['Intent', 'Requirements', 'Context']);
  });

  it('handles array values', () => {
    const fields: OrderedField[] = [
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure', 'scalable'] },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed.Requirements).toEqual(['fast', 'secure', 'scalable']);
  });

  it('handles boolean values', () => {
    const fields: OrderedField[] = [
      { key: 'include_tests', label: 'Include Tests', value: true },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed['Include Tests']).toBe(true);
  });

  it('handles numeric values', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea Count', value: 5 },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed['Idea Count']).toBe(5);
  });

  it('handles key-value pair values (objects)', () => {
    const fields: OrderedField[] = [
      {
        key: 'custom_fields',
        label: 'Custom Fields',
        value: { deadline: '2026-05-01', priority: 'high' },
      },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed['Custom Fields']).toEqual({ deadline: '2026-05-01', priority: 'high' });
  });

  it('handles special characters in values', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Parse "JSON" with <special> & chars' },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed.Intent).toBe('Parse "JSON" with <special> & chars');
  });

  it('handles multiline string values', () => {
    const fields: OrderedField[] = [
      { key: 'context', label: 'Context', value: 'Line 1\nLine 2\nLine 3' },
    ];
    const result = formatter.format(fields);
    const parsed = JSON.parse(result);
    expect(parsed.Context).toBe('Line 1\nLine 2\nLine 3');
  });

  it('returns empty JSON object for empty fields array', () => {
    const result = formatter.format([]);
    expect(JSON.parse(result)).toEqual({});
  });

  it('outputs with 2-space indentation for readability', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Test' },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('\n');
    expect(result).toMatch(/^{\n {2}"/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
npx vitest run tests/formatters/json.test.ts
```
Expected: all tests fail with `Cannot find module '../../src/formatters/json'`.

- [ ] **Step 3: Commit test file**
```bash
git add tests/formatters/json.test.ts
git commit -m "test: add JSON formatter tests (red phase)"
```

---

### Task 3: JSON Formatter -- Implementation
**Files:**
- Create: `src/formatters/json.ts`

- [ ] **Step 1: Write the implementation**
Create `src/formatters/json.ts`:
```typescript
import type { OrderedField, Formatter } from '../types';

export class JsonFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    // Build entries array to preserve insertion order
    const entries: [string, unknown][] = fields.map((field) => [
      field.label,
      field.value,
    ]);

    // Object.fromEntries preserves insertion order in modern JS engines
    const obj = Object.fromEntries(entries);
    return JSON.stringify(obj, null, 2);
  }
}
```

- [ ] **Step 2: Run tests to verify they pass**
```bash
npx vitest run tests/formatters/json.test.ts
```
Expected: all 10 tests pass.

- [ ] **Step 3: Commit**
```bash
git add src/formatters/json.ts
git commit -m "feat: implement JSON formatter"
```

---

### Task 4: YAML Formatter -- Tests
**Files:**
- Create: `tests/formatters/yaml.test.ts`

- [ ] **Step 1: Write the failing tests**
Create `tests/formatters/yaml.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import * as yaml from 'js-yaml';
import { YamlFormatter } from '../../src/formatters/yaml';
import type { OrderedField } from '../../src/types';

describe('YamlFormatter', () => {
  const formatter = new YamlFormatter();

  it('produces valid parseable YAML from ordered fields', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Write a REST API' },
      { key: 'context', label: 'Context', value: 'Node.js project' },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed).toEqual({
      Intent: 'Write a REST API',
      Context: 'Node.js project',
    });
  });

  it('preserves field ordering in output', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Do something' },
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure'] },
      { key: 'context', label: 'Context', value: 'Background info' },
    ];
    const result = formatter.format(fields);
    const lines = result.split('\n').filter((line) => /^\S/.test(line));
    // First non-indented keys should appear in insertion order
    expect(lines[0]).toMatch(/^Intent:/);
    expect(lines[1]).toMatch(/^Requirements:/);
    // "Context" comes after the Requirements list items
    const contextLine = lines.find((l) => l.startsWith('Context:'));
    expect(contextLine).toBeDefined();
  });

  it('handles array values as YAML sequences', () => {
    const fields: OrderedField[] = [
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure', 'scalable'] },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed.Requirements).toEqual(['fast', 'secure', 'scalable']);
  });

  it('handles boolean values', () => {
    const fields: OrderedField[] = [
      { key: 'include_tests', label: 'Include Tests', value: true },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed['Include Tests']).toBe(true);
  });

  it('handles numeric values', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea Count', value: 5 },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed['Idea Count']).toBe(5);
  });

  it('handles key-value pair values as nested YAML mappings', () => {
    const fields: OrderedField[] = [
      {
        key: 'custom_fields',
        label: 'Custom Fields',
        value: { deadline: '2026-05-01', priority: 'high' },
      },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed['Custom Fields']).toEqual({
      deadline: '2026-05-01',
      priority: 'high',
    });
  });

  it('handles special characters in values without corruption', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Use "quotes" & <angle brackets>' },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect(parsed.Intent).toBe('Use "quotes" & <angle brackets>');
  });

  it('handles multiline string values', () => {
    const fields: OrderedField[] = [
      { key: 'context', label: 'Context', value: 'Line 1\nLine 2\nLine 3' },
    ];
    const result = formatter.format(fields);
    const parsed = yaml.load(result) as Record<string, unknown>;
    expect((parsed.Context as string).trim()).toBe('Line 1\nLine 2\nLine 3');
  });

  it('returns empty YAML for empty fields array', () => {
    const result = formatter.format([]);
    // js-yaml.dump({}) produces '{}\n'
    const parsed = yaml.load(result);
    expect(parsed).toBeNull();
  });

  it('preserves insertion order even with many fields', () => {
    const fields: OrderedField[] = [
      { key: 'a', label: 'Alpha', value: '1' },
      { key: 'b', label: 'Beta', value: '2' },
      { key: 'c', label: 'Gamma', value: '3' },
      { key: 'd', label: 'Delta', value: '4' },
      { key: 'e', label: 'Epsilon', value: '5' },
    ];
    const result = formatter.format(fields);
    const topLevelKeys = result
      .split('\n')
      .filter((line) => /^\S/.test(line) && line.includes(':'))
      .map((line) => line.split(':')[0]);
    expect(topLevelKeys).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
npx vitest run tests/formatters/yaml.test.ts
```
Expected: all tests fail with `Cannot find module '../../src/formatters/yaml'`.

- [ ] **Step 3: Commit test file**
```bash
git add tests/formatters/yaml.test.ts
git commit -m "test: add YAML formatter tests (red phase)"
```

---

### Task 5: YAML Formatter -- Implementation
**Files:**
- Create: `src/formatters/yaml.ts`

- [ ] **Step 1: Write the implementation**

Create `src/formatters/yaml.ts`:
```typescript
import * as yaml from 'js-yaml';
import type { OrderedField, Formatter } from '../types';

/**
 * YAML formatter that preserves field insertion order.
 *
 * js-yaml's dump() does not guarantee key order when given a plain object.
 * To preserve ordering, we manually build the YAML string by dumping each
 * field individually and concatenating the results.
 */
export class YamlFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) {
      return '';
    }

    // Dump each field individually to preserve insertion order.
    // js-yaml.dump({ key: value }) produces "key: value\n" for simple values
    // and multi-line output for arrays/objects. Concatenating these fragments
    // yields a valid YAML document with guaranteed key order.
    const fragments = fields.map((field) => {
      const singleEntry = { [field.label]: field.value };
      return yaml.dump(singleEntry, {
        lineWidth: -1,       // Disable line wrapping
        quotingType: '"',    // Use double quotes when quoting is needed
        forceQuotes: false,  // Only quote when necessary
      });
    });

    return fragments.join('');
  }
}
```

- [ ] **Step 2: Run tests to verify they pass**
```bash
npx vitest run tests/formatters/yaml.test.ts
```
Expected: all 10 tests pass. If the empty-fields test expects `null` from `yaml.load('')`, adjust: `yaml.load('')` returns `undefined`, so update the assertion to `expect(parsed).toBeUndefined()` or handle in implementation. The implementation returns `''` for empty fields, and `yaml.load('')` returns `undefined`. Update the test assertion if needed:
```typescript
// In the "returns empty YAML" test, replace:
expect(parsed).toBeNull();
// with:
expect(parsed).toBeUndefined();
```

- [ ] **Step 3: Commit**
```bash
git add src/formatters/yaml.ts
git commit -m "feat: implement YAML formatter with insertion-order preservation"
```

---

### Task 6: XML Formatter -- Tests
**Files:**
- Create: `tests/formatters/xml.test.ts`

- [ ] **Step 1: Write the failing tests**
Create `tests/formatters/xml.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import { XmlFormatter } from '../../src/formatters/xml';
import type { OrderedField } from '../../src/types';

const parser = new XMLParser({
  preserveOrder: true,
  trimValues: false,
});

/**
 * Helper: extract tag names from parsed XML children of <prompt>.
 * fast-xml-parser with preserveOrder returns an array of objects,
 * each with a single key (the tag name).
 */
function getChildTagNames(xmlString: string): string[] {
  const parsed = parser.parse(xmlString);
  // parsed is an array; find the <prompt> wrapper
  const promptNode = parsed.find((node: Record<string, unknown>) => 'prompt' in node);
  if (!promptNode) return [];
  const children = promptNode.prompt as Record<string, unknown>[];
  return children
    .map((child: Record<string, unknown>) =>
      Object.keys(child).find((k) => k !== ':@')
    )
    .filter(Boolean) as string[];
}

describe('XmlFormatter', () => {
  const formatter = new XmlFormatter();

  it('produces valid XML wrapped in <prompt> root element', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Write a REST API' },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<prompt>');
    expect(result).toContain('</prompt>');
    expect(result).toContain('<Intent>');
    expect(result).toContain('</Intent>');
    // Should be parseable without throwing
    expect(() => parser.parse(result)).not.toThrow();
  });

  it('preserves field ordering in output', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Do something' },
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure'] },
      { key: 'context', label: 'Context', value: 'Background info' },
    ];
    const result = formatter.format(fields);
    const intentPos = result.indexOf('<Intent>');
    const requirementsPos = result.indexOf('<Requirements>');
    const contextPos = result.indexOf('<Context>');
    expect(intentPos).toBeLessThan(requirementsPos);
    expect(requirementsPos).toBeLessThan(contextPos);
  });

  it('handles array values with <item> sub-elements', () => {
    const fields: OrderedField[] = [
      { key: 'requirements', label: 'Requirements', value: ['fast', 'secure', 'scalable'] },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<item>fast</item>');
    expect(result).toContain('<item>secure</item>');
    expect(result).toContain('<item>scalable</item>');
  });

  it('handles boolean values', () => {
    const fields: OrderedField[] = [
      { key: 'include_tests', label: 'Include_Tests', value: true },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Include_Tests>true</Include_Tests>');
  });

  it('handles numeric values', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea_Count', value: 5 },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Idea_Count>5</Idea_Count>');
  });

  it('handles key-value pair values with sub-elements', () => {
    const fields: OrderedField[] = [
      {
        key: 'custom_fields',
        label: 'Custom_Fields',
        value: { deadline: '2026-05-01', priority: 'high' },
      },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('<Custom_Fields>');
    expect(result).toContain('<deadline>2026-05-01</deadline>');
    expect(result).toContain('<priority>high</priority>');
    expect(result).toContain('</Custom_Fields>');
  });

  it('escapes special XML characters in text content', () => {
    const fields: OrderedField[] = [
      { key: 'intent', label: 'Intent', value: 'Use <angle> & "quotes" properly' },
    ];
    const result = formatter.format(fields);
    // Must not contain raw < or & inside text content (they should be escaped)
    const intentContent = result.match(/<Intent>([\s\S]*?)<\/Intent>/)?.[1] ?? '';
    expect(intentContent).not.toContain('<angle>');
    expect(intentContent).toContain('&lt;');
    expect(intentContent).toContain('&amp;');
    // Should be parseable
    expect(() => parser.parse(result)).not.toThrow();
  });

  it('handles multiline string values', () => {
    const fields: OrderedField[] = [
      { key: 'context', label: 'Context', value: 'Line 1\nLine 2\nLine 3' },
    ];
    const result = formatter.format(fields);
    expect(result).toContain('Line 1\nLine 2\nLine 3');
    expect(() => parser.parse(result)).not.toThrow();
  });

  it('returns empty prompt element for empty fields array', () => {
    const result = formatter.format([]);
    expect(result).toContain('<prompt>');
    expect(result).toContain('</prompt>');
    // Should only contain the wrapper, nothing else meaningful
    const content = result.replace(/<\/?prompt>/g, '').trim();
    expect(content).toBe('');
  });

  it('converts spaces in labels to underscores for valid XML tag names', () => {
    const fields: OrderedField[] = [
      { key: 'idea_count', label: 'Idea Count', value: 3 },
    ];
    const result = formatter.format(fields);
    // XML tags cannot contain spaces; labels should be sanitized
    expect(result).toContain('<Idea_Count>');
    expect(result).not.toContain('<Idea Count>');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
npx vitest run tests/formatters/xml.test.ts
```
Expected: all tests fail with `Cannot find module '../../src/formatters/xml'`.

- [ ] **Step 3: Commit test file**
```bash
git add tests/formatters/xml.test.ts
git commit -m "test: add XML formatter tests (red phase)"
```

---

### Task 7: XML Formatter -- Implementation
**Files:**
- Create: `src/formatters/xml.ts`

- [ ] **Step 1: Write the implementation**
Create `src/formatters/xml.ts`:
```typescript
import type { OrderedField, Formatter } from '../types';

/**
 * Escape special XML characters in text content.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Sanitize a label string into a valid XML tag name.
 * Replaces spaces with underscores and removes invalid characters.
 */
function sanitizeTagName(label: string): string {
  return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
}

/**
 * Serialize a value into XML string content, with proper indentation.
 */
function serializeValue(value: unknown, indent: string): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => `\n${indent}  <item>${escapeXml(String(item))}</item>`)
      .join('') + `\n${indent}`;
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries
      .map(
        ([key, val]) =>
          `\n${indent}  <${sanitizeTagName(key)}>${escapeXml(String(val))}</${sanitizeTagName(key)}>`
      )
      .join('') + `\n${indent}`;
  }

  return escapeXml(String(value));
}

export class XmlFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) {
      return '<prompt>\n</prompt>';
    }

    const indent = '  ';
    const body = fields
      .map((field) => {
        const tag = sanitizeTagName(field.label);
        const content = serializeValue(field.value, indent);
        return `${indent}<${tag}>${content}</${tag}>`;
      })
      .join('\n');

    return `<prompt>\n${body}\n</prompt>`;
  }
}
```

- [ ] **Step 2: Run tests to verify they pass**
```bash
npx vitest run tests/formatters/xml.test.ts
```
Expected: all 10 tests pass. If any test has a mismatch on whitespace or escaping, adjust the implementation details (e.g., the empty prompt test expects `content.trim()` to be `''`, which works because the implementation produces `<prompt>\n</prompt>`).

- [ ] **Step 3: Commit**
```bash
git add src/formatters/xml.ts
git commit -m "feat: implement XML formatter with proper escaping and tag sanitization"
```

---

### Task 8: Register All Formatters
**Files:**
- Modify: `src/formatters/index.ts`

- [ ] **Step 1: Update the formatter registry**
The existing `src/formatters/index.ts` exports the Markdown formatter. Add the three new formatters and a lookup function.

Add to `src/formatters/index.ts`:
```typescript
import { MarkdownFormatter } from './markdown';
import { JsonFormatter } from './json';
import { YamlFormatter } from './yaml';
import { XmlFormatter } from './xml';
import type { Formatter, OutputFormat } from '../types';

const formatters: Record<OutputFormat, Formatter> = {
  markdown: new MarkdownFormatter(),
  json: new JsonFormatter(),
  yaml: new YamlFormatter(),
  xml: new XmlFormatter(),
};

export function getFormatter(format: OutputFormat): Formatter {
  return formatters[format];
}

export { MarkdownFormatter, JsonFormatter, YamlFormatter, XmlFormatter };
```

- [ ] **Step 2: Verify build**
```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Run all formatter tests**
```bash
npx vitest run tests/formatters/
```
Expected: all tests pass across json, yaml, and xml suites.

- [ ] **Step 4: Commit**
```bash
git add src/formatters/index.ts
git commit -m "feat: register JSON, YAML, XML formatters in formatter index"
```

---

### Task 9: Create i18n Configuration and Translation Files
**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/zh.json`

- [ ] **Step 1: Create the i18next configuration**
Create `src/i18n/config.ts`:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

const STORAGE_KEY = 'intent-compiler-ui-lang';

function getStoredLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'zh';
  } catch {
    return 'zh';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

/**
 * Change UI language and persist to localStorage.
 */
export function setUILanguage(lang: 'en' | 'zh'): void {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable -- silent fail
  }
}

export default i18n;
```

- [ ] **Step 2: Create the English translation file**
Create `src/i18n/locales/en.json`:
```json
{
  "topBar": {
    "appName": "Intent Compiler",
    "history": "History",
    "settings": "Settings"
  },
  "taskTypes": {
    "ask": {
      "verb": "Ask",
      "mentalModel": "I want to know something"
    },
    "create": {
      "verb": "Create",
      "mentalModel": "I want to make something"
    },
    "transform": {
      "verb": "Transform",
      "mentalModel": "I have content, change its form"
    },
    "analyze": {
      "verb": "Analyze",
      "mentalModel": "Help me judge / understand"
    },
    "ideate": {
      "verb": "Ideate",
      "mentalModel": "Help me think / design"
    },
    "execute": {
      "verb": "Execute",
      "mentalModel": "Do a multi-step task for me"
    }
  },
  "fields": {
    "intent": "Intent",
    "context": "Context",
    "requirements": "Requirements",
    "constraints": "Constraints",
    "output_format": "Output Format",
    "goal": "Goal",
    "role": "Role",
    "audience": "Audience",
    "assumptions": "Assumptions",
    "scope": "Scope",
    "priority": "Priority",
    "output_language": "Output Language",
    "detail_level": "Detail Level",
    "tone": "Tone",
    "thinking_style": "Thinking Style",
    "examples": "Examples",
    "anti_examples": "Anti-Examples",
    "references": "References",
    "custom_fields": "Custom Fields",
    "question_type": "Question Type",
    "knowledge_level": "Knowledge Level",
    "content_type": "Content Type",
    "key_points": "Key Points",
    "tech_stack": "Tech Stack",
    "target_length": "Target Length",
    "structure": "Structure",
    "include_tests": "Include Tests",
    "source_content": "Source Content",
    "transform_type": "Transform Type",
    "preserve": "Preserve",
    "subject": "Subject",
    "analyze_type": "Analyze Type",
    "criteria": "Criteria",
    "compared_subjects": "Compared Subjects",
    "benchmark": "Benchmark",
    "problem": "Problem",
    "current_state": "Current State",
    "idea_count": "Idea Count",
    "evaluation_criteria": "Evaluation Criteria",
    "tradeoff_preference": "Tradeoff Preference",
    "plan": "Plan",
    "tools_to_use": "Tools To Use",
    "checkpoints": "Checkpoints",
    "error_handling": "Error Handling",
    "success_criteria": "Success Criteria"
  },
  "fieldDescriptions": {
    "intent": "Core intent, one sentence",
    "context": "Background information",
    "requirements": "What must be satisfied",
    "constraints": "What to avoid, boundaries",
    "output_format": "Desired output form",
    "goal": "Desired end state or outcome",
    "role": "Role the AI should assume",
    "audience": "Target audience for the output",
    "assumptions": "Premises AI should take as given",
    "scope": "Boundary of what to cover",
    "priority": "What matters most when trade-offs arise",
    "output_language": "Language the AI should respond in",
    "detail_level": "Summary / standard / in-depth",
    "tone": "Formal / casual / technical",
    "thinking_style": "Direct answer / step-by-step / pros-and-cons",
    "examples": "Reference examples",
    "anti_examples": "Counter-examples of what is not wanted",
    "references": "Specific sources or materials",
    "custom_fields": "User-defined key-value pairs",
    "question_type": "Question type: factual / conceptual / how-to / opinion",
    "knowledge_level": "User's existing knowledge on the topic",
    "content_type": "What to create: email / article / doc / code / script",
    "key_points": "Must-include points or core functionality",
    "tech_stack": "Language, framework, libraries (code scenarios)",
    "target_length": "Expected length or scale",
    "structure": "Expected structure or outline",
    "include_tests": "Whether to include tests (code scenarios)",
    "source_content": "Original content to transform",
    "transform_type": "Transformation: summarize / translate / rewrite / simplify / format convert",
    "preserve": "Information or characteristics that must be preserved",
    "subject": "Object or content to analyze",
    "analyze_type": "Analysis type: evaluate / compare / data interpretation",
    "criteria": "Evaluation dimensions",
    "compared_subjects": "Comparison items (supports multiple)",
    "benchmark": "Reference standard or baseline",
    "problem": "Problem to solve or direction to explore",
    "current_state": "Current situation description",
    "idea_count": "How many ideas/options to generate",
    "evaluation_criteria": "How to judge idea quality",
    "tradeoff_preference": "Trade-off preference (e.g., speed vs quality)",
    "plan": "Known steps or workflow",
    "tools_to_use": "Tools the agent must use in this task",
    "checkpoints": "Where to pause for confirmation",
    "error_handling": "Strategy when errors occur",
    "success_criteria": "How to determine task completion"
  },
  "hints": {
    "textarea": "Enter text freely",
    "text": "Enter text freely",
    "select": "Click to select one",
    "combo": "Select or type custom",
    "list": "Add items to list",
    "toggle": "Toggle on/off",
    "number": "Click +/\u2212 or type number",
    "key-value": "Add key-value pairs"
  },
  "editor": {
    "addField": "+ Add Field",
    "recommended": "\u2605 Recommended",
    "others": "Others",
    "customFields": "Custom Fields",
    "addItem": "+ Add item...",
    "orTypeCustom": "or type custom value...",
    "selectTaskPrompt": "Select a task type above to begin",
    "keyPlaceholder": "+ key",
    "valuePlaceholder": "value",
    "comingSoon": "Coming soon"
  },
  "preview": {
    "output": "OUTPUT",
    "copyToClipboard": "Copy to Clipboard",
    "copied": "\u2713 Copied!",
    "copyFailed": "\u2717 Copy failed",
    "formatMarkdown": "MD",
    "formatJson": "JSON",
    "formatYaml": "YAML",
    "formatXml": "XML"
  },
  "common": {
    "en": "EN",
    "zh": "\u4e2d"
  }
}
```

- [ ] **Step 3: Create the Chinese translation file**
Create `src/i18n/locales/zh.json`:
```json
{
  "topBar": {
    "appName": "Intent Compiler",
    "history": "\u5386\u53f2\u8bb0\u5f55",
    "settings": "\u8bbe\u7f6e"
  },
  "taskTypes": {
    "ask": {
      "verb": "\u63d0\u95ee",
      "mentalModel": "\u6211\u60f3\u77e5\u9053\u4e00\u4ef6\u4e8b"
    },
    "create": {
      "verb": "\u521b\u4f5c",
      "mentalModel": "\u6211\u60f3\u505a\u51fa\u4e00\u6837\u4e1c\u897f"
    },
    "transform": {
      "verb": "\u8f6c\u5316",
      "mentalModel": "\u6211\u6709\u5185\u5bb9\uff0c\u6362\u4e00\u79cd\u5f62\u5f0f"
    },
    "analyze": {
      "verb": "\u5206\u6790",
      "mentalModel": "\u5e2e\u6211\u5224\u65ad/\u7406\u89e3"
    },
    "ideate": {
      "verb": "\u6784\u601d",
      "mentalModel": "\u5e2e\u6211\u60f3\u529e\u6cd5"
    },
    "execute": {
      "verb": "\u6267\u884c",
      "mentalModel": "\u5e2e\u6211\u505a\u4e00\u4e2a\u591a\u6b65\u9aa4\u4efb\u52a1"
    }
  },
  "fields": {
    "intent": "\u610f\u56fe",
    "context": "\u80cc\u666f",
    "requirements": "\u8981\u6c42",
    "constraints": "\u7ea6\u675f",
    "output_format": "\u8f93\u51fa\u683c\u5f0f",
    "goal": "\u76ee\u6807",
    "role": "\u89d2\u8272",
    "audience": "\u53d7\u4f17",
    "assumptions": "\u524d\u63d0\u5047\u8bbe",
    "scope": "\u8303\u56f4",
    "priority": "\u4f18\u5148\u7ea7",
    "output_language": "\u8f93\u51fa\u8bed\u8a00",
    "detail_level": "\u8be6\u7ec6\u7a0b\u5ea6",
    "tone": "\u8bed\u6c14",
    "thinking_style": "\u601d\u8003\u65b9\u5f0f",
    "examples": "\u793a\u4f8b",
    "anti_examples": "\u53cd\u4f8b",
    "references": "\u53c2\u8003\u8d44\u6599",
    "custom_fields": "\u81ea\u5b9a\u4e49\u5b57\u6bb5",
    "question_type": "\u95ee\u9898\u7c7b\u578b",
    "knowledge_level": "\u77e5\u8bc6\u6c34\u5e73",
    "content_type": "\u5185\u5bb9\u7c7b\u578b",
    "key_points": "\u8981\u70b9",
    "tech_stack": "\u6280\u672f\u6808",
    "target_length": "\u76ee\u6807\u957f\u5ea6",
    "structure": "\u7ed3\u6784",
    "include_tests": "\u5305\u542b\u6d4b\u8bd5",
    "source_content": "\u6e90\u5185\u5bb9",
    "transform_type": "\u8f6c\u5316\u7c7b\u578b",
    "preserve": "\u4fdd\u7559\u5185\u5bb9",
    "subject": "\u5206\u6790\u5bf9\u8c61",
    "analyze_type": "\u5206\u6790\u7c7b\u578b",
    "criteria": "\u8bc4\u4f30\u7ef4\u5ea6",
    "compared_subjects": "\u5bf9\u6bd4\u5bf9\u8c61",
    "benchmark": "\u53c2\u8003\u57fa\u51c6",
    "problem": "\u95ee\u9898",
    "current_state": "\u73b0\u72b6",
    "idea_count": "\u60f3\u6cd5\u6570\u91cf",
    "evaluation_criteria": "\u8bc4\u4f30\u6807\u51c6",
    "tradeoff_preference": "\u6743\u8861\u504f\u597d",
    "plan": "\u8ba1\u5212",
    "tools_to_use": "\u4f7f\u7528\u5de5\u5177",
    "checkpoints": "\u68c0\u67e5\u70b9",
    "error_handling": "\u9519\u8bef\u5904\u7406",
    "success_criteria": "\u6210\u529f\u6807\u51c6"
  },
  "fieldDescriptions": {
    "intent": "\u6838\u5fc3\u610f\u56fe\uff0c\u4e00\u53e5\u8bdd\u8868\u8fbe",
    "context": "\u80cc\u666f\u4fe1\u606f",
    "requirements": "\u5fc5\u987b\u6ee1\u8db3\u7684\u6761\u4ef6",
    "constraints": "\u9700\u8981\u907f\u514d\u7684\u5185\u5bb9\u3001\u8fb9\u754c",
    "output_format": "\u671f\u671b\u7684\u8f93\u51fa\u5f62\u5f0f",
    "goal": "\u671f\u671b\u7684\u6700\u7ec8\u72b6\u6001\u6216\u7ed3\u679c",
    "role": "AI \u5e94\u626e\u6f14\u7684\u89d2\u8272",
    "audience": "\u8f93\u51fa\u7684\u76ee\u6807\u53d7\u4f17",
    "assumptions": "AI \u5e94\u5f53\u89c6\u4e3a\u5df2\u77e5\u7684\u524d\u63d0",
    "scope": "\u8986\u76d6\u8303\u56f4\u7684\u8fb9\u754c",
    "priority": "\u53d1\u751f\u6743\u8861\u65f6\u6700\u91cd\u8981\u7684\u4e8b\u9879",
    "output_language": "AI \u5e94\u4f7f\u7528\u7684\u56de\u590d\u8bed\u8a00",
    "detail_level": "\u6458\u8981 / \u6807\u51c6 / \u6df1\u5165",
    "tone": "\u6b63\u5f0f / \u968f\u610f / \u6280\u672f\u6027",
    "thinking_style": "\u76f4\u63a5\u56de\u7b54 / \u5206\u6b65\u9aa4 / \u5229\u5f0a\u5206\u6790",
    "examples": "\u53c2\u8003\u793a\u4f8b",
    "anti_examples": "\u4e0d\u671f\u671b\u7684\u53cd\u4f8b",
    "references": "\u7279\u5b9a\u7684\u6765\u6e90\u6216\u8d44\u6599",
    "custom_fields": "\u7528\u6237\u81ea\u5b9a\u4e49\u7684\u952e\u503c\u5bf9",
    "question_type": "\u95ee\u9898\u7c7b\u578b\uff1a\u4e8b\u5b9e / \u6982\u5ff5 / \u65b9\u6cd5 / \u89c2\u70b9",
    "knowledge_level": "\u7528\u6237\u5728\u8be5\u4e3b\u9898\u4e0a\u7684\u73b0\u6709\u77e5\u8bc6",
    "content_type": "\u8981\u521b\u5efa\u7684\u5185\u5bb9\uff1a\u90ae\u4ef6 / \u6587\u7ae0 / \u6587\u6863 / \u4ee3\u7801 / \u811a\u672c",
    "key_points": "\u5fc5\u987b\u5305\u542b\u7684\u8981\u70b9\u6216\u6838\u5fc3\u529f\u80fd",
    "tech_stack": "\u8bed\u8a00\u3001\u6846\u67b6\u3001\u5e93\uff08\u4ee3\u7801\u573a\u666f\uff09",
    "target_length": "\u671f\u671b\u7684\u957f\u5ea6\u6216\u89c4\u6a21",
    "structure": "\u671f\u671b\u7684\u7ed3\u6784\u6216\u5927\u7eb2",
    "include_tests": "\u662f\u5426\u5305\u542b\u6d4b\u8bd5\uff08\u4ee3\u7801\u573a\u666f\uff09",
    "source_content": "\u8981\u8f6c\u5316\u7684\u539f\u59cb\u5185\u5bb9",
    "transform_type": "\u8f6c\u5316\u65b9\u5f0f\uff1a\u6458\u8981 / \u7ffb\u8bd1 / \u6539\u5199 / \u7b80\u5316 / \u683c\u5f0f\u8f6c\u6362",
    "preserve": "\u5fc5\u987b\u4fdd\u7559\u7684\u4fe1\u606f\u6216\u7279\u5f81",
    "subject": "\u8981\u5206\u6790\u7684\u5bf9\u8c61\u6216\u5185\u5bb9",
    "analyze_type": "\u5206\u6790\u7c7b\u578b\uff1a\u8bc4\u4f30 / \u5bf9\u6bd4 / \u6570\u636e\u89e3\u8bfb",
    "criteria": "\u8bc4\u4f30\u7ef4\u5ea6",
    "compared_subjects": "\u5bf9\u6bd4\u9879\u76ee\uff08\u652f\u6301\u591a\u4e2a\uff09",
    "benchmark": "\u53c2\u8003\u6807\u51c6\u6216\u57fa\u51c6\u7ebf",
    "problem": "\u8981\u89e3\u51b3\u7684\u95ee\u9898\u6216\u63a2\u7d22\u65b9\u5411",
    "current_state": "\u5f53\u524d\u60c5\u51b5\u63cf\u8ff0",
    "idea_count": "\u8981\u751f\u6210\u591a\u5c11\u4e2a\u60f3\u6cd5/\u65b9\u6848",
    "evaluation_criteria": "\u5982\u4f55\u5224\u65ad\u60f3\u6cd5\u7684\u8d28\u91cf",
    "tradeoff_preference": "\u6743\u8861\u504f\u597d\uff08\u5982\u901f\u5ea6 vs \u8d28\u91cf\uff09",
    "plan": "\u5df2\u77e5\u7684\u6b65\u9aa4\u6216\u5de5\u4f5c\u6d41",
    "tools_to_use": "\u4efb\u52a1\u4e2d\u5fc5\u987b\u4f7f\u7528\u7684\u5de5\u5177",
    "checkpoints": "\u9700\u8981\u6682\u505c\u786e\u8ba4\u7684\u4f4d\u7f6e",
    "error_handling": "\u53d1\u751f\u9519\u8bef\u65f6\u7684\u5904\u7406\u7b56\u7565",
    "success_criteria": "\u5982\u4f55\u5224\u65ad\u4efb\u52a1\u5b8c\u6210"
  },
  "hints": {
    "textarea": "\u81ea\u7531\u8f93\u5165\u6587\u672c",
    "text": "\u81ea\u7531\u8f93\u5165\u6587\u672c",
    "select": "\u70b9\u51fb\u9009\u62e9\u4e00\u9879",
    "combo": "\u9009\u62e9\u6216\u8f93\u5165\u81ea\u5b9a\u4e49\u503c",
    "list": "\u6dfb\u52a0\u5217\u8868\u9879",
    "toggle": "\u5f00\u5173\u5207\u6362",
    "number": "\u70b9\u51fb+/\u2212\u6216\u8f93\u5165\u6570\u5b57",
    "key-value": "\u6dfb\u52a0\u952e\u503c\u5bf9"
  },
  "editor": {
    "addField": "+ \u6dfb\u52a0\u5b57\u6bb5",
    "recommended": "\u2605 \u63a8\u8350",
    "others": "\u5176\u4ed6",
    "customFields": "\u81ea\u5b9a\u4e49\u5b57\u6bb5",
    "addItem": "+ \u6dfb\u52a0\u9879\u76ee...",
    "orTypeCustom": "\u6216\u8f93\u5165\u81ea\u5b9a\u4e49\u503c...",
    "selectTaskPrompt": "\u8bf7\u5148\u5728\u4e0a\u65b9\u9009\u62e9\u4e00\u4e2a\u4efb\u52a1\u7c7b\u578b",
    "keyPlaceholder": "+ \u952e",
    "valuePlaceholder": "\u503c",
    "comingSoon": "\u5373\u5c06\u63a8\u51fa"
  },
  "preview": {
    "output": "\u8f93\u51fa",
    "copyToClipboard": "\u590d\u5236\u5230\u526a\u8d34\u677f",
    "copied": "\u2713 \u5df2\u590d\u5236\uff01",
    "copyFailed": "\u2717 \u590d\u5236\u5931\u8d25",
    "formatMarkdown": "MD",
    "formatJson": "JSON",
    "formatYaml": "YAML",
    "formatXml": "XML"
  },
  "common": {
    "en": "EN",
    "zh": "\u4e2d"
  }
}
```

- [ ] **Step 4: Verify JSON files are valid**
```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en.json','utf8')); console.log('en.json: valid')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/zh.json','utf8')); console.log('zh.json: valid')"
```
Expected: both files print "valid".

- [ ] **Step 5: Commit**
```bash
git add src/i18n/config.ts src/i18n/locales/en.json src/i18n/locales/zh.json
git commit -m "feat: add i18n configuration with complete EN/ZH translations"
```

---

### Task 10: Wire i18n Provider into App
**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import i18n config and wrap app with provider**
At the top of `src/App.tsx`, add the import (this must be imported before any component that uses `useTranslation`):
```typescript
import './i18n/config';
```

- [ ] **Step 2: Add outputFormat and outputLanguage state**
Inside the App component, add state management for the two preview controls:
```typescript
import { useState } from 'react';
import type { OutputFormat, Language } from './types';

// Inside the App component:
const [outputFormat, setOutputFormat] = useState<OutputFormat>('markdown');
const [outputLanguage, setOutputLanguage] = useState<Language>('zh');
```

- [ ] **Step 3: Pass state to PreviewArea**
Update the PreviewArea props to include the new state and setters:
```tsx
<PreviewArea
  outputFormat={outputFormat}
  outputLanguage={outputLanguage}
  onFormatChange={setOutputFormat}
  onLanguageChange={setOutputLanguage}
  // ... existing props
/>
```

- [ ] **Step 4: Update compiler call to pass outputLanguage**
Where the compiler is called, add the `outputLanguage` parameter:
```typescript
const compiled = compile(fieldData, outputFormat, { outputLanguage });
```

- [ ] **Step 5: Verify app starts**
```bash
npm run dev
```
Expected: app loads without errors in the browser console. Existing functionality still works.

- [ ] **Step 6: Commit**
```bash
git add src/App.tsx
git commit -m "feat: wire i18n provider, add outputFormat and outputLanguage state to App"
```

---

### Task 11: Update Compiler to Accept Output Language
**Files:**
- Modify: `src/compiler/compiler.ts`

- [ ] **Step 1: Import translation files for field label lookup**
Add to `src/compiler/compiler.ts`:
```typescript
import en from '../i18n/locales/en.json';
import zh from '../i18n/locales/zh.json';
import type { Language } from '../types';

const fieldLabels: Record<Language, Record<string, string>> = {
  en: en.fields,
  zh: zh.fields,
};
```

- [ ] **Step 2: Modify the compile function signature**
Update the compile function (or the relevant compilation logic) to accept `outputLanguage` and use it when building `OrderedField[]`:
```typescript
// When building the OrderedField array, use the output language for labels:
function getFieldLabel(fieldKey: string, outputLanguage: Language): string {
  return fieldLabels[outputLanguage]?.[fieldKey] ?? fieldKey;
}
```

- [ ] **Step 3: Use translated labels when constructing OrderedField entries**
In the section where the compiler maps field data to `OrderedField[]`, replace hardcoded labels:
```typescript
// Before (example):
// { key: 'intent', label: 'Intent', value: fieldData.intent }

// After:
// { key: 'intent', label: getFieldLabel('intent', outputLanguage), value: fieldData.intent }
```

- [ ] **Step 4: Verify build**
```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 5: Run existing compiler tests (they should still pass)**
```bash
npx vitest run tests/compiler/
```
Expected: existing tests pass. (If tests use hardcoded English labels, they continue to work because `outputLanguage` defaults to `'en'`.)

- [ ] **Step 6: Commit**
```bash
git add src/compiler/compiler.ts
git commit -m "feat: compiler accepts outputLanguage param for translated field labels"
```

---

### Task 12: Build PreviewHeader Component
**Files:**
- Create: `src/components/preview/PreviewHeader.tsx`

- [ ] **Step 1: Create the component**
Create `src/components/preview/PreviewHeader.tsx`:
```tsx
import { useTranslation } from 'react-i18next';
import type { OutputFormat, Language } from '../../types';

interface PreviewHeaderProps {
  outputFormat: OutputFormat;
  outputLanguage: Language;
  onFormatChange: (format: OutputFormat) => void;
  onLanguageChange: (language: Language) => void;
}

const FORMAT_OPTIONS: { value: OutputFormat; labelKey: string }[] = [
  { value: 'markdown', labelKey: 'preview.formatMarkdown' },
  { value: 'json', labelKey: 'preview.formatJson' },
  { value: 'yaml', labelKey: 'preview.formatYaml' },
  { value: 'xml', labelKey: 'preview.formatXml' },
];

export function PreviewHeader({
  outputFormat,
  outputLanguage,
  onFormatChange,
  onLanguageChange,
}: PreviewHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 py-2">
      {/* Left side: OUTPUT label + output language toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#999999] uppercase tracking-wide">
          {t('preview.output')}
        </span>
        <div className="flex rounded-[4px] overflow-hidden border border-[#e8e2d8]">
          <button
            type="button"
            className={`px-2 py-0.5 text-xs font-medium transition-colors ${
              outputLanguage === 'en'
                ? 'bg-[#1a1a1a] text-[#f5c518]'
                : 'bg-transparent text-[#999999] hover:text-[#555555]'
            }`}
            onClick={() => onLanguageChange('en')}
          >
            {t('common.en')}
          </button>
          <button
            type="button"
            className={`px-2 py-0.5 text-xs font-medium transition-colors ${
              outputLanguage === 'zh'
                ? 'bg-[#1a1a1a] text-[#f5c518]'
                : 'bg-transparent text-[#999999] hover:text-[#555555]'
            }`}
            onClick={() => onLanguageChange('zh')}
          >
            {t('common.zh')}
          </button>
        </div>
      </div>

      {/* Right side: format selector pills */}
      <div className="flex gap-1">
        {FORMAT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-[6px] transition-colors ${
              outputFormat === option.value
                ? 'bg-[#1a1a1a] text-[#f5c518]'
                : 'bg-[#f5f3ef] text-[#999999] hover:text-[#555555]'
            }`}
            onClick={() => onFormatChange(option.value)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**
```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Commit**
```bash
git add src/components/preview/PreviewHeader.tsx
git commit -m "feat: add PreviewHeader with format pills and output language toggle"
```

---

### Task 13: Integrate PreviewHeader into PreviewArea
**Files:**
- Modify: `src/components/preview/PreviewArea.tsx`

- [ ] **Step 1: Import and render PreviewHeader**
In `src/components/preview/PreviewArea.tsx`, add the PreviewHeader above the preview content:
```tsx
import { PreviewHeader } from './PreviewHeader';
import type { OutputFormat, Language } from '../../types';
```

Update the component's props interface to include the new props:
```typescript
interface PreviewAreaProps {
  // ... existing props (content, etc.)
  outputFormat: OutputFormat;
  outputLanguage: Language;
  onFormatChange: (format: OutputFormat) => void;
  onLanguageChange: (language: Language) => void;
}
```

Place `<PreviewHeader ... />` at the top of the preview area, before the preview content:
```tsx
<PreviewHeader
  outputFormat={outputFormat}
  outputLanguage={outputLanguage}
  onFormatChange={onFormatChange}
  onLanguageChange={onLanguageChange}
/>
```

- [ ] **Step 2: Verify with dev server**
```bash
npm run dev
```
Expected: preview area now shows the header row with "OUTPUT [EN|ZH]" on the left and [MD] [JSON] [YAML] [XML] pills on the right. Clicking format pills and language toggles updates their active states.

- [ ] **Step 3: Commit**
```bash
git add src/components/preview/PreviewArea.tsx
git commit -m "feat: integrate PreviewHeader into PreviewArea"
```

---

### Task 14: Add UI Language Toggle to TopBar
**Files:**
- Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: Import i18n and add the language toggle**
In `src/components/layout/TopBar.tsx`:
```tsx
import { useTranslation } from 'react-i18next';
import { setUILanguage } from '../../i18n/config';
import type { Language } from '../../types';
```

Replace the existing noop language placeholder with a functional segmented control:
```tsx
function UILanguageToggle() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language as Language;

  return (
    <div className="flex rounded-[4px] overflow-hidden border border-[#e8e2d8]">
      <button
        type="button"
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          currentLang === 'en'
            ? 'bg-[#1a1a1a] text-[#f5c518]'
            : 'bg-transparent text-[#999999] hover:text-[#555555]'
        }`}
        onClick={() => setUILanguage('en')}
      >
        {t('common.en')}
      </button>
      <button
        type="button"
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          currentLang === 'zh'
            ? 'bg-[#1a1a1a] text-[#f5c518]'
            : 'bg-transparent text-[#999999] hover:text-[#555555]'
        }`}
        onClick={() => setUILanguage('zh')}
      >
        {t('common.zh')}
      </button>
    </div>
  );
}
```

Render `<UILanguageToggle />` at the right end of the TopBar, replacing the placeholder:
```tsx
{/* In the TopBar right section, replace the noop placeholder: */}
<UILanguageToggle />
```

- [ ] **Step 2: Use i18n for TopBar text**
Replace hardcoded "History" and "Settings" labels:
```tsx
const { t } = useTranslation();
// ...
<span>{t('topBar.history')}</span>
<span>{t('topBar.settings')}</span>
```

- [ ] **Step 3: Verify with dev server**
```bash
npm run dev
```
Expected: TopBar shows [EN|ZH] segmented control at the right. Clicking "ZH" switches the TopBar labels to Chinese. Clicking "EN" switches back. The active segment has dark background with golden text.

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/TopBar.tsx
git commit -m "feat: add functional UI language toggle to TopBar"
```

---

### Task 15: Apply i18n to TaskCard
**Files:**
- Modify: `src/components/task-selector/TaskCard.tsx`

- [ ] **Step 1: Use translated verb and mental model**
In `src/components/task-selector/TaskCard.tsx`:
```tsx
import { useTranslation } from 'react-i18next';

// Inside the component:
const { t } = useTranslation();

// Replace hardcoded verb and mental model with translations.
// The task type key (e.g., 'ask', 'create') should be passed as a prop or
// derived from the task type data.
// Example:
<span className="text-base font-bold">{t(`taskTypes.${taskType}.verb`)}</span>
<span className="text-xs text-[#999999]">{t(`taskTypes.${taskType}.mentalModel`)}</span>
```

- [ ] **Step 2: Verify with dev server**
```bash
npm run dev
```
Expected: task type cards display translated verb + mental model. Toggling UI language in TopBar updates all 6 cards immediately.

- [ ] **Step 3: Commit**
```bash
git add src/components/task-selector/TaskCard.tsx
git commit -m "feat: TaskCard uses i18n for verb and mental model"
```

---

### Task 16: Apply i18n to Editor Components
**Files:**
- Modify: `src/components/editor/FieldLabel.tsx`
- Modify: `src/components/editor/AddFieldPanel.tsx`
- Modify: `src/components/editor/IntentField.tsx`

- [ ] **Step 1: Update FieldLabel to use i18n**
In `src/components/editor/FieldLabel.tsx`:
```tsx
import { useTranslation } from 'react-i18next';

// Inside the component:
const { t } = useTranslation();

// Replace hardcoded field name with:
const fieldName = t(`fields.${fieldKey}`);

// Replace hardcoded hint with:
const operationHint = t(`hints.${inputType}`);
```

- [ ] **Step 2: Update AddFieldPanel to use i18n**
In `src/components/editor/AddFieldPanel.tsx`:
```tsx
import { useTranslation } from 'react-i18next';

// Inside the component:
const { t } = useTranslation();

// Replace hardcoded section headers:
// "★ Recommended" → t('editor.recommended')
// "Others" → t('editor.others')
// "Custom Fields" → t('editor.customFields')
// "+ Add Field" button → t('editor.addField')

// Replace hardcoded field descriptions with:
const fieldDescription = t(`fieldDescriptions.${fieldKey}`);
```

- [ ] **Step 3: Update IntentField to use i18n**
In `src/components/editor/IntentField.tsx`:
```tsx
import { useTranslation } from 'react-i18next';

// Inside the component:
const { t } = useTranslation();

// Use translated placeholder or label text where applicable
```

- [ ] **Step 4: Verify with dev server**
```bash
npm run dev
```
Expected: selecting a task type and toggling UI language switches all field names, operation hints, section headers, and descriptions between English and Chinese.

- [ ] **Step 5: Commit**
```bash
git add src/components/editor/FieldLabel.tsx src/components/editor/AddFieldPanel.tsx src/components/editor/IntentField.tsx
git commit -m "feat: apply i18n to FieldLabel, AddFieldPanel, IntentField"
```

---

### Task 17: Apply i18n to CopyButton and Remaining UI Text
**Files:**
- Modify: `src/components/preview/CopyButton.tsx`

- [ ] **Step 1: Update CopyButton to use i18n**
In `src/components/preview/CopyButton.tsx`:
```tsx
import { useTranslation } from 'react-i18next';

// Inside the component:
const { t } = useTranslation();

// Replace hardcoded button text:
// "Copy to Clipboard" → t('preview.copyToClipboard')
// "Copied!" → t('preview.copied')
// "Copy failed" → t('preview.copyFailed')
```

- [ ] **Step 2: Check for any remaining hardcoded UI strings**
Search the codebase for any remaining hardcoded English strings that should be translated:
```bash
grep -rn "Select a task type" src/
grep -rn "Add item" src/
grep -rn "or type custom" src/
grep -rn "Coming soon" src/
```
Replace any found strings with their i18n equivalents:
- `"Select a task type above to begin"` -> `t('editor.selectTaskPrompt')`
- `"+ Add item..."` -> `t('editor.addItem')`
- `"or type custom value..."` -> `t('editor.orTypeCustom')`
- `"Coming soon"` -> `t('editor.comingSoon')`
- `"+ key"` -> `t('editor.keyPlaceholder')`
- `"value"` -> `t('editor.valuePlaceholder')`

- [ ] **Step 3: Verify with dev server**
```bash
npm run dev
```
Expected: toggling UI language in TopBar switches ALL visible text -- button labels, empty state messages, input placeholders, everything.

- [ ] **Step 4: Commit**
```bash
git add src/components/preview/CopyButton.tsx
# Also stage any other files modified in step 2
git commit -m "feat: apply i18n to CopyButton and remaining UI text"
```

---

### Task 18: End-to-End Verification and Final Commit
**Files:**
- No new files. Verification pass over all changes.

- [ ] **Step 1: Run all tests**
```bash
npx vitest run
```
Expected: all tests pass -- formatters (json, yaml, xml) and any existing tests.

- [ ] **Step 2: Verify type checking**
```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Verify lint (if configured)**
```bash
npm run lint 2>/dev/null || echo "No lint script configured"
```
Expected: no errors, or lint script not configured (acceptable for now).

- [ ] **Step 4: Manual verification checklist**
Open `npm run dev` and verify each acceptance criterion:
- [ ] JSON tab produces valid parseable JSON (paste into a JSON validator)
- [ ] YAML tab produces valid YAML (paste into a YAML validator)
- [ ] XML tab produces valid XML with `<prompt>` wrapper
- [ ] All four format pills work; switching updates the preview immediately
- [ ] Output language toggle [EN|ZH] in PreviewHeader changes field labels in the preview
- [ ] UI language toggle [EN|ZH] in TopBar changes all visible UI text
- [ ] Task type cards display localized verb + mental model
- [ ] Field names, hints, and descriptions follow UI language
- [ ] AddFieldPanel sections (Recommended, Others, Custom Fields) follow UI language
- [ ] CopyButton text follows UI language
- [ ] Empty state message follows UI language
- [ ] UI in English + output in Chinese works correctly
- [ ] UI in Chinese + output in English works correctly
- [ ] Language preference persists after page reload (localStorage)

- [ ] **Step 5: Final commit (if any fixups were needed)**
```bash
# Only if there were fixups during verification:
git add -A
git commit -m "fix: address Phase 3 verification issues"
```

---

## Summary of Deliverables

| # | Task | Type | Key Files |
|---|------|------|-----------|
| 1 | Install dependencies | chore | `package.json` |
| 2 | JSON formatter tests | test | `tests/formatters/json.test.ts` |
| 3 | JSON formatter impl | feat | `src/formatters/json.ts` |
| 4 | YAML formatter tests | test | `tests/formatters/yaml.test.ts` |
| 5 | YAML formatter impl | feat | `src/formatters/yaml.ts` |
| 6 | XML formatter tests | test | `tests/formatters/xml.test.ts` |
| 7 | XML formatter impl | feat | `src/formatters/xml.ts` |
| 8 | Register all formatters | feat | `src/formatters/index.ts` |
| 9 | i18n config + translations | feat | `src/i18n/config.ts`, `en.json`, `zh.json` |
| 10 | Wire i18n provider + state | feat | `src/App.tsx` |
| 11 | Compiler output language | feat | `src/compiler/compiler.ts` |
| 12 | PreviewHeader component | feat | `src/components/preview/PreviewHeader.tsx` |
| 13 | Integrate PreviewHeader | feat | `src/components/preview/PreviewArea.tsx` |
| 14 | UI language toggle (TopBar) | feat | `src/components/layout/TopBar.tsx` |
| 15 | i18n in TaskCard | feat | `src/components/task-selector/TaskCard.tsx` |
| 16 | i18n in editor components | feat | `FieldLabel.tsx`, `AddFieldPanel.tsx`, `IntentField.tsx` |
| 17 | i18n in CopyButton + sweep | feat | `src/components/preview/CopyButton.tsx` |
| 18 | End-to-end verification | verify | all files |
