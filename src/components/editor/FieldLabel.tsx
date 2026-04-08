import type { InputType } from '@/registry/types';
import { keyToLabelZh } from '@/lib/format';

const OPERATION_HINTS: Record<InputType, string> = {
  textarea: '自由输入文本',
  text: '自由输入文本',
  select: '点击选择一项',
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
    <div className="flex items-center gap-1 mb-1.5">
      <span className="text-xs uppercase font-semibold tracking-wide text-ink-muted">
        {displayName}
      </span>
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium flex-shrink-0 bg-bg-page text-ink-muted"
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
