/**
 * Ensure that the value is an record/object with string keys and existing
 * properties. Accepts empty objects and objects created with
 * `Object.create(null)`.
 */
export function isValidObject(
  value: unknown,
): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;

  if (Array.isArray(value)) return false;

  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Error
  ) {
    return false;
  }

  // Check if all keys are strings and all values are valid
  for (const key in value) {
    if (
      typeof key !== "string" ||
      !Object.prototype.hasOwnProperty.call(value, key)
    ) {
      return false;
    }
  }

  return true;
}
