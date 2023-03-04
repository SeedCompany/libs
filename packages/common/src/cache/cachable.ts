import { CacheableMap } from './CachableMap';
import { cached } from './cached';

export interface Cacheable<K, V> {
  (key: K): V;
  cache: CacheableMap<K, V>;
}

/**
 * An alternative signature to {@see cached}.
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
): Cacheable<K, V> {
  const result = (key: K) => cached(map, key, calculate);
  result.cache = map;
  return result as Cacheable<K, V>;
}
