import { useState, useEffect, useCallback } from 'react';
import {
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
  aiApiType: string;
  apiKey_openai: string;
  apiKey_anthropic: string;
  apiEndpoint_openai: string;
  apiEndpoint_anthropic: string;
  model_openai: string;
  model_anthropic: string;
  uiLanguage: string;
  lastSeenAnnouncementVersion: string;
  tutorialCompleted: string;
}

const DEFAULT_PREFERENCES: PreferencesState = {
  defaultOutputLanguage: 'zh',
  defaultOutputFormat: 'markdown',
  aiApiType: 'openai',
  apiKey_openai: '',
  apiKey_anthropic: '',
  apiEndpoint_openai: 'https://api.openai.com/v1',
  apiEndpoint_anthropic: 'https://api.anthropic.com',
  model_openai: '',
  model_anthropic: '',
  uiLanguage: 'zh',
  lastSeenAnnouncementVersion: '',
  tutorialCompleted: '',
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

  // Load history on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [fetched, total] = await Promise.all([
        getHistoryRecords(),
        getHistoryCount(),
      ]);
      if (cancelled) return;
      setRecords(fetched);
      setCount(total);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

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
