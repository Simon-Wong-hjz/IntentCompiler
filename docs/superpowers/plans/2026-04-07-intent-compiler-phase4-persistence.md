# Phase 4: Persistence — Settings + History — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent storage via Dexie.js so user preferences survive page reloads and compilation history is available for revisiting, with Settings and History modals fully wired to the TopBar.

**Architecture:** Dexie.js wraps IndexedDB with a typed schema (preferences key-value store, auto-incrementing history store, reserved templates store). A thin React hooks layer (`useStorage`) exposes async reads/writes to components. Settings and History modals are standalone components triggered from TopBar; the CopyButton is modified to also create history records on each copy action.

**Tech Stack:** Dexie.js 4.x, fake-indexeddb (test), React 18, TypeScript, Tailwind CSS, shadcn/ui Dialog, Vitest, React Testing Library

---

## File Structure

```
Files to CREATE:
  src/storage/db.ts                      — Dexie database class + schema
  src/storage/preferences.ts             — Preferences CRUD helpers
  src/storage/history.ts                 — History CRUD helpers
  src/hooks/useStorage.ts                — React hooks for Dexie read/write
  src/components/modals/SettingsModal.tsx — Settings modal component
  src/components/modals/HistoryModal.tsx  — History modal component

Tests to CREATE:
  tests/storage/db.test.ts               — Database initialization tests
  tests/storage/preferences.test.ts      — Preferences CRUD tests
  tests/storage/history.test.ts          — History CRUD tests

Files to MODIFY:
  package.json                           — add dexie, fake-indexeddb
  src/App.tsx                            — load defaults on mount, pass state
  src/components/layout/TopBar.tsx       — wire History/Settings modal triggers
  src/components/preview/CopyButton.tsx  — save history record on copy
```

---

### Task 1: Install Dependencies

**Files:** Modify: `package.json`

- [ ] **Step 1:** Install Dexie.js as a production dependency:
```bash
cd /Users/simhuang/VSCodeProjects/IntentCompiler/.worktrees/clean-start
npm install dexie@^4
```

- [ ] **Step 2:** Install fake-indexeddb as a dev dependency for testing:
```bash
npm install -D fake-indexeddb
```

- [ ] **Step 3:** Verify installation — confirm both packages appear in `package.json`:
```bash
grep -E '"dexie"|"fake-indexeddb"' package.json
```
Expected: one line under `dependencies`, one under `devDependencies`.

- [ ] **Step 4: Commit**
```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore: add dexie and fake-indexeddb dependencies

Dexie.js for IndexedDB persistence layer (preferences, history).
fake-indexeddb for in-memory IndexedDB in Vitest tests.
EOF
)"
```

---

### Task 2: Dexie Database Schema

**Files:** Create: `src/storage/db.ts`

- [ ] **Step 1:** Create the storage directory and database file at `src/storage/db.ts` with the following content:

```typescript
import Dexie, { type Table } from 'dexie';

export interface Preference {
  key: string;
  value: string;
}

export interface HistoryRecord {
  id?: number;
  taskType: string;
  fields: Record<string, unknown>;
  outputLanguage: string;
  outputFormat: string;
  timestamp: number;
}

export interface TemplateRecord {
  id?: number;
  name: string;
  taskType: string;
  fields: Record<string, unknown>;
  createdAt: number;
}

export class IntentCompilerDB extends Dexie {
  preferences!: Table<Preference, string>;
  history!: Table<HistoryRecord, number>;
  templates!: Table<TemplateRecord, number>;

  constructor() {
    super('intent-compiler');
    this.version(1).stores({
      preferences: 'key',
      history: '++id, taskType, timestamp',
      templates: '++id, taskType, createdAt',
    });
  }
}

export const db = new IntentCompilerDB();
```

- [ ] **Step 2:** Verify the file compiles without errors:
```bash
npx tsc --noEmit src/storage/db.ts
```

---

### Task 3: Database Initialization Tests

**Files:** Create: `tests/storage/db.test.ts`

- [ ] **Step 1:** Create test setup and database initialization tests at `tests/storage/db.test.ts`:

```typescript
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { IntentCompilerDB } from '../../src/storage/db';

describe('IntentCompilerDB', () => {
  let testDb: IntentCompilerDB;

  beforeEach(async () => {
    // Delete any existing test database to ensure clean state
    await Dexie.delete('intent-compiler');
    testDb = new IntentCompilerDB();
  });

  it('should create a database named intent-compiler', () => {
    expect(testDb.name).toBe('intent-compiler');
  });

  it('should have preferences, history, and templates tables', () => {
    expect(testDb.preferences).toBeDefined();
    expect(testDb.history).toBeDefined();
    expect(testDb.templates).toBeDefined();
  });

  it('should open successfully', async () => {
    await testDb.open();
    expect(testDb.isOpen()).toBe(true);
    testDb.close();
  });

  it('should be at schema version 1', () => {
    expect(testDb.verno).toBe(1);
  });
});
```

- [ ] **Step 2:** Run the tests:
```bash
npx vitest run tests/storage/db.test.ts
```
Expected: all 4 tests pass.

- [ ] **Step 3: Commit**
```bash
git add src/storage/db.ts tests/storage/db.test.ts
git commit -m "$(cat <<'EOF'
feat: add Dexie.js database schema with preferences, history, templates stores

Schema v1 with three stores:
- preferences: key-value for user settings
- history: auto-increment with taskType + timestamp indexes
- templates: reserved for future custom template feature
EOF
)"
```

---

### Task 4: Preferences CRUD Helpers

**Files:** Create: `src/storage/preferences.ts`

- [ ] **Step 1:** Create preferences CRUD helper at `src/storage/preferences.ts`:

```typescript
import { db, type Preference } from './db';

/** Well-known preference keys for type safety */
export type PreferenceKey =
  | 'defaultOutputLanguage'
  | 'defaultOutputFormat'
  | 'aiProvider'
  | 'apiKey_openai'
  | 'apiKey_anthropic'
  | 'uiLanguage';

/**
 * Get a single preference value by key.
 * Returns undefined if the key does not exist.
 */
export async function getPreference(key: PreferenceKey): Promise<string | undefined> {
  const record = await db.preferences.get(key);
  return record?.value;
}

/**
 * Set a single preference value.
 * Uses put() to upsert — creates if missing, overwrites if exists.
 */
export async function setPreference(key: PreferenceKey, value: string): Promise<void> {
  await db.preferences.put({ key, value });
}

/**
 * Delete a single preference.
 */
export async function deletePreference(key: PreferenceKey): Promise<void> {
  await db.preferences.delete(key);
}

/**
 * Get all preferences as a Record for bulk loading on app init.
 */
export async function getAllPreferences(): Promise<Record<string, string>> {
  const all: Preference[] = await db.preferences.toArray();
  const result: Record<string, string> = {};
  for (const pref of all) {
    result[pref.key] = pref.value;
  }
  return result;
}
```

