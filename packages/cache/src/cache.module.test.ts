import { describe, expect, it } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { CacheModule } from './cache.module';
import { CacheService } from './cache.service';
import { LruStore } from './stores/lru';

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
