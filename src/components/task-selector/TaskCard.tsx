import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TaskType } from '@/registry/types';

interface TaskCardProps {
  taskType: TaskType;
  isSelected: boolean;
  onClick: () => void;
}

export function TaskCard({
  taskType,
  isSelected,
  onClick,
}: TaskCardProps) {
  const { t } = useTranslation();

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
        {t(`taskTypes.${taskType}.verb`)}
      </span>
      <span
        className={cn(
          'text-xs leading-tight mt-0.5',
          isSelected ? 'text-accent-primary/70' : 'text-ink-muted',
        )}
      >
        {t(`taskTypes.${taskType}.mentalModel`)}
      </span>
    </button>
  );
}
