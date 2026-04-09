import { db, type Preference } from './db';

/** Well-known preference keys for type safety */
export type PreferenceKey =
  | 'defaultOutputLanguage'
  | 'defaultOutputFormat'
  | 'aiApiType'
  | 'apiKey_openai'
  | 'apiKey_anthropic'
  | 'apiEndpoint_openai'
  | 'apiEndpoint_anthropic'
  | 'model_openai'
  | 'model_anthropic'
  | 'uiLanguage'
  | 'lastSeenAnnouncementVersion'
  | 'tutorialCompleted';

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
