/**
 * A helper to create readonly sets whose type is inferred from input item types.
 */
export const setOf = <const T>(items: Iterable<T>): ReadonlySet<T> =>
  new Set(items);
