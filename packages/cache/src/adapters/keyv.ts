import { DurationIn } from '@seedcompany/common/temporal/luxon';
import type { Store as KeyvStore } from 'keyv';
import { CacheService, ItemOptions } from '../cache.service';

/**
 * A `keyv` store backed by our CacheService.
 */
export class KeyvAdapter<Value> implements KeyvStore<Value> {
  constructor(
    private readonly cache: CacheService,
    private readonly options: ItemOptions = {},
  ) {}

  async get(key: string): Promise<Value | undefined> {
    return await this.cache.get(key, this.options);
  }

  async set(key: string, value: Value, ttl?: DurationIn) {
    ttl ??= this.options.ttl;
    await this.cache.set(key, value, { ttl });
  }

  async delete(key: string) {
    await this.cache.delete(key);
    return true;
  }

  async clear() {
    // nope
  }
}
