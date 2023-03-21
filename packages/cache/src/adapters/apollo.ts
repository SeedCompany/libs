import type {
  KeyValueCache,
  KeyValueCacheSetOptions,
} from '@apollo/utils.keyvaluecache';
import { CacheService, ItemOptions } from '../cache.service';

/**
 * A drop-in adapter for Apollo Server's cache to use our CacheService.
 */
export class ApolloCacheAdapter implements KeyValueCache {
  constructor(
    private readonly cache: CacheService,
    private readonly options: ItemOptions = {},
  ) {}

  async get(key: string): Promise<string | undefined> {
    return await this.cache.get(key, this.options);
  }

  async set(key: string, value: string, options?: KeyValueCacheSetOptions) {
    await this.cache.set(key, value, {
      ttl: options?.ttl != null ? { seconds: options.ttl } : this.options.ttl,
    });
  }

  async delete(key: string) {
    await this.cache.delete(key);
  }
}
