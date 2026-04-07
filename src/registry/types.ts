export type InputType =
  | 'textarea'
  | 'text'
  | 'select'
  | 'combo'
  | 'list'
  | 'toggle'
  | 'number'
  | 'key-value';

export type TaskType =
  | 'ask'
  | 'create'
  | 'transform'
  | 'analyze'
  | 'ideate'
  | 'execute';

export type FieldScope = 'universal' | 'task';

export type FieldVisibility = 'default' | 'optional';

export interface FieldDefinition {
  key: string;
  inputType: InputType;
  scope: FieldScope;
  visibility: FieldVisibility;
  options?: string[];
  required?: boolean;
}

export interface TaskTemplate {
  type: TaskType;
  verb: { en: string; zh: string };
  mentalModel: { en: string; zh: string };
  fields: FieldDefinition[];
}
