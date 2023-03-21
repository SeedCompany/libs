import { CacheService, ItemOptions } from '../cache.service';
import { ApolloCacheAdapter } from './apollo';
import { CacheManagerAdapter } from './cache-manager';
import { KeyvAdapter } from './keyv';

/**
 * A helper class to adapt our CacheService to other cache shapes.
 */
export class CacheAdapters {
  constructor(private readonly cache: CacheService) {}

  apollo(options: ItemOptions = {}) {
    return new ApolloCacheAdapter(this.cache, options);
  }

  cacheManager(options: ItemOptions = {}) {
    return new CacheManagerAdapter(this.cache, options);
  }

  keyv<Value>(options: ItemOptions = {}) {
    return new KeyvAdapter<Value>(this.cache, options);
  }
}
