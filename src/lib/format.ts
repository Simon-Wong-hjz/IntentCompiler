/**
 * Convert a snake_case key to a Title Case label.
 * e.g. "output_format" -> "Output Format"
 */
export function keyToLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const FIELD_LABELS_ZH: Record<string, string> = {
  intent: '意图',
  context: '背景',
  requirements: '需求',
  constraints: '约束',
  output_format: '输出格式',
  question_type: '问题类型',
  audience: '受众',
};

/**
 * Get Chinese label for a field key, falling back to keyToLabel() for unknown keys.
 */
export function keyToLabelZh(key: string): string {
  return FIELD_LABELS_ZH[key] ?? keyToLabel(key);
}
