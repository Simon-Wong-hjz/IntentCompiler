import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/storage/db';
import type { HistoryRecord } from '../../src/storage/db';
import {
  addHistoryRecord,
  getHistoryRecords,
  getHistoryRecord,
  deleteHistoryRecord,
  clearAllHistory,
  getHistoryCount,
} from '../../src/storage/history';

const makeRecord = (overrides: Partial<Omit<HistoryRecord, 'id'>> = {}) => ({
  taskType: 'ask',
  fields: { intent: 'How do React hooks work?' },
  outputLanguage: 'en',
  outputFormat: 'markdown',
  timestamp: Date.now(),
  ...overrides,
});

describe('History CRUD', () => {
  beforeEach(async () => {
    await db.history.clear();
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
