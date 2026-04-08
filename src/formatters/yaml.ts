import * as yaml from 'js-yaml';
import type { OrderedField, Formatter } from '@/compiler/types';

function isKeyValueArray(value: unknown): value is Array<{ key: string; value: string }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'key' in value[0]
  );
}

/**
 * YAML formatter that preserves field insertion order.
 *
 * js-yaml's dump() does not guarantee key order when given a plain object.
 * To preserve ordering, we dump each field individually and concatenate.
 */
export class YamlFormatter implements Formatter {
  format(fields: OrderedField[]): string {
    if (fields.length === 0) {
      return '';
    }

    const fragments = fields.flatMap((field) => {
      if (isKeyValueArray(field.value)) {
        return field.value
          .filter((pair) => pair.key.trim() || pair.value.trim())
          .map((pair) => {
            const singleEntry = { [pair.key || '(untitled)']: pair.value };
            return yaml.dump(singleEntry, {
              lineWidth: -1,
              quotingType: '"',
              forceQuotes: false,
            });
          });
      }
      const singleEntry = { [field.label]: field.value };
      return yaml.dump(singleEntry, {
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false,
      });
    });

    return fragments.join('');
  }
}
