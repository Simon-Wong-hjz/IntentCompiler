import { MarkdownFormatter } from '@/formatters/markdown';
import type { Formatter, OutputFormat } from '@/compiler/types';

const formatters: Record<string, Formatter> = {
  markdown: new MarkdownFormatter(),
};

export function getFormatter(format: OutputFormat): Formatter {
  const formatter = formatters[format];
  if (!formatter) {
    throw new Error(`Formatter not implemented: ${format}`);
  }
  return formatter;
}

export { MarkdownFormatter } from '@/formatters/markdown';
