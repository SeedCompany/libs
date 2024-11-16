import { CacheStore, type CacheStoreItemOptions } from './store.interface.js';

export class ChainStore extends CacheStore {
  constructor(readonly stores: readonly CacheStore[]) {
    super();
  }

  async get<T>(key: string, options: CacheStoreItemOptions) {
    for (const store of this.stores) {
      const value = await store.get<T>(key, options);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  async set<T>(key: string, value: T, options: CacheStoreItemOptions) {
    await Promise.all(
      this.stores.map((store) => store.set(key, value, options)),
    );
  }

  async delete(key: string) {
    await Promise.all(this.stores.map((store) => store.delete(key)));
  }

  async remainingTtl(key: string) {
    const ttls = await Promise.all(
      this.stores.map((store) => store.remainingTtl(key)),
    );
    const cleaned = ttls.filter(isFinite);
    if (cleaned.length === 0) {
      return Infinity;
    }
    return Math.max(...cleaned);
  }
}
