import { type DurationIn } from '@seedcompany/common/temporal/luxon';
import type { Store as KeyvStore } from 'keyv';
import { CacheService, type ItemOptions } from '../cache.service.js';
import { resolveOptions } from '../resolve-options.js';

/**
 * A `keyv` store backed by our CacheService.
 */
export class KeyvAdapter<Value> implements KeyvStore<Value> {
  private readonly options: ItemOptions;
  constructor(private readonly cache: CacheService, options: ItemOptions = {}) {
    this.options = resolveOptions(options);
  }

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
