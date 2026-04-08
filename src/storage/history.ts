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
