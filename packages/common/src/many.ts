export type Many<T> = T | readonly T[];

export const many = <T>(item: Many<T>): readonly T[] =>
  Array.isArray(item) ? item : [item as T];

export const maybeMany = <T>(
  item: Many<T> | null | undefined,
): readonly T[] | undefined => (item != null ? many(item) : undefined);
