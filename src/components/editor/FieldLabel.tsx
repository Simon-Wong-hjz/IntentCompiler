import type { InputType } from '@/registry/types';
import { keyToLabelZh } from '@/lib/format';

const OPERATION_HINTS: Record<InputType, string> = {
  textarea: '自由输入文本',
  text: '自由输入文本',
  combo: '选择或自定义输入',
  list: '添加列表项',
  toggle: '开关切换',
  number: '点击 +/− 或输入数字',
  'key-value': '添加键值对',
};

interface FieldLabelProps {
  fieldKey: string;
  inputType: InputType;
}

export function FieldLabel({ fieldKey, inputType }: FieldLabelProps) {
  const hint = OPERATION_HINTS[inputType];
  const displayName = keyToLabelZh(fieldKey);

  return (
    <div className="flex items-center gap-1 mb-2">
      <span className="text-sm font-bold text-ink-primary">
        {displayName}
      </span>
      <span
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold flex-shrink-0 border border-ink-hint text-ink-muted -translate-y-1 hover:border-accent-primary hover:text-accent-primary transition-colors cursor-help"
        aria-label={`${displayName}帮助`}
      >
        ?
      </span>
      <span className="text-xs ml-1 text-ink-hint">
        {hint}
      </span>
    </div>
  );
}
