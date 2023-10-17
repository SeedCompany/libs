export type Falsy = false | null | undefined | 0 | '' | 0n | typeof NaN;

/**
 * A type guard for Boolean(x)
 * Correctly narrows the type to be the truthy subset of the input.
 * Crazy how TS can't do this yet.
 *
 * @example
 * .filter(isNotFalsy)
 */
export const isNotFalsy = <T>(item: T): item is Exclude<T, Falsy> =>
  Boolean(item);

/**
 * A type guard for a null check
 * Correctly narrows the type to be the non-nullable subset of the input.
 * Crazy how TS can't do this yet.
 *
 * @example
 * .filter(isNotNil)
 */
export const isNotNil = <T>(item: T): item is T & {} => item != null;
