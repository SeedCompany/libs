/**
 * A helper to create readonly sets whose type is inferred from input item types.
 */
export const setOf = <T>(items: Iterable<T>): ReadonlySet<T> => new Set(items);
