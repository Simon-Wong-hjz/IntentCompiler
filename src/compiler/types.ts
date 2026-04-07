export type OutputFormat = 'markdown' | 'json' | 'yaml' | 'xml';

export type Language = 'en' | 'zh';

export interface OrderedField {
  key: string;
  label: string;
  value: unknown;
}

export interface Formatter {
  format(fields: OrderedField[]): string;
}
