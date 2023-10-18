/**
 * Mark some properties of the given object as non-enumerable.
 */
export const nonEnumerable = <T>(
  obj: T,
  ...keys: Array<
    (keyof T & string) | 'constructor' | (string & Record<never, never>)
  >
) =>
  Object.defineProperties(
    obj,
    Object.fromEntries(keys.map((key) => [key, { enumerable: false }])),
  );
