import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldDefinition } from '@/registry/types';

interface AddFieldPanelProps {
  taskOptionalFields: FieldDefinition[];
  universalOptionalFields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
}

/** Animation duration for the row slide-up removal (ms). */
const ROW_REMOVE_DURATION = 200;

function FieldRow({
  field,
  onAdd,
  isRemoving,
}: {
  field: FieldDefinition;
  onAdd: () => void;
  isRemoving: boolean;
}) {
  const { t } = useTranslation();
  const displayName = t(`fields.${field.key}`);
  const description = t(`fieldDescriptions.${field.key}`);

  return (
    <div
      style={isRemoving ? { animation: `row-slide-up ${ROW_REMOVE_DURATION}ms ease-in forwards` } : undefined}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-ink-primary">
              {displayName}
            </span>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold flex-shrink-0 border border-ink-hint text-ink-muted -translate-y-1 cursor-help">
              ?
            </span>
          </div>
          {description && (
            <p className="text-xs mt-0.5 text-ink-muted">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={isRemoving}
          className="flex-shrink-0 ml-3 text-lg font-bold leading-none text-accent-primary hover:scale-110 transition-transform"
          aria-label={displayName}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function AddFieldPanel({
  taskOptionalFields,
  universalOptionalFields,
  onAddField,
}: AddFieldPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [removingFieldKey, setRemovingFieldKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Filter out custom_fields from universal optional — it gets its own section
  const universalWithoutCustom = universalOptionalFields.filter(
    (f) => f.key !== 'custom_fields'
  );
  const customFieldDef = universalOptionalFields.find(
    (f) => f.key === 'custom_fields'
  );

  const handleExpand = () => {
    setIsExpanded(true);
    setIsClosing(false);
    // Scroll into view after the panel renders
    setTimeout(() => {
      panelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleCollapse = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 200);
  };

  const handleFieldClick = (field: FieldDefinition) => {
    setRemovingFieldKey(field.key);
    // After the slide-up animation completes, actually add the field
    setTimeout(() => {
      onAddField(field);
      setRemovingFieldKey(null);
    }, ROW_REMOVE_DURATION);
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className="w-full py-3 text-sm font-semibold rounded-lg transition-colors bg-bg-surface border-[1.5px] border-dashed border-border-default text-ink-primary hover:border-accent-primary"
      >
        {t('editor.addField')}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="rounded-lg overflow-hidden border border-border-default"
      style={{
        animation: isClosing
          ? 'slide-collapse 200ms ease-in forwards'
          : 'slide-expand 250ms ease-out',
      }}
    >
      {/* Recommended section (task-scoped optional fields) */}
      {taskOptionalFields.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs font-bold bg-ink-primary text-accent-primary">
            {t('editor.recommended')}
          </div>
          {taskOptionalFields.map((field, index) => (
            <div key={field.key}>
              {index > 0 && <div className="border-t border-border-light" />}
              <FieldRow
                field={field}
                isRemoving={removingFieldKey === field.key}
                onAdd={() => handleFieldClick(field)}
              />
            </div>
          ))}
        </>
      )}

      {/* Others section (universal optional fields, excluding custom_fields) */}
      {universalWithoutCustom.length > 0 && (
        <>
          <div
            className="px-3 py-1.5 text-xs font-bold text-ink-primary"
            style={{ backgroundColor: 'var(--color-bg-accent-light)', borderTop: '1px solid var(--color-border-light)' }}
          >
            {t('editor.others')}
          </div>
          {universalWithoutCustom.map((field, index) => (
            <div key={field.key}>
              {index > 0 && <div className="border-t border-border-light" />}
              <FieldRow
                field={field}
                isRemoving={removingFieldKey === field.key}
                onAdd={() => handleFieldClick(field)}
              />
            </div>
          ))}
        </>
      )}

      {/* custom_fields section (always at bottom) */}
      {customFieldDef && (
        <>
          <div
            className="px-3 py-1.5 text-xs font-bold text-ink-primary"
            style={{ backgroundColor: 'var(--color-bg-accent-light)', borderTop: '1px solid var(--color-border-light)' }}
          >
            {t('editor.customFields')}
          </div>
          <FieldRow
            field={customFieldDef}
            isRemoving={removingFieldKey === customFieldDef.key}
            onAdd={() => handleFieldClick(customFieldDef)}
          />
        </>
      )}

      {/* Collapse button */}
      <div className="border-t border-border-light">
        <button
          type="button"
          onClick={handleCollapse}
          className="w-full py-2 text-xs font-medium transition-colors text-ink-muted hover:text-ink-primary"
        >
          {t('editor.collapsePanel')}
        </button>
      </div>
    </div>
  );
}