- [ ] **Step 2:** Verify compilation:
```bash
npx tsc --noEmit src/storage/preferences.ts
```

---

### Task 5: Preferences Tests

**Files:** Create: `tests/storage/preferences.test.ts`

- [ ] **Step 1:** Create preferences tests at `tests/storage/preferences.test.ts`:

```typescript
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { IntentCompilerDB } from '../../src/storage/db';
import {
  getPreference,
  setPreference,
  deletePreference,
  getAllPreferences,
} from '../../src/storage/preferences';

// Override the db module's singleton for isolated tests
import * as dbModule from '../../src/storage/db';

describe('Preferences CRUD', () => {
  beforeEach(async () => {
    await Dexie.delete('intent-compiler');
    // Re-create the database for clean state
    (dbModule as { db: IntentCompilerDB }).db = new IntentCompilerDB();
  });

  it('should return undefined for a non-existent key', async () => {
    const result = await getPreference('defaultOutputLanguage');
    expect(result).toBeUndefined();
  });

  it('should set and get a preference', async () => {
    await setPreference('defaultOutputLanguage', 'en');
    const result = await getPreference('defaultOutputLanguage');
    expect(result).toBe('en');
  });

  it('should overwrite an existing preference', async () => {
    await setPreference('defaultOutputFormat', 'json');
    await setPreference('defaultOutputFormat', 'yaml');
    const result = await getPreference('defaultOutputFormat');
    expect(result).toBe('yaml');
  });

  it('should delete a preference', async () => {
    await setPreference('aiProvider', 'openai');
    await deletePreference('aiProvider');
    const result = await getPreference('aiProvider');
    expect(result).toBeUndefined();
  });

  it('should get all preferences as a record', async () => {
    await setPreference('defaultOutputLanguage', 'zh');
    await setPreference('defaultOutputFormat', 'markdown');
    await setPreference('aiProvider', 'anthropic');

    const all = await getAllPreferences();
    expect(all).toEqual({
      defaultOutputLanguage: 'zh',
      defaultOutputFormat: 'markdown',
      aiProvider: 'anthropic',
    });
  });

  it('should return an empty record when no preferences exist', async () => {
    const all = await getAllPreferences();
    expect(all).toEqual({});
  });

  it('should store API keys independently per provider', async () => {
    await setPreference('apiKey_openai', 'sk-openai-123');
    await setPreference('apiKey_anthropic', 'sk-ant-456');

    expect(await getPreference('apiKey_openai')).toBe('sk-openai-123');
    expect(await getPreference('apiKey_anthropic')).toBe('sk-ant-456');
  });
});
```

- [ ] **Step 2:** Run the tests:
```bash
npx vitest run tests/storage/preferences.test.ts
```
Expected: all 7 tests pass.

> **Note on test isolation:** If the `db` singleton import makes overriding difficult, an alternative approach is to make the `db` instance injectable in the CRUD helpers (e.g., accept an optional `db` parameter). Adjust the helper signatures as needed — the test expectations remain the same.

- [ ] **Step 3: Commit**
```bash
git add src/storage/preferences.ts tests/storage/preferences.test.ts
git commit -m "$(cat <<'EOF'
feat: add preferences CRUD helpers with typed keys

Supports get/set/delete/getAll for preference keys including
output defaults, AI provider, API keys, and UI language.
EOF
)"
```

---

### Task 6: History CRUD Helpers

**Files:** Create: `src/storage/history.ts`

- [ ] **Step 1:** Create history CRUD helper at `src/storage/history.ts`:

```typescript
import { db, type HistoryRecord } from './db';

/**
 * Add a new history record. Returns the auto-generated id.
 */
export async function addHistoryRecord(
  record: Omit<HistoryRecord, 'id'>
): Promise<number> {
  return await db.history.add(record);
}

/**
 * Get all history records sorted by timestamp descending (newest first).
 */
export async function getHistoryRecords(): Promise<HistoryRecord[]> {
  return await db.history.orderBy('timestamp').reverse().toArray();
}

/**
 * Get a single history record by id.
 */
export async function getHistoryRecord(id: number): Promise<HistoryRecord | undefined> {
  return await db.history.get(id);
}

/**
 * Delete a single history record by id.
 */
export async function deleteHistoryRecord(id: number): Promise<void> {
  await db.history.delete(id);
}

/**
 * Delete all history records.
 */
export async function clearAllHistory(): Promise<void> {
  await db.history.clear();
}

/**
 * Get the total count of history records.
 */
export async function getHistoryCount(): Promise<number> {
  return await db.history.count();
}
```

- [ ] **Step 2:** Verify compilation:
```bash
npx tsc --noEmit src/storage/history.ts
```

---

### Task 7: History Tests

**Files:** Create: `tests/storage/history.test.ts`

- [ ] **Step 1:** Create history tests at `tests/storage/history.test.ts`:

