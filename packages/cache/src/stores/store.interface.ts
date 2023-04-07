import { Duration } from 'luxon';

export abstract class CacheStore {
  abstract get<T>(
    key: string,
    options: CacheStoreItemOptions,
  ): Promise<T | undefined>;
  abstract set<T>(
    key: string,
    value: T,
    options: CacheStoreItemOptions,
  ): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract remainingTtl(key: string): Promise<Milliseconds>;
}

type Milliseconds = number;

export interface CacheStoreItemOptions {
  /**
   * Time to live - duration that an item is cached before it is deleted.
   */
  ttl?: Duration;

  /** Refresh TTL on cache hit, so that the item stays fresh longer */
  refreshTtlOnGet?: boolean;
}
