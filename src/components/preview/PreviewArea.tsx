import { CopyButton } from '@/components/preview/CopyButton';

interface PreviewAreaProps {
  compiledOutput: string;
  hasContent: boolean;
}

export function PreviewArea({ compiledOutput, hasContent }: PreviewAreaProps) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto bg-bg-surface border-[1.5px] border-border-default rounded-lg m-5 mb-0 p-4"
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
        ) : (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">
            Select a task type and fill in fields to see the preview
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-5 py-3 border-t border-border-light">
        <CopyButton text={compiledOutput} disabled={!hasContent} />
      </div>
    </div>
  );
}
