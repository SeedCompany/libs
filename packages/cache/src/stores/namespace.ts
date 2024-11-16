import { CacheStore, type CacheStoreItemOptions } from './store.interface.js';

export class NamespaceStore extends CacheStore {
  constructor(readonly store: CacheStore, readonly namespace: string) {
    super();
  }

  get<T>(key: string, options: CacheStoreItemOptions) {
    return this.store.get<T>(this.namespace + key, options);
  }
  async set<T>(key: string, value: T, options: CacheStoreItemOptions) {
    await this.store.set(this.namespace + key, value, options);
  }
  async delete(key: string) {
    await this.store.delete(this.namespace + key);
  }
  async remainingTtl(key: string) {
    return await this.store.remainingTtl(this.namespace + key);
  }
}
