import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { IntentCompilerDB } from '../../src/storage/db';

describe('IntentCompilerDB', () => {
  let testDb: IntentCompilerDB;

  beforeEach(async () => {
    await Dexie.delete('intent-compiler-test');
    testDb = new class extends IntentCompilerDB {
      constructor() {
        super();
        // Override the name to avoid conflict with the singleton
      }
    };
    // Use a separate test DB name
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
