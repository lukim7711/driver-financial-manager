/**
 * Generate a unique ID with a prefix.
 * Example: generateId('debt') → "debt-1707890400000-a3x9k"
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}
