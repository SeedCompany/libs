import { type CacheableMap } from './CachableMap.js';
import { cached } from './cached.js';

export interface Cacheable<K, V> {
  (key: K): V;
  cache: CacheableMap<K, V>;
}

/**
 * An alternative signature to {@link cached}.
 * @example
 * const getUser = cacheable(new LRUCache(), (id) => fetchUser(id));
 * const user = await getUser('123');
 * @example
 * const getInfoFromSession = cacheable(new WeakMap(), (session) => {
 *   return {}; // info calculated only once per session object
 * });
 * const info = getInfoFromSession(session);
 */
export function cacheable<K, V>(
  map: CacheableMap<K, V>,
  calculate: (key: K) => V,
): Cacheable<K, V>;
/**
 * An alternative signature to {@link cached}.
 *
 * This correctly infers the function signature instead of the map interfering with it.
 *
 * @example
 * const getUser = cacheable((id) => fetchUser(id))(new LRUCache());
 */
export function cacheable<K, V>(
  calculate: (key: K) => V,
): (map: CacheableMap<K, V>) => Cacheable<K, V>;
export function cacheable<K, V>(
  map: CacheableMap<K, V> | ((key: K) => V),
  calculate?: (key: K) => V,
) {
  if (typeof map === 'function') {
    return (map2: CacheableMap<K, V>) => cacheable(map2, map);
  }
  const result = (key: K) => cached(map, key, calculate!);
  result.cache = map;
  return result as Cacheable<K, V>;
}
