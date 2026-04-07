import { cn } from '@/lib/utils';
import type { TaskType } from '@/registry/types';

interface TaskCardProps {
  type: TaskType;
  verb: string;
  mentalModel: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TaskCard({
  verb,
  mentalModel,
  isSelected,
  onClick,
}: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start px-3 py-2 rounded-lg transition-colors text-left cursor-pointer',
        isSelected
          ? 'bg-ink-primary text-accent-primary border-2 border-accent-primary'
          : 'bg-bg-surface border-[1.5px] border-border-accent hover:bg-bg-accent-light',
      )}
    >
      <span
        className={cn(
          'text-base font-bold leading-tight',
          isSelected ? 'text-accent-primary' : 'text-ink-primary',
        )}
      >
        {verb}
      </span>
      <span
        className={cn(
          'text-xs leading-tight mt-0.5',
          isSelected ? 'text-accent-primary/70' : 'text-ink-muted',
        )}
      >
        {mentalModel}
      </span>
    </button>
  );
}
