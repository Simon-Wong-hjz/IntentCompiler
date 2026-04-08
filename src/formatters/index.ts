import { MarkdownFormatter } from '@/formatters/markdown';
import { JsonFormatter } from '@/formatters/json';
import { YamlFormatter } from '@/formatters/yaml';
import { XmlFormatter } from '@/formatters/xml';
import type { Formatter, OutputFormat } from '@/compiler/types';

const formatters: Record<OutputFormat, Formatter> = {
  markdown: new MarkdownFormatter(),
  json: new JsonFormatter(),
  yaml: new YamlFormatter(),
  xml: new XmlFormatter(),
};

export function getFormatter(format: OutputFormat): Formatter {
  return formatters[format];
}

export { MarkdownFormatter, JsonFormatter, YamlFormatter, XmlFormatter };
