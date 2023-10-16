import { entries } from './entries';

/**
 * An easier way to create an immutable map.
 *
 * Also, since this is a function, it can be passed without
 * having to create a function to call the constructor.
 */
export function mapOf<const K, const V>(
  entries: Iterable<readonly [key: K, value: V]>,
): ReadonlyMap<K, V>;
export function mapOf<const K extends string, const V>(
  entries: Partial<Record<K, V>>,
): ReadonlyMap<K, V>;
export function mapOf<K, V>(items?: any): ReadonlyMap<K, V> {
  return new Map(items ? entries(items) : undefined);
}
