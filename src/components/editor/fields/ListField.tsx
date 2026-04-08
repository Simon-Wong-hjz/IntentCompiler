import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FieldLabel } from '@/components/editor/FieldLabel';
import type { FieldDefinition } from '@/registry/types';

interface ListFieldProps {
  field: FieldDefinition;
  value: string[];
  onChange: (value: string[]) => void;
}

interface SortableItemProps {
  id: string;
  index: number;
  text: string;
  onUpdate: (index: number, text: string) => void;
  onDelete: (index: number) => void;
}

function SortableItem({ id, index, text, onUpdate, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-sm select-none flex-shrink-0 text-ink-hint"
        aria-label="拖拽排序"
      >
        ⠿
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => onUpdate(index, e.target.value)}
        className="flex-1 text-sm outline-none bg-transparent text-ink-primary"
      />
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="flex-shrink-0 text-sm transition-colors text-ink-hint hover:text-status-danger"
        aria-label="Delete item"
      >
        ✕
      </button>
    </div>
  );
}

let listNextId = 0;

export function ListField({ field, value, onChange }: ListFieldProps) {
  const [newItem, setNewItem] = useState('');

  // Stable IDs for @dnd-kit — state (not refs) so they're safe to read during render
  const [ids, setIds] = useState<string[]>(() =>
    value.map(() => `list-${listNextId++}`)
  );

  // Sync IDs when value length changes externally (e.g., task type switch)
  if (ids.length !== value.length) {
    setIds(value.map(() => `list-${listNextId++}`));
  }

  const items = value.map((text, i) => ({ id: ids[i], text }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setIds(arrayMove(ids, oldIndex, newIndex));
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const handleAdd = () => {
    setIds([...ids, `list-${listNextId++}`]);
    onChange([...value, newItem]);
    setNewItem('');
  };

  const handleUpdate = (index: number, text: string) => {
    const updated = [...value];
    updated[index] = text;
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    setIds(ids.filter((_, i) => i !== index));
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <FieldLabel fieldKey={field.key} inputType="list" />
      <div className="rounded-lg overflow-hidden border border-border-default">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <div className="border-t border-border-light" />}
                <SortableItem
                  id={item.id}
                  index={index}
                  text={item.text}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
        {/* Add item row */}
        {items.length > 0 && <div className="border-t border-border-light" />}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm flex-shrink-0 text-accent-primary font-bold hover:scale-110 transition-transform"
            aria-label="添加项"
          >
            +
          </button>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="添加项..."
            className="flex-1 text-sm outline-none bg-transparent text-ink-primary placeholder:text-ink-hint"
          />
        </div>
      </div>
    </div>
  );
}
