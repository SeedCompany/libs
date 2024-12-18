import { LRUCache } from 'lru-cache';
import { CacheStore, type CacheStoreItemOptions } from './store.interface.js';

export class LruStore extends CacheStore {
  private readonly cache: LRUCache<string, any>;

  constructor(options?: LRUCache.Options<string, any, unknown>) {
    super();
    this.cache = new LRUCache({
      sizeCalculation,
      maxSize: 2 ** 20 * 30,
      ...options,
    });
  }

  async get<T>(
    key: string,
    options: CacheStoreItemOptions,
  ): Promise<T | undefined> {
    return this.cache.get(key, {
      updateAgeOnGet: options.refreshTtlOnGet,
    }) as T | undefined;
  }

  async remainingTtl(key: string): Promise<number> {
    return this.cache.getRemainingTTL(key);
  }

  async set<T>(key: string, value: T, options: CacheStoreItemOptions) {
    this.cache.set(key, value, {
      ttl: options.ttl?.toMillis(),
    });
  }

  async delete(key: string) {
    this.cache.delete(key);
  }
}

const sizeCalculation = (item: unknown) => {
  if (typeof item === 'string') {
    return item.length;
  }
  if (typeof item === 'object') {
    return Buffer.byteLength(JSON.stringify(item), 'utf8');
  }
  return 1;
};
