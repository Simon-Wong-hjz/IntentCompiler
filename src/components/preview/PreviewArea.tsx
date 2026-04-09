import { useTranslation } from 'react-i18next';
import { CopyButton } from '@/components/preview/CopyButton';
import { PreviewHeader } from '@/components/preview/PreviewHeader';
import type { OutputFormat, Language } from '@/compiler/types';

interface PreviewAreaProps {
  compiledOutput: string;
  hasContent: boolean;
  canCopy: boolean;
  skeletonOutput: string;
  outputFormat: OutputFormat;
  outputLanguage: Language;
  onFormatChange: (format: OutputFormat) => void;
  onOutputLanguageChange: (language: Language) => void;
  onAfterCopy?: () => void;
}

export function PreviewArea({
  compiledOutput,
  hasContent,
  canCopy,
  skeletonOutput,
  outputFormat,
  outputLanguage,
  onFormatChange,
  onOutputLanguageChange,
  onAfterCopy,
}: PreviewAreaProps) {
  const { t } = useTranslation();
  const hasSkeleton = skeletonOutput.trim().length > 0;

  return (
    <div className="flex flex-col h-full" data-tutorial="preview-area">
      <PreviewHeader
        outputFormat={outputFormat}
        outputLanguage={outputLanguage}
        onFormatChange={onFormatChange}
        onLanguageChange={onOutputLanguageChange}
      />

      <div
        className="flex-1 overflow-y-auto bg-bg-surface border-[1.5px] border-border-default rounded-lg mx-5 mb-0 p-4"
        style={{
          fontFamily: "'SF Mono', 'Cascadia Code', Consolas, monospace",
          fontSize: '14px',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
        }}
      >
        {hasContent ? (
          <pre className="text-ink-secondary whitespace-pre-wrap m-0 font-[inherit]">
            {compiledOutput}
          </pre>
        ) : hasSkeleton ? (
          <pre className="text-ink-hint whitespace-pre-wrap m-0 font-[inherit]">
            {skeletonOutput}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">
            {t('preview.emptyState')}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-5 py-3 border-t border-border-light">
        <CopyButton text={compiledOutput} disabled={!canCopy} onAfterCopy={onAfterCopy} />
      </div>
    </div>
  );
}
