import { useState, useRef } from 'react';
import { keyToLabelZh } from '@/lib/format';
import type { FieldDefinition } from '@/registry/types';

/** Animation duration for the row slide-up removal (ms). */
const ROW_REMOVE_DURATION = 200;

/** Chinese descriptions for each optional field, shown in the add panel. */
const FIELD_DESCRIPTIONS: Record<string, string> = {
  // Task-specific fields
  tech_stack: '语言、框架、库（代码场景）',
  target_length: '预期长度或规模',
  structure: '预期结构或大纲',
  include_tests: '是否包含测试（代码场景）',
  preserve: '必须保留的信息或特征',
  compared_subjects: '比较对象（支持多项）',
  benchmark: '参考标准或基准线',
  idea_count: '生成多少个想法或方案',
  evaluation_criteria: '如何评判想法的质量',
  tradeoff_preference: '权衡偏好（如速度 vs 质量）',
  tools_to_use: '执行中必须使用的工具',
  checkpoints: '需要暂停确认的节点',
  error_handling: '出错时的处理策略',
  success_criteria: '如何判定任务完成',
  knowledge_level: '用户对该主题的已有知识水平',
  // Universal optional fields
  goal: '期望的最终状态或结果',
  role: 'AI 应扮演的角色',
  audience: '输出的目标受众',
  assumptions: 'AI 应视为既定的前提',
  scope: '覆盖范围的边界',
  priority: '取舍时最看重什么',
  output_language: 'AI 应使用的回复语言',
  detail_level: '概要 / 标准 / 深入',
  tone: '正式 / 随意 / 技术性',
  thinking_style: '直接回答 / 逐步分析 / 利弊对比',
  examples: '参考示例',
  anti_examples: '反面示例（不想要什么）',
  references: '特定来源或材料',
  custom_fields: '用户自定义键值对',
};

interface AddFieldPanelProps {
  taskOptionalFields: FieldDefinition[];
  universalOptionalFields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
}

function FieldRow({
  field,
  onAdd,
  isRemoving,
}: {
  field: FieldDefinition;
  onAdd: () => void;
  isRemoving: boolean;
}) {
  const displayName = keyToLabelZh(field.key);
  const description = FIELD_DESCRIPTIONS[field.key] ?? '';

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
          aria-label={`添加字段 ${displayName}`}
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
        + 添加字段
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
            ★ 推荐
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
            其他
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
            自定义字段
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
          − 收起
        </button>
      </div>
    </div>
  );
}
