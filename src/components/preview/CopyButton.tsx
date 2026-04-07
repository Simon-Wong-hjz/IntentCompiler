import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  disabled: boolean;
}

export function CopyButton({ text, disabled }: CopyButtonProps) {
  const { status, copy } = useClipboard(1500);

  const handleClick = () => {
    if (!disabled) {
      copy(text);
    }
  };

  return (
    <button
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
      {status === 'success' && '\u2713 Copied!'}
      {status === 'error' && '\u2717 Copy failed'}
      {status === 'idle' && 'Copy to Clipboard'}
    </button>
  );
}
