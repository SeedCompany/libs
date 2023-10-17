import { isNotFalsy } from './is-not-falsy';

/**
 * Converts a (simple) CSV string into a cleaned list.
 *
 * Note that this generic is an unsafe type cast.
 *
 * @example
 * csv('red ,   blue,green,,white')
 * // => ['red', 'blue', 'green', 'white']
 */
export const csv = <T extends string>(list: string) => cleanSplit<T>(list, ',');

/**
 * Cleanly split a string by a separator.
 *
 * Note that this generic is an unsafe type cast.
 *
 * @example
 * csv('red ,   blue,green,,white')
 * // => ['red', 'blue', 'green', 'white']
 */
export const cleanSplit = <T extends string>(
  list: string,
  separator: string | RegExp,
): readonly T[] =>
  list
    .split(separator)
    .map((i) => i.trim() as T)
    .filter(isNotFalsy);
