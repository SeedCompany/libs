import { Duration } from 'luxon';
import type { ItemOptions } from './cache.service.js';
import type { CacheStoreItemOptions as StoreItemOptions } from './stores/store.interface.js';

export function resolveOptions(options: ItemOptions): StoreItemOptions {
  const { ttl: rawTtl, ...rest } = options;
  let ttl = rawTtl ? Duration.from(rawTtl) : undefined;
  const ttlMs = ttl?.toMillis();
  // Treat 0 as infinite
  ttl = ttlMs === 0 || ttlMs === Infinity ? undefined : ttl;
  return { ttl, ...rest };
}
