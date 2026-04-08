import * as yaml from 'js-yaml';
import type { OrderedField, Formatter } from '@/compiler/types';

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

    const fragments = fields.map((field) => {
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
