# Yet another cache library for NestJS

This is for data that will be shared across multiple processes.
Thus, the keys are strings and the values are serializable.

The goals of this library are:
- Provide a nice interface for usage in Nestjs classes
- Integrate easily with the existing Nestjs ecosystem
- Leverage existing npm ecosystem for storage implementations

# Setup

Import the module in your app.
```ts
CacheModule.registerAsync({
  inject: [/* config */],
  useFactory: (/* config */): CacheModuleOptions => ({
    store: // create store implementation from config
  }),
})
```

# Usage

## Decorators

```ts
@Injectable()
class Service {

  @Cache({
    key: 'foo-bar',
    ttl: { minutes: 5 },
  })
  async fooBar() {
    // ...
  }

}
```

However, you will probably need to cache based on the args given, so:
```ts
@Injectable()
class Service {

  @Cache((id: string, year: number) => ({
    key: `foo-bar:${id}-${year}`,
    ttl: { minutes: 5 },
  }))
  async fooBar(id: string, year: number) {
    // ...
  }

}
```

## Service

The task you always most always want to do is skip expensive calculation if possible.
So the most useful method is `getOrCalculate`, which saves you the boilerplate for this logic.

```ts
declare const cache: CacheService; // injected somewhere

const result = await cache.getOrCalculate({
  key: `fooBar:${id}`,
  calculate: async () => {
    // do expensive calculation
  },
  ttl: { hour: 1 },
});
```

Naive functionality exists as well:
```ts
await cache.get('foo');
await cache.set('foo', 'bar');
await cache.delete('foo');
```

## Namespaces

A common use case is to namespace your cache keys, to help segment your cache store.
There's a `namespace` method which returns a modified cache service with the given prefix.
```ts
const usersCache = cache.namespace('users:');
```
Note that chaining these will stack the prefixes, not override them.
```ts
cache.namespace('foo:').namespace('bar:').get('baz'); // foo:bar:baz
```

## CacheItem

A wrapper is provided around a single cache keys as well.
This could help prevent having to store another variable for a computed key, or allow it to be passed around.
```ts
const cached = cache.item('1234');
const value = cached.getOrCalculate(async () => {
  // do expensive calculation
});
handleInvalidation(cached);
function handleInvalidation(cached: CacheItem) {
  if (isStale) {
    cached.delete();
  }
}
```

# Stores

Stores are the actual storage implementations the `CacheService` is backed by.

We provide stores for `ioredis`, `keyv`, `lru-cache`.
This should cover most use cases, but you can also implement your own.

## LRU / In Memory
```ts
import { LruStore } from '@seedcompany/cache/store/lru';

CacheModule.register({
  store: new LruStore({
    // options
  })
})
```

## Redis
```ts
import { RedisStore } from '@seedcompany/cache/store/redis';
import Redis from 'ioredis';

CacheModule.register({
  store: new RedisStore(
    new Redis('redis://localhost:6379')
  )
})
```

## Keyv
```ts
import { KeyvStore } from '@seedcompany/cache/store/keyv';
import Keyv from 'keyv';

CacheModule.register({
  store: new KeyvStore(
    new Keyv()
  )
})
```

## Chaining Multiple Stores

Multiple stores can be chained together with the `ChainStore`.
This could provide faster in memory cache falling back to a shared network cache.

```ts
import { ChainStore } from '@seedcompany/cache/store/chain';

CacheModule.register({
  store: new ChainStore([
    new LruStore({ max: 100 }),
    new RedisStore(),
  ])
})
```

# Adapters

We provide a few adapters to help integrate with other libraries.

## NestJS Cache Manager

Here's how to set up the NestJS Cache Manager module to be based on this one.

```ts
import { CacheModule as NestHttpCacheModule } from '@nestjs/cache-manager';
import { CacheModule, CacheService } from '@seedcompany/cache';

NestHttpCacheModule.registerAsync({
  imports: [CacheModule],
  inject: [CacheService],
  useFactory: (cache: CacheService): CacheModuleOptions => ({
    stores: [
      new Keyv({
        store: cache.namespace('http:').adaptTo.keyv()
      })
    ]
  })
});
```
Continue on with the NestJS docs:
https://docs.nestjs.com/techniques/caching#interacting-with-the-cache-store

## Apollo Cache

Here's how to set up the Apollo cache to be based on this one.

```ts
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [CacheModule],
  inject: [CacheService],
  useFactory: (cache: CacheService) => ({
    cache: cache.namespace('apollo:').adaptTo.apollo(),
  }),
});
```

## Keyv Cache

Keyv cache is a very popular cache library.
Here's how to adapt our cache to its interface.

```ts
declare const cache: CacheService;

const kv = new Keyv({
  store: cache.adaptTo.keyv(),
});
```
