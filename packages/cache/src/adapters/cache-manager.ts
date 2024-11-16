import type {
  CacheStoreSetOptions,
  CacheStore as NestCacheStore,
} from '@nestjs/cache-manager';
import { type DurationIn } from '@seedcompany/common/temporal/luxon';
import type { Store as CacheManagerStore } from 'cache-manager';
import { CacheService, type ItemOptions } from '../cache.service.js';
import { resolveOptions } from '../resolve-options.js';

// noinspection SpellCheckingInspection

/**
 * A store for `cache-manager` which is also what `@nestjs/common` uses.
 */
export class CacheManagerAdapter implements CacheManagerStore, NestCacheStore {
  private readonly options: ItemOptions;
  constructor(private readonly cache: CacheService, options: ItemOptions = {}) {
    this.options = resolveOptions(options);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cache.get<T>(key, {
      refreshTtlOnGet: this.options.refreshTtlOnGet,
    });
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheStoreSetOptions<T> | number,
  ) {
    const { ttl: ttlIn } =
      typeof options === 'number' ? { ttl: options } : options ?? {};
    const ttl =
      ttlIn == null
        ? this.options.ttl
        : typeof ttlIn === 'number'
        ? ttlIn
        : ttlIn(value);
    await this.cache.set(key, value, { ttl });
  }

  async del(key: string) {
    await this.cache.delete(key);
  }

  async ttl(key: string) {
    const remaining = await this.cache.remainingTtl(key);
    return remaining.toMillis();
  }

  async reset() {
    // nope
  }

  async keys() {
    return [];
  }

  async mdel(...keys: string[]) {
    await Promise.all(keys.map((key) => this.cache.delete(key)));
  }

  async mget(...keys: string[]) {
    return await Promise.all(keys.map((key) => this.cache.get(key)));
  }

  async mset(pairs: Array<[string, unknown]>, ttl?: DurationIn) {
    ttl ??= this.options.ttl;
    await Promise.all(
      pairs.map(([key, value]) => this.cache.set(key, value, { ttl })),
    );
  }
}