```typescript
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { IntentCompilerDB } from '../../src/storage/db';
import {
  addHistoryRecord,
  getHistoryRecords,
  getHistoryRecord,
  deleteHistoryRecord,
  clearAllHistory,
  getHistoryCount,
} from '../../src/storage/history';

import * as dbModule from '../../src/storage/db';

const makeRecord = (overrides: Partial<Omit<import('../../src/storage/db').HistoryRecord, 'id'>> = {}) => ({
  taskType: 'ask',
  fields: { intent: 'How do React hooks work?' },
  outputLanguage: 'en',
  outputFormat: 'markdown',
  timestamp: Date.now(),
  ...overrides,
});

describe('History CRUD', () => {
  beforeEach(async () => {
    await Dexie.delete('intent-compiler');
    (dbModule as { db: IntentCompilerDB }).db = new IntentCompilerDB();
  });

  it('should add a history record and return its id', async () => {
    const id = await addHistoryRecord(makeRecord());
    expect(id).toBeGreaterThan(0);
  });

  it('should get a record by id', async () => {
    const id = await addHistoryRecord(makeRecord({ taskType: 'create' }));
    const record = await getHistoryRecord(id);
    expect(record).toBeDefined();
    expect(record!.taskType).toBe('create');
    expect(record!.id).toBe(id);
  });

  it('should return undefined for non-existent id', async () => {
    const record = await getHistoryRecord(9999);
    expect(record).toBeUndefined();
  });

  it('should return records sorted by timestamp descending', async () => {
    const now = Date.now();
    await addHistoryRecord(makeRecord({ timestamp: now - 2000, taskType: 'ask' }));
    await addHistoryRecord(makeRecord({ timestamp: now, taskType: 'create' }));
    await addHistoryRecord(makeRecord({ timestamp: now - 1000, taskType: 'analyze' }));

    const records = await getHistoryRecords();
    expect(records).toHaveLength(3);
    expect(records[0].taskType).toBe('create');    // newest
    expect(records[1].taskType).toBe('analyze');   // middle
    expect(records[2].taskType).toBe('ask');       // oldest
  });

  it('should delete a single record', async () => {
    const id1 = await addHistoryRecord(makeRecord({ taskType: 'ask' }));
    const id2 = await addHistoryRecord(makeRecord({ taskType: 'create' }));

    await deleteHistoryRecord(id1);

    const remaining = await getHistoryRecords();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(id2);
  });

  it('should clear all records', async () => {
    await addHistoryRecord(makeRecord());
    await addHistoryRecord(makeRecord());
    await addHistoryRecord(makeRecord());

    await clearAllHistory();

    const count = await getHistoryCount();
    expect(count).toBe(0);
  });

  it('should count records', async () => {
    expect(await getHistoryCount()).toBe(0);
    await addHistoryRecord(makeRecord());
    await addHistoryRecord(makeRecord());
    expect(await getHistoryCount()).toBe(2);
  });

  it('should store complete field data in a record', async () => {
    const fields = {
      intent: 'Compare React and Vue',
      context: 'Building a new SPA',
      requirements: ['Performance', 'DX'],
    };
    const id = await addHistoryRecord(makeRecord({ fields }));
    const record = await getHistoryRecord(id);
    expect(record!.fields).toEqual(fields);
  });
});
```

- [ ] **Step 2:** Run the tests:
```bash
npx vitest run tests/storage/history.test.ts
```
Expected: all 8 tests pass.

- [ ] **Step 3: Commit**
```bash
git add src/storage/history.ts tests/storage/history.test.ts
git commit -m "$(cat <<'EOF'
feat: add history CRUD helpers with sorted retrieval

Supports add, get, delete, clearAll, count. Records returned
newest-first by timestamp for the History modal.
EOF
)"
```

---

### Task 8: React Storage Hooks

**Files:** Create: `src/hooks/useStorage.ts`

- [ ] **Step 1:** Create the React hooks file at `src/hooks/useStorage.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  getPreference,
  setPreference,
  getAllPreferences,
  type PreferenceKey,
} from '../storage/preferences';
import {
  addHistoryRecord,
  getHistoryRecords,
  deleteHistoryRecord,
  clearAllHistory,
  getHistoryCount,
} from '../storage/history';
import type { HistoryRecord } from '../storage/db';

// ─── Preferences Hook ────────────────────────────────────────

export interface PreferencesState {
  defaultOutputLanguage: string;
  defaultOutputFormat: string;
  aiProvider: string;
  apiKey_openai: string;
  apiKey_anthropic: string;
  uiLanguage: string;
}

const DEFAULT_PREFERENCES: PreferencesState = {
  defaultOutputLanguage: 'en',
  defaultOutputFormat: 'markdown',
  aiProvider: 'openai',
  apiKey_openai: '',
  apiKey_anthropic: '',
  uiLanguage: 'en',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<PreferencesState>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Load all preferences on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await getAllPreferences();
      if (cancelled) return;
      setPreferences((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(all).filter(([key]) => key in DEFAULT_PREFERENCES)
        ),
      }));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Update a single preference in both Dexie and React state
  const updatePreference = useCallback(
    async (key: PreferenceKey, value: string) => {
      await setPreference(key, value);
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return { preferences, updatePreference, loading };
}

// ─── History Hook ─────────────────────────────────────────────

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [fetched, total] = await Promise.all([
      getHistoryRecords(),
      getHistoryCount(),
    ]);
    setRecords(fetched);
    setCount(total);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRecord = useCallback(
    async (record: Omit<HistoryRecord, 'id'>) => {
      await addHistoryRecord(record);
      await refresh();
    },
    [refresh]
  );

  const removeRecord = useCallback(
    async (id: number) => {
      await deleteHistoryRecord(id);
      await refresh();
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    await clearAllHistory();
    await refresh();
  }, [refresh]);

  return { records, count, loading, addRecord, removeRecord, clearAll, refresh };
}
```

- [ ] **Step 2:** Verify compilation:
```bash
npx tsc --noEmit src/hooks/useStorage.ts
```

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useStorage.ts
git commit -m "$(cat <<'EOF'
feat: add usePreferences and useHistory React hooks

usePreferences loads all preferences on mount, provides updatePreference.
useHistory provides CRUD operations with auto-refresh after mutations.
EOF
)"
```

---

### Task 9: Mock API Key Verifier

**Files:** Create: `src/storage/apiKeyVerifier.ts`

- [ ] **Step 1:** Create the mock verifier at `src/storage/apiKeyVerifier.ts`. This is Phase 4's placeholder — real verification comes in Phase 5:

```typescript
export interface VerifyResult {
  success: boolean;
  provider?: string;
  model?: string;
  error?: string;
}

/**
 * Mock API key verifier for Phase 4.
 * Always succeeds after a 1-second delay.
 * Real verification logic replaces this in Phase 5.
 */
export async function verifyApiKey(
  provider: string,
  _apiKey: string
): Promise<VerifyResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Empty key is an immediate failure (no delay needed, but kept simple)
  if (!_apiKey || _apiKey.trim() === '') {
    return {
      success: false,
      error: 'API key cannot be empty.',
    };
  }

  // Mock success — in Phase 5 this will make a real API call
  const modelMap: Record<string, string> = {
    openai: 'GPT-4o',
    anthropic: 'Claude Sonnet',
  };

  return {
    success: true,
    provider: provider === 'openai' ? 'OpenAI' : 'Anthropic',
    model: modelMap[provider] ?? 'Unknown',
  };
}
```

- [ ] **Step 2: Commit**
```bash
git add src/storage/apiKeyVerifier.ts
git commit -m "$(cat <<'EOF'
feat: add mock API key verifier for Phase 4

