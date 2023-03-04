import { CacheableMap } from './CachableMap';

/**
 * A helper to retrieve a value from cache or run calculate function to store for next time.
 * This helps with expressiveness as the cache operations are basically the same every time.
 * @example
 * const userCache = new LRUCache();
 * const user = cached(userCache, id, () => fetchUser(id));
 */
export function cached<K, V>(
  map: CacheableMap<K, V>,
  key: K,
  calculate: (key: K) => V,
) {
  if (map.has(key)) {
    return map.get(key)!;
  }

  const result = calculate(key);
  map.set(key, result);
  return result;
}
