import type { PartialDeep } from 'type-fest';

/**
 * Typecast the object to {@link PartialDeep}, without having to explicitly specify the type.
 *
 * This can be useful when you know that the type is partially defined.
 * Like, for example, when using {@link pickDeep} but the path list elements
 * are conditionally present, despite being typed as always present.
 */
export const asPartialDeep = <T extends object>(obj: T) =>
  obj as PartialDeep<T>;
