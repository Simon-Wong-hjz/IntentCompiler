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
