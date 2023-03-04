/* eslint-disable @typescript-eslint/method-signature-style */

/**
 * Any kind of map, Map, WeakMap, LRUCache, etc.
 */
export interface CacheableMap<K, V> {
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): unknown;
}
