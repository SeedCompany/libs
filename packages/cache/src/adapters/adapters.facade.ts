import { CacheService, type ItemOptions } from '../cache.service.js';
import { ApolloCacheAdapter } from './apollo.js';
import { CacheManagerAdapter } from './cache-manager.js';
import { KeyvAdapter } from './keyv.js';

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
