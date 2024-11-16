import { Injectable } from '@nestjs/common';
import type Keyv from 'keyv';
import { CacheStore, type CacheStoreItemOptions } from './store.interface.js';

@Injectable()
export class KeyvStore extends CacheStore {
  constructor(private readonly keyv: Keyv) {
    super();
  }

  async get<T>(key: string, options: CacheStoreItemOptions) {
    const val = (await this.keyv.get(key)) as T | undefined;
    if (options.refreshTtlOnGet && options.ttl) {
      void this.keyv.set(key, val, options.ttl.toMillis());
    }
    return val;
  }

  async remainingTtl(_key: string) {
    return Infinity;
  }

  async set<T>(key: string, value: T, options: CacheStoreItemOptions) {
    await this.keyv.set(key, value, options.ttl?.toMillis());
  }

  async delete(key: string) {
    await this.keyv.delete(key);
  }
}
