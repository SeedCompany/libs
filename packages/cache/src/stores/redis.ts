import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheStore, type CacheStoreItemOptions } from './store.interface.js';

@Injectable()
export class RedisStore extends CacheStore {
  constructor(private readonly redis: Redis.default) {
    super();
  }

  async get<T>(key: string, options: CacheStoreItemOptions) {
    const val = await this.redis.get(key);
    if (options.refreshTtlOnGet && options.ttl) {
      void this.redis.pexpire(key, options.ttl.toMillis());
    }
    if (val == null) {
      return undefined;
    }
    return JSON.parse(val) as T;
  }

  async remainingTtl(key: string) {
    const ttl = await this.redis.pttl(key);
    return ttl === -2 ? 0 : ttl === -1 ? Infinity : ttl;
  }

  async set<T>(key: string, value: T, options: CacheStoreItemOptions) {
    const encoded = JSON.stringify(value);
    if (options.ttl) {
      await this.redis.set(key, encoded, 'PX', options.ttl.toMillis());
    } else {
      await this.redis.set(key, encoded);
    }
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}
