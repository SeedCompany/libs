import { Duration } from 'luxon';
import { ItemOptions } from './cache.service';
import { CacheStoreItemOptions as StoreItemOptions } from './stores';

export function resolveOptions(options: ItemOptions): StoreItemOptions {
  const { ttl: rawTtl, ...rest } = options;
  let ttl = rawTtl ? Duration.from(rawTtl) : undefined;
  const ttlMs = ttl?.toMillis();
  // Treat 0 as infinite
  ttl = ttlMs === 0 || ttlMs === Infinity ? undefined : ttl;
  return { ttl, ...rest };
}
