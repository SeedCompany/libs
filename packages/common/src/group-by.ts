import { asNonEmptyArray, type NonEmptyArray } from './non-empty-array.js';

/**
 * Groups the list/iterable of items based on the `by` function given.
 * Returns an array of item groups.
 */
export const groupBy = <V>(
  items: Iterable<V>,
  by: (item: V) => unknown,
): ReadonlyArray<NonEmptyArray<V>> => [...groupToMapBy(items, by).values()];

/**
 * Groups the list/iterable of items based on the `by` function given.
 * Returns a Map keyed by the keys determined from the `by` function,
 * with the values being arrays of items that match that key.
 */
export const groupToMapBy = <K, V>(
  items: Iterable<V>,
  by: (item: V) => K,
): ReadonlyMap<K, NonEmptyArray<V>> =>
  [...items].reduce((map, item) => {
    const groupKey = by(item);
    const prev: readonly V[] | undefined = map.get(groupKey) ?? [];
    map.set(groupKey, asNonEmptyArray([...prev, item])!);
    return map;
  }, new Map<K, NonEmptyArray<V>>());
