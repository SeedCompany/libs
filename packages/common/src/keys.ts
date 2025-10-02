import { entries } from './entries.js';

/**
 * Returns an array of keys for the given mapping.
 *
 * This is mainly for Records, where we can't use {@link Object.keys} with strict keys.
 * But this also accepts an {@link Iterable}, so it works with Maps or an array of entries.
 */
export function keys<K>(
  map: Iterable<readonly [key: K, value: any]>,
): readonly K[];
export function keys<T extends object>(
  object: T,
): ReadonlyArray<keyof T & string>;
export function keys<K>(o: any): readonly K[] {
  return entries<K, unknown>(o).map(([key]) => key);
}
