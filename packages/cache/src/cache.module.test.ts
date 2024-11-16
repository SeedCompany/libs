import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { CacheModule } from './cache.module.js';
import { CacheService } from './cache.service.js';
import { LruStore } from './stores/lru.js';

describe('CacheModule', () => {
  it('should be creatable with register()', async () => {
    const module = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          store: new LruStore(),
        }),
      ],
    }).compile();
    const app = module.createNestApplication();
    await app.init();

    const cache = app.get(CacheService);
    expect(cache).toBeInstanceOf(CacheService);

    await cache.set('foo', 'bar');
    expect(await cache.get('foo')).toBe('bar');

    await app.close();
  });
});
