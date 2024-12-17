import type { NonEmptyArray } from './types.js';

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
    let prev: readonly V[] | undefined = map.get(groupKey);
    prev = prev ? prev : [];
    map.set(
      groupKey,
      // @ts-expect-error this is what makes it non-empty
      [...prev, item],
    );
    return map;
  }, new Map<K, NonEmptyArray<V>>());
