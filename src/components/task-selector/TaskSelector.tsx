import { TaskCard } from '@/components/task-selector/TaskCard';
import { getAllTaskTypes } from '@/registry/template-registry';
import type { TaskType } from '@/registry/types';

interface TaskSelectorProps {
  selectedType: TaskType | null;
  onSelect: (type: TaskType) => void;
}

export function TaskSelector({ selectedType, onSelect }: TaskSelectorProps) {
  const taskTypes = getAllTaskTypes();

  return (
    <div className="px-5 py-3">
      <div className="grid grid-cols-6 gap-2 min-[0px]:max-[1279px]:grid-cols-3">
        {taskTypes.map((tt) => (
          <TaskCard
            key={tt.type}
            verb={tt.verb.zh}
            mentalModel={tt.mentalModel.zh}
            isSelected={selectedType === tt.type}
            onClick={() => onSelect(tt.type)}
          />
        ))}
      </div>
    </div>
  );
}
