import { useTranslation } from 'react-i18next';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  disabled: boolean;
  onAfterCopy?: () => void;
}

export function CopyButton({ text, disabled, onAfterCopy }: CopyButtonProps) {
  const { t } = useTranslation();
  const { status, copy } = useClipboard(1500);

  const handleClick = async () => {
    if (!disabled) {
      await copy(text);
      onAfterCopy?.();
    }
  };

  return (
    <button
      data-tutorial="copy-button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full py-2.5 rounded-lg font-bold text-sm transition-all',
        disabled
          ? 'bg-accent-primary/40 text-ink-primary/40 cursor-not-allowed'
          : status === 'error'
            ? 'bg-status-danger text-white cursor-pointer'
            : 'bg-accent-primary text-ink-primary cursor-pointer hover:brightness-95 active:scale-[0.99]',
      )}
    >
      {status === 'success' && t('preview.copied')}
      {status === 'error' && t('preview.copyFailed')}
      {status === 'idle' && t('preview.copyToClipboard')}
    </button>
  );
}
