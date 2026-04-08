import type { OrderedField, Formatter } from '@/compiler/types';

export class JsonFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    const entries: [string, unknown][] = fields.map((field) => [
      field.label,
      field.value,
    ]);
    const obj = Object.fromEntries(entries);
    return JSON.stringify(obj, null, 2);
  }
}
