import type { TaskType, FieldDefinition } from '@/registry/types';

/** Request payload for AI field filling */
export interface AiFillRequest {
  intent: string;
  taskType: TaskType;
  currentFields: FieldDefinition[];
  allOptionalFields: FieldDefinition[];
  allowAddFields: boolean;
  apiKey: string;
}

/** Response from AI field filling */
export interface AiFillResponse {
  filledFields: Record<string, unknown>;
  addedFieldKeys?: string[];
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
  fillFields(request: AiFillRequest): Promise<AiFillResponse>;
  verifyKey(apiKey: string): Promise<VerifyResult>;
}

/** Provider identifiers */
export type AiProviderName = 'openai' | 'anthropic';
