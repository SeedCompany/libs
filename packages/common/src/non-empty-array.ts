export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

/**
 * TS can't narrow the length check to the non-empty type.
 * This does that, safely, preventing the need to typecast at call site.
 */
export const asNonEmptyArray = <T>(
  arr: readonly T[],
): NonEmptyArray<T> | undefined =>
  arr.length === 0 ? undefined : (arr as unknown as NonEmptyArray<T>);
