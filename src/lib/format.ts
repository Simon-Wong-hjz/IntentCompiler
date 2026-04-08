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
  // Universal fields
  intent: '意图',
  context: '背景',
  requirements: '需求',
  constraints: '约束',
  output_format: '输出格式',
  goal: '目标',
  role: '角色',
  audience: '受众',
  assumptions: '假设',
  scope: '范围',
  priority: '优先级',
  output_language: '输出语言',
  detail_level: '详细程度',
  tone: '语气',
  thinking_style: '思维方式',
  examples: '示例',
  anti_examples: '反面示例',
  references: '参考资料',
  custom_fields: '自定义项目',
  // Ask fields
  question_type: '问题类型',
  knowledge_level: '已有知识水平',
  // Create fields
  content_type: '内容类型',
  key_points: '关键要点',
  tech_stack: '技术栈',
  target_length: '目标长度',
  structure: '结构',
  include_tests: '包含测试',
  // Transform fields
  source_content: '源内容',
  transform_type: '转化类型',
  preserve: '保留项',
  // Analyze fields
  subject: '分析对象',
  analyze_type: '分析类型',
  criteria: '评估标准',
  compared_subjects: '比较对象',
  benchmark: '基准',
  // Ideate fields
  problem: '问题',
  current_state: '现状',
  idea_count: '想法数量',
  evaluation_criteria: '评估标准',
  tradeoff_preference: '权衡偏好',
  // Execute fields
  plan: '执行计划',
  tools_to_use: '使用工具',
  checkpoints: '检查点',
  error_handling: '错误处理',
  success_criteria: '成功标准',
};

/**
 * Get Chinese label for a field key, falling back to keyToLabel() for unknown keys.
 */
export function keyToLabelZh(key: string): string {
  return FIELD_LABELS_ZH[key] ?? keyToLabel(key);
}
