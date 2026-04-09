import type { TaskType, FieldDefinition } from '@/registry/types';

/** Request payload for AI field filling */
export interface AiFillRequest {
  intent: string;
  taskType: TaskType;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
  apiKey: string;
  endpoint?: string;
  model?: string;
  language?: string;
}

/** Response from AI field filling */
export interface AiFillResponse {
  filledFields: Record<string, unknown>;
  addedFieldKeys?: string[];
}

/** A model option returned by listModels */
export interface ModelOption {
  id: string;
  name: string;
}

/** Result of API key verification */
export interface VerifyResult {
  valid: boolean;
  model?: string;
  error?: string;
}

/** Abstract AI provider interface */
export interface AiProvider {
  name: string;
  fillFields(request: AiFillRequest, signal?: AbortSignal): Promise<AiFillResponse>;
  verifyKey(apiKey: string, endpoint?: string): Promise<VerifyResult>;
  listModels(apiKey: string, endpoint?: string): Promise<ModelOption[]>;
}

/** Provider identifiers */
export type AiProviderName = 'openai' | 'anthropic';
