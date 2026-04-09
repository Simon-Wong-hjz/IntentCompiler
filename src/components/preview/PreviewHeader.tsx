import { useTranslation } from 'react-i18next';
import type { OutputFormat, Language } from '@/compiler/types';

interface PreviewHeaderProps {
  outputFormat: OutputFormat;
  outputLanguage: Language;
  onFormatChange: (format: OutputFormat) => void;
  onLanguageChange: (language: Language) => void;
}

const FORMAT_OPTIONS: { value: OutputFormat; labelKey: string }[] = [
  { value: 'markdown', labelKey: 'preview.formatMarkdown' },
  { value: 'json', labelKey: 'preview.formatJson' },
  { value: 'yaml', labelKey: 'preview.formatYaml' },
  { value: 'xml', labelKey: 'preview.formatXml' },
];

export function PreviewHeader({
  outputFormat,
  outputLanguage,
  onFormatChange,
  onLanguageChange,
}: PreviewHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-1" data-tutorial="preview-controls">
      {/* Left side: OUTPUT label + output language toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
          {t('preview.output')}
        </span>
        <div className="flex rounded-sm overflow-hidden border border-border-default">
          <button
            type="button"
            className={`px-2 py-0.5 text-xs font-medium transition-colors ${
              outputLanguage === 'en'
                ? 'bg-ink-primary text-accent-primary'
                : 'bg-transparent text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
            }`}
            onClick={() => onLanguageChange('en')}
          >
            {t('common.en')}
          </button>
          <button
            type="button"
            className={`px-2 py-0.5 text-xs font-medium transition-colors ${
              outputLanguage === 'zh'
                ? 'bg-ink-primary text-accent-primary'
                : 'bg-transparent text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
            }`}
            onClick={() => onLanguageChange('zh')}
          >
            {t('common.zh')}
          </button>
        </div>
      </div>

      {/* Right side: format selector pills */}
      <div className="flex gap-1" data-tutorial="format-selector">
        {FORMAT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              outputFormat === option.value
                ? 'bg-ink-primary text-accent-primary'
                : 'bg-bg-accent-light text-ink-muted hover:bg-bg-muted hover:text-ink-secondary'
            }`}
            onClick={() => onFormatChange(option.value)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
