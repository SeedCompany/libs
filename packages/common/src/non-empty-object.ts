/**
 * A helper to convert an empty object to undefined.
 *
 * This is not recursive.
 */
export const asNonEmptyObject = <T extends object>(
  obj: T | undefined,
): T | undefined =>
  obj === undefined || Object.keys(obj).length === 0 ? undefined : (obj as any);
