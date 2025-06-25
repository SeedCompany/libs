/**
 * Sometimes this shortcut is just easier
 */
export const uniq = <T>(items: Iterable<T>): readonly T[] => [
  ...new Set(items),
];
