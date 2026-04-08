import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/storage/db';
import {
  getPreference,
  setPreference,
  deletePreference,
  getAllPreferences,
} from '../../src/storage/preferences';

describe('Preferences CRUD', () => {
  beforeEach(async () => {
    await db.preferences.clear();
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
