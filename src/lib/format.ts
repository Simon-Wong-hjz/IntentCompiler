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
