import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueFieldProps {
  field: FieldDefinition;
  value: KeyValuePair[];
  onChange: (value: KeyValuePair[]) => void;
}

interface SortablePairProps {
  id: string;
  index: number;
  pair: KeyValuePair;
  onUpdate: (index: number, pair: KeyValuePair) => void;
  onDelete: (index: number) => void;
}

function SortablePair({ id, index, pair, onUpdate, onDelete }: SortablePairProps) {
  const { t } = useTranslation();
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
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-2 py-1.5">
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-sm select-none flex-shrink-0 text-ink-hint"
        aria-label="drag to reorder"
      >
        ⠿
      </span>
      <input
        type="text"
        value={pair.key}
        onChange={(e) => onUpdate(index, { ...pair, key: e.target.value })}
        placeholder={t('editor.keyPlaceholder')}
        className="text-sm font-semibold outline-none bg-transparent text-ink-primary"
        style={{ width: '80px' }}
      />
      <input
        type="text"
        value={pair.value}
        onChange={(e) => onUpdate(index, { ...pair, value: e.target.value })}
        placeholder={t('editor.valuePlaceholder')}
        className="flex-1 text-sm outline-none bg-transparent text-ink-primary"
      />
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="flex-shrink-0 text-sm transition-colors text-ink-hint hover:text-status-danger"
        aria-label="delete pair"
      >
        ✕
      </button>
    </div>
  );
}

let kvNextId = 0;

export function KeyValueField({ field, value, onChange }: KeyValueFieldProps) {
  const { t } = useTranslation();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Stable IDs for @dnd-kit — state (not refs) so they're safe to read during render
  const [ids, setIds] = useState<string[]>(() =>
    value.map(() => `kv-${kvNextId++}`)
  );

  if (ids.length !== value.length) {
    setIds(value.map(() => `kv-${kvNextId++}`));
  }

  const items = value.map((pair, i) => ({ id: ids[i], pair }));

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
    setIds([...ids, `kv-${kvNextId++}`]);
    onChange([...value, { key: newKey, value: newValue }]);
    setNewKey('');
    setNewValue('');
  };

  const handleUpdate = (index: number, pair: KeyValuePair) => {
    const updated = [...value];
    updated[index] = pair;
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
      <FieldLabel fieldKey={field.key} inputType="key-value" />
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
                <SortablePair
                  id={item.id}
                  index={index}
                  pair={item.pair}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
        {/* Add pair row */}
        {value.length > 0 && <div className="border-t border-border-light" />}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm flex-shrink-0 text-accent-primary font-bold hover:scale-110 transition-transform"
            aria-label="add pair"
          >
            +
          </button>
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('editor.keyPlaceholder')}
            className="text-sm outline-none bg-transparent font-semibold text-ink-primary"
            style={{ width: '80px' }}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('editor.valuePlaceholder')}
            className="flex-1 text-sm outline-none bg-transparent text-ink-primary"
          />
        </div>
      </div>
    </div>
  );
}
