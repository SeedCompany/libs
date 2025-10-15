import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { EventTargetTransport } from './event-target.transport.js';

/**
 * An EventTarget-based broadcaster transport that is aware of redis,
 * so it can help connect the redis connection to nestjs lifecycle.
 */
export class RedisEventTargetTransport
  extends EventTargetTransport
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly sub: Redis;
  constructor(protected readonly pub: Redis) {
    const sub = pub.duplicate({ lazyConnect: true });
    const eventTarget = createRedisEventTarget({
      publishClient: pub,
      subscribeClient: sub,
    });
    super(eventTarget);
    this.sub = sub;
  }

  async onModuleInit() {
    await Promise.all([this.pub.connect(), this.sub.connect()]);
  }
  async onModuleDestroy() {
    await this.sub.quit();
  }
}
