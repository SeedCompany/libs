import { type DurationIn } from '@seedcompany/common/temporal/luxon';
import type { KeyvStoreAdapter as KeyvStore } from 'keyv';
import { CacheService, type ItemOptions } from '../cache.service.js';
import { resolveOptions } from '../resolve-options.js';

/**
 * A `keyv` store backed by our CacheService.
 */
export class KeyvAdapter implements KeyvStore {
  private readonly options: ItemOptions;
  constructor(private readonly cache: CacheService, options: ItemOptions = {}) {
    this.options = resolveOptions(options);
  }

  async get<Value>(key: string): Promise<Value | undefined> {
    return await this.cache.get(key, this.options);
  }

  async set(key: string, value: unknown, ttl?: DurationIn) {
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

  opts = undefined;

  // Fake EventEmitter.on.
  // Keyv just forwards the errors from here, so it is not necessary.
  // Runtime even checks if this function exists before calling it, but TS still says it is required.
  on() {
    return this;
  }
}
