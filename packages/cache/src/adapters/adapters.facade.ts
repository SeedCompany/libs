import { CacheService, type ItemOptions } from '../cache.service.js';
import { ApolloCacheAdapter } from './apollo.js';
import { KeyvAdapter } from './keyv.js';

/**
 * A helper class to adapt our CacheService to other cache shapes.
 */
export class CacheAdapters {
  constructor(private readonly cache: CacheService) {}

  apollo(options: ItemOptions = {}) {
    return new ApolloCacheAdapter(this.cache, options);
  }

  keyv(options: ItemOptions = {}) {
    return new KeyvAdapter(this.cache, options);
  }
}
