import { useTranslation } from 'react-i18next';
import type { AiFillStatus } from '@/hooks/useAiFill';

interface AiFillButtonProps {
  status: AiFillStatus;
  disabled: boolean;
  hasApiKey: boolean;
  filledCount: number;
  errorMessage: string;
  onFill: () => void;
  onDismissError: () => void;
  onOpenSettings?: () => void;
}

export function AiFillButton({
  status,
  disabled,
  hasApiKey,
  filledCount,
  errorMessage,
  onFill,
  onDismissError,
  onOpenSettings,
}: AiFillButtonProps) {
  const { t } = useTranslation();
  const isLoading = status === 'loading';

  // No API key: show lock icon button that opens settings
  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold bg-ink-primary text-accent-primary opacity-40 cursor-pointer"
          title={t('ai.configureProvider')}
        >
          {'\u{1F512}'} {t('ai.fillButtonLock')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      {/* Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={onFill}
          disabled={disabled || isLoading}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
            isLoading
              ? 'bg-accent-primary text-ink-primary cursor-wait'
              : disabled
                ? 'bg-ink-primary text-accent-primary opacity-40 cursor-not-allowed'
                : 'bg-ink-primary text-accent-primary hover:opacity-90 cursor-pointer'
          }`}
        >
          {isLoading ? `\u27F3 ${t('ai.fillButtonLoading')}` : `\u2728 ${t('ai.fillButton')}`}
        </button>
        {/* Tooltip when disabled (intent empty or no task selected) */}
        {disabled && !isLoading && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 rounded-md bg-ink-primary px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
            role="tooltip"
          >
            {t('ai.enterIntentFirst')}
          </div>
        )}
      </div>

      {/* Loading progress bar */}
      {isLoading && (
        <div className="w-full h-[3px] mt-1.5 rounded-full overflow-hidden bg-border-default">
          <div className="h-full bg-accent-primary animate-ai-fill-progress" />
        </div>
      )}

      {/* Success message */}
      {status === 'success' && filledCount > 0 && (
        <p className="mt-1.5 text-xs text-status-success font-medium animate-fade-in">
          {'\u2713'} {t('ai.filledCount', { count: filledCount })}
        </p>
      )}

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <p className="text-xs text-status-danger font-medium">
            {'\u2717'} {t('ai.fillFailed')} {errorMessage}
          </p>
          <button
            type="button"
            onClick={onDismissError}
            className="text-xs text-status-danger hover:text-ink-primary font-bold shrink-0"
            aria-label="Dismiss error"
          >
            {'\u2715'}
          </button>
        </div>
      )}
    </div>
  );
}