Returns success after 1s delay for any non-empty key.
Real provider verification replaces this in Phase 5.
EOF
)"
```

---

### Task 10: Relative Timestamp Utility

**Files:** Create: `src/utils/relativeTime.ts`

- [ ] **Step 1:** Create the relative timestamp utility at `src/utils/relativeTime.ts`:

```typescript
/**
 * Convert a Unix timestamp (ms) to a human-readable relative time string.
 * Bilingual: returns the string in the specified language.
 */
export function relativeTime(timestamp: number, locale: 'en' | 'zh' = 'en'): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === 'zh') {
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days === 1) return '昨天';
    if (days < 30) return `${days} 天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  }

  // English
  if (seconds < 60) return 'just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString('en-US');
}
```

- [ ] **Step 2: Commit**
```bash
git add src/utils/relativeTime.ts
git commit -m "$(cat <<'EOF'
feat: add bilingual relative timestamp utility

Converts Unix timestamps to "just now", "2 min ago", "yesterday", etc.
Supports both English and Chinese output.
EOF
)"
```

---

### Task 11: Settings Modal Component

**Files:** Create: `src/components/modals/SettingsModal.tsx`

- [ ] **Step 1:** Create the modals directory and SettingsModal at `src/components/modals/SettingsModal.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { PreferencesState } from '../../hooks/useStorage';
import type { PreferenceKey } from '../../storage/preferences';
import { verifyApiKey, type VerifyResult } from '../../storage/apiKeyVerifier';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  preferences: PreferencesState;
  onUpdatePreference: (key: PreferenceKey, value: string) => Promise<void>;
}

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function SettingsModal({
  open,
  onClose,
  preferences,
  onUpdatePreference,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const currentProvider = preferences.aiProvider || 'openai';
  const currentApiKey =
    currentProvider === 'openai'
      ? preferences.apiKey_openai
      : preferences.apiKey_anthropic;

  // Reset verify status when provider changes
  useEffect(() => {
    setVerifyStatus('idle');
    setVerifyResult(null);
    setShowApiKey(false);
  }, [currentProvider]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleApiKeyChange = (value: string) => {
    const key: PreferenceKey =
      currentProvider === 'openai' ? 'apiKey_openai' : 'apiKey_anthropic';
    onUpdatePreference(key, value);
    setVerifyStatus('idle');
    setVerifyResult(null);
  };

  const handleVerifyKey = async () => {
    if (!currentApiKey || currentApiKey.trim() === '') return;
    setVerifyStatus('verifying');
    const result = await verifyApiKey(currentProvider, currentApiKey);
    setVerifyStatus(result.success ? 'success' : 'error');
    setVerifyResult(result);
  };

  const handleApiKeyBlur = () => {
    if (currentApiKey && currentApiKey.trim() !== '') {
      handleVerifyKey();
    }
  };

  const handleApiKeyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyKey();
    }
  };

  // --- Pill selector helper ---
  const PillSelector = ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            value === opt.value
              ? 'bg-[#1a1a1a] text-[#f5c518] border-[#f5c518]'
              : 'bg-[#f5f3ef] text-[#999999] border-[#e8e2d8] hover:bg-[#fff3cd]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-bold text-[#1a1a1a]">
            {t('settings.title', 'Settings')}
          </h2>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#1a1a1a] text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* ── Output Defaults Section ── */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#999999] mb-4">
              {t('settings.outputDefaults', 'Output Defaults')}
            </h3>

            {/* Default Output Language */}
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
                  {t('settings.defaultOutputLanguage', 'Default Output Language')}
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#f5f3ef] text-[#999999] text-[10px] cursor-help">
                  ?
                </span>
              </div>
              <PillSelector
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'zh', label: '中文' },
                ]}
                value={preferences.defaultOutputLanguage || 'en'}
                onChange={(v) => onUpdatePreference('defaultOutputLanguage', v)}
              />
              <p className="text-xs text-[#999999] mt-1.5">
                {t('settings.canBeOverridden', 'Can be overridden per session')}
              </p>
            </div>

            {/* Default Output Format */}
            <div className="mb-2">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
                  {t('settings.defaultOutputFormat', 'Default Output Format')}
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#f5f3ef] text-[#999999] text-[10px] cursor-help">
                  ?
                </span>
              </div>
              <PillSelector
                options={[
                  { value: 'markdown', label: 'Markdown' },
                  { value: 'json', label: 'JSON' },
                  { value: 'yaml', label: 'YAML' },
                  { value: 'xml', label: 'XML' },
                ]}
                value={preferences.defaultOutputFormat || 'markdown'}
                onChange={(v) => onUpdatePreference('defaultOutputFormat', v)}
              />
              <p className="text-xs text-[#999999] mt-1.5">
                {t('settings.canBeOverridden', 'Can be overridden per session')}
              </p>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e8e2d8]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
              {t('settings.aiConfiguration', 'AI Configuration')}
            </span>
            <div className="flex-1 h-px bg-[#e8e2d8]" />
          </div>

          {/* ── AI Configuration Section ── */}
          <div className="space-y-4">
            {/* AI Provider */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#999999] mb-1.5 block">
                {t('settings.aiProvider', 'AI Provider')}
              </span>
              <PillSelector
                options={[
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                ]}
                value={currentProvider}
                onChange={(v) => onUpdatePreference('aiProvider', v)}
              />
            </div>

            {/* API Key */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#999999] mb-1.5 block">
                {t('settings.apiKey', 'API Key')}
              </span>
              <div className="flex gap-2">
                <input
                  ref={apiKeyInputRef}
                  type={showApiKey ? 'text' : 'password'}
                  value={currentApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  onBlur={handleApiKeyBlur}
                  onKeyDown={handleApiKeyKeyDown}
                  placeholder={`${currentProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}`}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-white transition-colors ${
                    verifyStatus === 'error'
                      ? 'border-[#ee5555]'
                      : 'border-[#e8e2d8] focus:border-[#f5c518]'
                  } outline-none`}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-[#e8e2d8] bg-[#f5f3ef] text-[#555555] hover:bg-[#fff3cd] transition-colors"
                >
                  {showApiKey
                    ? t('settings.hide', 'Hide')
                    : t('settings.show', 'Show')}
                </button>
              </div>

              {/* Verification Status */}
              {verifyStatus === 'verifying' && (
                <p className="text-xs text-[#999999] mt-2 animate-pulse">
                  {t('settings.verifying', 'Verifying...')}
                </p>
              )}
              {verifyStatus === 'success' && verifyResult && (
                <p className="text-xs text-[#44aa99] mt-2 font-medium">
                  ✓ {t('settings.keyVerified', 'Key verified')} — {verifyResult.provider}{' '}
                  {verifyResult.model}
                </p>
              )}
              {verifyStatus === 'error' && verifyResult && (
                <p className="text-xs text-[#ee5555] mt-2 font-medium">
                  ✗ {verifyResult.error || t('settings.invalidKey', 'Invalid API key. Please check and try again.')}
                </p>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 text-xs text-[#999999]">
              <span className="mt-0.5">🔒</span>
              <span>
                {t(
                  'settings.securityNote',
                  'Your API key is stored locally in your browser and is only sent to the AI provider\'s API. It is never sent to any other server.'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Verify the component compiles:
```bash
npx tsc --noEmit src/components/modals/SettingsModal.tsx
```

- [ ] **Step 3:** Visually verify the modal by running `npm run dev`, triggering it from the TopBar "Settings" link (wired in Task 14), and confirming:
  - Modal appears centered with semi-transparent backdrop
  - Dismiss works via ✕ button, backdrop click, and Escape key
  - Output Defaults section shows language and format pill selectors
  - AI Configuration section shows provider pills, API key input with Show/Hide
  - Verification status appears after blur/Enter on the API key input
  - All changes auto-save (no save button)

- [ ] **Step 4: Commit**
```bash
git add src/components/modals/SettingsModal.tsx
git commit -m "$(cat <<'EOF'
feat: add SettingsModal with output defaults and AI configuration

Two sections: Output Defaults (language + format pill selectors with
override subtitle) and AI Configuration (provider selector, masked
API key input, mock verification status, security note).
Auto-saves all changes to Dexie via onUpdatePreference callback.
EOF
)"
```

---

### Task 12: History Modal Component

**Files:** Create: `src/components/modals/HistoryModal.tsx`

- [ ] **Step 1:** Create the HistoryModal at `src/components/modals/HistoryModal.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { HistoryRecord } from '../../storage/db';
import { relativeTime } from '../../utils/relativeTime';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  count: number;
  onLoadRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: number) => Promise<void>;
  onClearAll: () => Promise<void>;
  hasEditorContent: boolean;
  uiLanguage: string;
}

export default function HistoryModal({
  open,
  onClose,
  records,
  count,
  onLoadRecord,
  onDeleteRecord,
  onClearAll,
  hasEditorContent,
  uiLanguage,
}: HistoryModalProps) {
  const { t } = useTranslation();
  const [confirmLoadId, setConfirmLoadId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If any inline confirmation is shown, dismiss that first
        if (confirmLoadId !== null || confirmDeleteId !== null || confirmClearAll) {
          setConfirmLoadId(null);
          setConfirmDeleteId(null);
          setConfirmClearAll(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose, confirmLoadId, confirmDeleteId, confirmClearAll]);

  // Reset confirmations when modal closes
  useEffect(() => {
    if (!open) {
      setConfirmLoadId(null);
      setConfirmDeleteId(null);
      setConfirmClearAll(false);
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleRowClick = (record: HistoryRecord) => {
    if (hasEditorContent) {
      setConfirmLoadId(record.id!);
    } else {
      onLoadRecord(record);
      onClose();
    }
  };

  const handleConfirmLoad = (record: HistoryRecord) => {
    setConfirmLoadId(null);
    onLoadRecord(record);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await onDeleteRecord(id);
    setConfirmDeleteId(null);
  };

  const handleClearAll = async () => {
    await onClearAll();
    setConfirmClearAll(false);
  };

  const locale = uiLanguage === 'zh' ? 'zh' : 'en';

  // Task type badge label map
  const taskTypeLabels: Record<string, string> = {
    ask: locale === 'zh' ? '提问' : 'Ask',
    create: locale === 'zh' ? '创作' : 'Create',
    transform: locale === 'zh' ? '转化' : 'Transform',
    analyze: locale === 'zh' ? '分析' : 'Analyze',
    ideate: locale === 'zh' ? '构思' : 'Ideate',
    execute: locale === 'zh' ? '执行' : 'Execute',
  };

  // Format label map
  const formatLabels: Record<string, string> = {
    markdown: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    xml: 'XML',
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[560px] mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#1a1a1a]">
            {t('history.title', 'History')}
          </h2>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#1a1a1a] text-xl leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Record list — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {records.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-[#999999]">
              <svg
                className="w-12 h-12 mb-3 text-[#e8e2d8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">
                {t('history.empty', 'No history yet')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ebe4]">
              {records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  className="py-3 cursor-pointer hover:bg-[#fffdf5] transition-colors -mx-2 px-2 rounded"
                >
                  {/* Inline load confirmation */}
                  {confirmLoadId === record.id ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#555555]">
                        {t(
                          'history.confirmLoad',
                          'Load this record? Current editor content will be replaced.'
                        )}
                      </p>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmLoadId(null);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-[#e8e2d8] text-[#555555] hover:bg-[#f5f3ef]"
                        >
                          {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmLoad(record);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-[#1a1a1a] text-[#f5c518] hover:bg-[#333333]"
                        >
                          {t('common.load', 'Load')}
                        </button>
                      </div>
                    </div>
                  ) : confirmDeleteId === record.id ? (
                    /* Inline delete confirmation */
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#ee5555] font-medium">
                        {t('history.confirmDelete', 'Delete this record?')}
                      </p>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-[#e8e2d8] text-[#555555] hover:bg-[#f5f3ef]"
                        >
                          {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                          onClick={(e) => handleConfirmDelete(e, record.id!)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-[#ee5555] text-white hover:bg-[#dd4444]"
                        >
                          {t('common.delete', 'Delete')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal record row */
                    <div className="flex items-start gap-3">
                      {/* Task type badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#1a1a1a] text-[#f5c518] flex-shrink-0 mt-0.5">
                        {taskTypeLabels[record.taskType] || record.taskType}
                      </span>

                      {/* Intent + metadata */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a1a1a] truncate">
                          {(record.fields?.intent as string) || '(no intent)'}
                        </p>
                        <p className="text-xs text-[#999999] mt-0.5">
                          {relativeTime(record.timestamp, locale)}
                          {' · '}
                          {formatLabels[record.outputFormat] || record.outputFormat}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteClick(e, record.id!)}
                        className="text-[#cccccc] hover:text-[#ee5555] transition-colors flex-shrink-0 p-1 mt-0.5"
                        aria-label="Delete record"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#f0ebe4] flex-shrink-0">
            <span className="text-xs text-[#999999]">
              {count} {count === 1
                ? t('history.record', 'record')
                : t('history.records', 'records')}
            </span>
            {confirmClearAll ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="px-3 py-1 text-xs font-medium rounded-md border border-[#e8e2d8] text-[#555555] hover:bg-[#f5f3ef]"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-[#ee5555] text-white hover:bg-[#dd4444]"
                >
                  {t('history.confirmClearAll', 'Yes, clear all')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="text-xs font-medium text-[#ee5555] hover:underline"
              >
                {t('history.clearAll', 'Clear All')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Verify the component compiles:
```bash
npx tsc --noEmit src/components/modals/HistoryModal.tsx
```

- [ ] **Step 3:** Visually verify the modal by running `npm run dev`, triggering it from the TopBar "History" link (wired in Task 14), and confirming:
  - Empty state shows centered "No history yet" with clock icon
  - After copying some prompts, records appear sorted newest-first
  - Each record shows: task type badge, truncated intent, relative timestamp, format indicator, delete icon
  - Clicking a row with non-empty editor shows inline load confirmation
  - Clicking delete icon shows inline delete confirmation
  - "Clear All" in footer shows confirmation before clearing
  - Dismiss works via ✕ button, backdrop click, and Escape

- [ ] **Step 4: Commit**
```bash
git add src/components/modals/HistoryModal.tsx
git commit -m "$(cat <<'EOF'
feat: add HistoryModal with sorted records, load/delete confirmations

Scrollable list sorted newest-first. Each row: task type badge +
truncated intent + relative timestamp + format + delete button.
Load confirmation when editor is non-empty. Individual delete and
Clear All both require confirmation. Empty state with clock icon.
EOF
)"
```

---

### Task 13: i18n Keys for Phase 4

**Files:** Modify: `src/i18n/locales/en.json`, `src/i18n/locales/zh.json`

- [ ] **Step 1:** Add the following keys to the English locale file (`src/i18n/locales/en.json`). Merge into the existing JSON structure under appropriate top-level keys:

```json
{
  "settings": {
    "title": "Settings",
    "outputDefaults": "Output Defaults",
    "defaultOutputLanguage": "Default Output Language",
    "defaultOutputFormat": "Default Output Format",
    "canBeOverridden": "Can be overridden per session",
    "aiConfiguration": "AI Configuration",
    "aiProvider": "AI Provider",
    "apiKey": "API Key",
    "show": "Show",
    "hide": "Hide",
    "verifying": "Verifying...",
    "keyVerified": "Key verified",
    "invalidKey": "Invalid API key. Please check and try again.",
    "securityNote": "Your API key is stored locally in your browser and is only sent to the AI provider's API. It is never sent to any other server."
  },
  "history": {
    "title": "History",
    "empty": "No history yet",
    "confirmLoad": "Load this record? Current editor content will be replaced.",
    "confirmDelete": "Delete this record?",
    "confirmClearAll": "Yes, clear all",
    "clearAll": "Clear All",
    "record": "record",
    "records": "records"
  },
  "common": {
    "cancel": "Cancel",
    "load": "Load",
    "delete": "Delete"
  }
}
```

- [ ] **Step 2:** Add the corresponding Chinese translations to `src/i18n/locales/zh.json`:

```json
{
  "settings": {
    "title": "设置",
    "outputDefaults": "输出默认值",
    "defaultOutputLanguage": "默认输出语言",
    "defaultOutputFormat": "默认输出格式",
    "canBeOverridden": "可在每次使用时覆盖",
    "aiConfiguration": "AI 配置",
    "aiProvider": "AI 提供商",
    "apiKey": "API 密钥",
    "show": "显示",
    "hide": "隐藏",
    "verifying": "验证中...",
    "keyVerified": "密钥已验证",
    "invalidKey": "无效的 API 密钥，请检查后重试。",
    "securityNote": "您的 API 密钥仅存储在浏览器本地，仅发送至 AI 提供商的 API，不会发送到任何其他服务器。"
  },
  "history": {
    "title": "历史记录",
    "empty": "暂无历史记录",
    "confirmLoad": "加载此记录？当前编辑器内容将被替换。",
    "confirmDelete": "删除此记录？",
    "confirmClearAll": "确认清空全部",
    "clearAll": "清空全部",
    "record": "条记录",
    "records": "条记录"
  },
  "common": {
    "cancel": "取消",
    "load": "加载",
    "delete": "删除"
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/i18n/locales/en.json src/i18n/locales/zh.json
git commit -m "$(cat <<'EOF'
feat: add i18n keys for Settings and History modals

English and Chinese translations for settings (output defaults,
AI configuration), history (empty state, confirmations, footer),
and common actions (cancel, load, delete).
EOF
)"
```

---

### Task 14: Wire TopBar to Open Modals

**Files:** Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1:** Update `TopBar.tsx` to accept and invoke modal open callbacks. Replace the current noop History and Settings text/buttons with clickable elements that call the callbacks:

The TopBar currently has placeholder text for History and Settings. Modify it to accept props and wire click handlers:

```tsx
// Add to TopBar props interface:
interface TopBarProps {
  // ... existing props (e.g., uiLanguage, onLanguageToggle) ...
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}
```

Then in the JSX, replace the noop History/Settings elements with:

```tsx
<button
  onClick={onOpenHistory}
  className="text-sm font-medium text-[#555555] hover:text-[#1a1a1a] transition-colors"
>
  {t('topbar.history', 'History')}
</button>
<button
  onClick={onOpenSettings}
  className="text-sm font-medium text-[#555555] hover:text-[#1a1a1a] transition-colors"
>
  {t('topbar.settings', 'Settings')}
</button>
```

- [ ] **Step 2:** Verify compilation:
```bash
npx tsc --noEmit src/components/layout/TopBar.tsx
```

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/TopBar.tsx
git commit -m "$(cat <<'EOF'
feat: wire TopBar History and Settings as modal triggers

Replace noop text with buttons that invoke onOpenHistory
and onOpenSettings callbacks passed via props.
EOF
)"
```

---

### Task 15: Wire CopyButton to Save History

**Files:** Modify: `src/components/preview/CopyButton.tsx`

- [ ] **Step 1:** Update `CopyButton.tsx` to accept an `onAfterCopy` callback prop and invoke it after a successful clipboard copy. This is where the history record creation is triggered:

```tsx
// Add to CopyButton props:
interface CopyButtonProps {
  // ... existing props ...
  onAfterCopy?: () => void;
}
```

In the existing copy handler (the function that calls `navigator.clipboard.writeText`), add the callback after a successful copy:

```tsx
// Inside the copy success path, after setting the "Copied!" state:
if (onAfterCopy) {
  onAfterCopy();
}
```

- [ ] **Step 2:** Verify compilation:
```bash
npx tsc --noEmit src/components/preview/CopyButton.tsx
```

- [ ] **Step 3: Commit**
```bash
git add src/components/preview/CopyButton.tsx
git commit -m "$(cat <<'EOF'
feat: add onAfterCopy callback to CopyButton for history recording

Invoked after successful clipboard copy so App.tsx can
create a history record with the current editor state.
EOF
)"
```

---

### Task 16: Wire App.tsx — Load Defaults + Modal State + History Save

**Files:** Modify: `src/App.tsx`

- [ ] **Step 1:** Import the new hooks and modal components in `App.tsx`:

```tsx
import { usePreferences, useHistory } from './hooks/useStorage';
import SettingsModal from './components/modals/SettingsModal';
import HistoryModal from './components/modals/HistoryModal';
```

- [ ] **Step 2:** Add state and hooks inside the App component:

```tsx
// Inside App component:

// Storage hooks
const { preferences, updatePreference, loading: prefsLoading } = usePreferences();
const {
  records: historyRecords,
  count: historyCount,
  addRecord: addHistoryRecord,
  removeRecord: removeHistoryRecord,
  clearAll: clearHistory,
  refresh: refreshHistory,
} = useHistory();

// Modal open/close state
const [settingsOpen, setSettingsOpen] = useState(false);
const [historyOpen, setHistoryOpen] = useState(false);
```

- [ ] **Step 3:** On preferences load, initialize output language and output format from stored defaults. Find the existing state setters for `outputLanguage` and `outputFormat` and add an effect:

```tsx
// Initialize output language and format from stored preferences
useEffect(() => {
  if (!prefsLoading) {
    if (preferences.defaultOutputLanguage) {
      setOutputLanguage(preferences.defaultOutputLanguage);
    }
    if (preferences.defaultOutputFormat) {
      setOutputFormat(preferences.defaultOutputFormat);
    }
  }
}, [prefsLoading]); // Only run once when preferences finish loading
```

- [ ] **Step 4:** Migrate UI language from localStorage to Dexie. If the existing Phase 3 code reads UI language from localStorage, add migration logic:

```tsx
// Migrate UI language from localStorage to Dexie (one-time)
useEffect(() => {
  if (!prefsLoading && !preferences.uiLanguage) {
    const legacyLang = localStorage.getItem('ui-language');
    if (legacyLang) {
      updatePreference('uiLanguage', legacyLang);
      localStorage.removeItem('ui-language');
    }
  }
}, [prefsLoading]);
```

- [ ] **Step 5:** Create the history save callback to pass to CopyButton:

```tsx
const handleAfterCopy = async () => {
  await addHistoryRecord({
    taskType: selectedTaskType,       // current task type from editor state
    fields: currentFields,            // current field values from editor state
    outputLanguage: outputLanguage,   // current output language
    outputFormat: outputFormat,       // current output format
    timestamp: Date.now(),
  });
};
```

- [ ] **Step 6:** Create the load record handler for the History modal:

```tsx
const handleLoadRecord = (record: HistoryRecord) => {
  setSelectedTaskType(record.taskType);
  setCurrentFields(record.fields);
  setOutputLanguage(record.outputLanguage);
  setOutputFormat(record.outputFormat);
};
```

- [ ] **Step 7:** Determine if the editor has content (for History modal's load confirmation):

```tsx
const hasEditorContent = useMemo(() => {
  if (!currentFields) return false;
  return Object.values(currentFields).some((v) => {
    if (typeof v === 'string') return v.trim() !== '';
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0;
    return v !== undefined && v !== null && v !== false && v !== 0;
  });
}, [currentFields]);
```

- [ ] **Step 8:** Wire the modals and updated props into the JSX. Add the modal components and pass the new props to TopBar and CopyButton:

```tsx
{/* In the JSX return: */}

<TopBar
  {/* ...existing props... */}
  onOpenHistory={() => { refreshHistory(); setHistoryOpen(true); }}
  onOpenSettings={() => setSettingsOpen(true)}
/>

{/* ...existing editor + preview layout... */}

<CopyButton
  {/* ...existing props... */}
  onAfterCopy={handleAfterCopy}
/>

{/* Modals — rendered at top level, outside the layout */}
<SettingsModal
  open={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  preferences={preferences}
  onUpdatePreference={updatePreference}
/>
<HistoryModal
  open={historyOpen}
  onClose={() => setHistoryOpen(false)}
  records={historyRecords}
  count={historyCount}
  onLoadRecord={handleLoadRecord}
  onDeleteRecord={removeHistoryRecord}
  onClearAll={clearHistory}
  hasEditorContent={hasEditorContent}
  uiLanguage={preferences.uiLanguage || 'en'}
/>
```

- [ ] **Step 9:** Verify compilation:
```bash
npx tsc --noEmit src/App.tsx
```

- [ ] **Step 10: Commit**
```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
feat: wire storage hooks, modals, and history save into App.tsx

- Load output language + format defaults from Dexie on mount
- Migrate UI language from localStorage to Dexie (one-time)
- Settings and History modals rendered at top level
- TopBar wired to open modals
- CopyButton wired to save history record on successful copy
- History modal receives load/delete/clearAll handlers
EOF
)"
```

---

### Task 17: Integration Testing — Settings Persistence

**Files:** Visual verification via `npm run dev`

- [ ] **Step 1:** Start the dev server:
```bash
npm run dev
```

- [ ] **Step 2:** Open the app in a browser and test the Settings flow:
  - Click "Settings" in TopBar — modal opens
  - Change Default Output Language to "中文" — preview header output language toggle updates
  - Change Default Output Format to "JSON" — preview header format selector updates
  - Close modal, **hard reload the page** (Cmd+Shift+R / Ctrl+Shift+R)
  - Verify output language initializes as "中文" and format as "JSON"
  - Open Settings again — values persist

- [ ] **Step 3:** Test AI Configuration:
  - Select "Anthropic" as provider
  - Enter "sk-ant-test-key-123" in the API key input
  - Tab away (blur) — verification should show "Verifying..." then "Key verified — Anthropic Claude Sonnet"
  - Switch provider to "OpenAI" — API key field should be empty (different provider)
  - Enter "sk-openai-test-456" — verify shows "OpenAI GPT-4o"
  - Switch back to "Anthropic" — should show the previously stored key "sk-ant-test-key-123"

- [ ] **Step 4:** Test modal dismiss behaviors:
  - Open Settings — click ✕ → closes
  - Open Settings — click backdrop → closes
  - Open Settings — press Escape → closes

---

### Task 18: Integration Testing — History Flow

**Files:** Visual verification via `npm run dev`

- [ ] **Step 1:** Test history creation:
  - Select "Ask" task type, fill in Intent with "How do React hooks compare to Vue composables?"
  - Click "Copy to Clipboard"
  - Click "History" in TopBar — should see 1 record with [Ask] badge, truncated intent, "just now", "Markdown"

- [ ] **Step 2:** Create multiple records:
  - Switch to "Create" task type, fill Intent, change format to JSON, click Copy
  - Switch to "Analyze" task type, fill Intent, change format to YAML, click Copy
  - Open History — should show 3 records, newest first, each with correct task type badge and format

- [ ] **Step 3:** Test record loading:
  - With fields still filled, click the oldest record — inline confirmation appears
  - Click "Cancel" — nothing changes
  - Click the oldest record again, click "Load" — editor should restore that record's task type, fields, output language, and format
  - Clear all fields, open History, click a record — should load directly without confirmation

- [ ] **Step 4:** Test deletion:
  - Open History, click 🗑 on a record — "Delete this record?" confirmation appears
  - Click "Cancel" — record remains
  - Click 🗑 again, click "Delete" — record removed, count updates

- [ ] **Step 5:** Test Clear All:
  - Open History, click "Clear All" — confirmation appears
  - Click "Yes, clear all" — all records removed, empty state shown

- [ ] **Step 6: Commit** (commit the changelog update from integration testing)
```bash
git add .claude/changelog.md
git commit -m "$(cat <<'EOF'
docs: update changelog for Phase 4 persistence implementation
EOF
)"
```

---

### Task 19: Run All Tests

**Files:** All test files

- [ ] **Step 1:** Run the entire test suite to confirm nothing is broken:
```bash
npx vitest run
```
Expected: all existing Phase 1-3 tests pass, plus the new Phase 4 storage tests.

- [ ] **Step 2:** If any tests fail, diagnose and fix. Common issues:
  - Missing `fake-indexeddb/auto` import at the top of test files
  - Dexie singleton not reset between tests (check `beforeEach` cleanup)
  - Type errors from new prop additions to TopBar or CopyButton

- [ ] **Step 3:** If fixes were needed, commit them:
```bash
git add -A
git commit -m "$(cat <<'EOF'
fix: resolve test failures from Phase 4 integration
EOF
)"
```

---

### Task 20: Update Changelog

**Files:** Modify: `.claude/changelog.md`

- [ ] **Step 1:** Add a Phase 4 entry to `.claude/changelog.md`:

```markdown
## [2026-04-07] - Phase 4: Persistence — Settings + History
- Created Dexie.js database schema (v1) with preferences, history, templates stores (`src/storage/db.ts`)
- Added preferences CRUD helpers with typed keys (`src/storage/preferences.ts`)
- Added history CRUD helpers with sorted retrieval (`src/storage/history.ts`)
- Added React storage hooks: usePreferences, useHistory (`src/hooks/useStorage.ts`)
- Added mock API key verifier for Phase 4 (`src/storage/apiKeyVerifier.ts`)
- Added bilingual relative timestamp utility (`src/utils/relativeTime.ts`)
- Created SettingsModal with Output Defaults and AI Configuration sections (`src/components/modals/SettingsModal.tsx`)
- Created HistoryModal with sorted records, load/delete confirmations, empty state (`src/components/modals/HistoryModal.tsx`)
- Added i18n keys for Settings and History modals (en.json, zh.json)
- Wired TopBar History/Settings as modal triggers
- Wired CopyButton to save history record on successful copy
- Wired App.tsx: load defaults on mount, migrate UI language from localStorage to Dexie, render modals
- Added storage tests: db.test.ts, preferences.test.ts, history.test.ts (all using fake-indexeddb)
```

> **Note:** This entry should be committed alongside the final task commit, or as a standalone commit if all other tasks are already committed.

---

## Summary of Commits (expected ~12 commits)

| # | Message | Files |
|---|---------|-------|
| 1 | `chore: add dexie and fake-indexeddb dependencies` | package.json, package-lock.json |
| 2 | `feat: add Dexie.js database schema with preferences, history, templates stores` | src/storage/db.ts, tests/storage/db.test.ts |
| 3 | `feat: add preferences CRUD helpers with typed keys` | src/storage/preferences.ts, tests/storage/preferences.test.ts |
| 4 | `feat: add history CRUD helpers with sorted retrieval` | src/storage/history.ts, tests/storage/history.test.ts |
| 5 | `feat: add usePreferences and useHistory React hooks` | src/hooks/useStorage.ts |
| 6 | `feat: add mock API key verifier for Phase 4` | src/storage/apiKeyVerifier.ts |
| 7 | `feat: add bilingual relative timestamp utility` | src/utils/relativeTime.ts |
| 8 | `feat: add SettingsModal with output defaults and AI configuration` | src/components/modals/SettingsModal.tsx |
| 9 | `feat: add HistoryModal with sorted records, load/delete confirmations` | src/components/modals/HistoryModal.tsx |
| 10 | `feat: add i18n keys for Settings and History modals` | en.json, zh.json |
| 11 | `feat: wire TopBar History and Settings as modal triggers` | TopBar.tsx |
| 12 | `feat: add onAfterCopy callback to CopyButton for history recording` | CopyButton.tsx |
| 13 | `feat: wire storage hooks, modals, and history save into App.tsx` | App.tsx |
| 14 | `docs: update changelog for Phase 4 persistence implementation` | changelog.md |
