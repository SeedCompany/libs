import { Inject, Injectable, Type } from '@nestjs/common';
import { ContextId, ModuleRef } from '@nestjs/core';
import DataLoaderLib from 'dataloader';
import type { DataLoaderOptions } from './data-loader-options.type';
import { MODULE_OPTIONS_TOKEN } from './data-loader.module-builder';
import { DataLoaderStrategy } from './data-loader.strategy';
import { DataLoader } from './data-loader.type';

type Resolvable = 'cacheKeyFn' | 'name' | 'typeName' | 'createError';

export type ResolvedDataLoaderOptions<T, Key, CachedKey = Key> = Omit<
  DataLoaderOptions<T, Key, CachedKey>,
  Resolvable | 'propertyKey'
> &
  Required<Pick<DataLoaderOptions<T, Key, CachedKey>, Resolvable>> & {
    propertyKey: (obj: T) => Key;
  };

@Injectable()
export class DataLoaderFactory {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly defaultOptions: DataLoaderOptions<any, any, any>,
  ) {}

  async create<Item, Key, CachedKey = Key>(
    strategyType: Type<DataLoaderStrategy<Item, Key, CachedKey>>,
    contextId: ContextId,
  ): Promise<DataLoader<Item, Key, CachedKey>> {
    const strategy = await this.moduleRef.resolve<
      DataLoaderStrategy<Item, Key, CachedKey>
    >(strategyType, contextId, { strict: false });

    const options = this.resolveOptions(
      strategy.getOptions?.() ?? {},
      this.defaultOptions,
    );

    const loader = new DataLoaderLib<Key, Item, CachedKey>(
      this.makeBatchFn(strategy, options),
      options,
    ) as DataLoader<Item, Key, CachedKey>;

    this.addPrimeAll(loader, options);

    return loader;
  }

  protected resolveOptions<Item, Key, CacheKey>(
    options: DataLoaderOptions<Item, Key, CacheKey>,
    defaults: DataLoaderOptions<Item, Key, CacheKey>,
  ): ResolvedDataLoaderOptions<Item, Key, CacheKey> {
    const merged = { ...defaults, ...options };
    const { propertyKey } = merged;

    merged.name ??= this.constructor.name;
    merged.typeName ??= merged.name.replace(/(Loader|Strategy)$/, '');

    merged.propertyKey =
      typeof propertyKey === 'function'
        ? propertyKey
        : (obj: Item) =>
            obj[(propertyKey ?? 'id') as keyof Item] as unknown as Key;

    merged.cacheKeyFn ??= identity as (key: Key) => CacheKey;

    merged.createError ??= ({ cacheKey }) =>
      new Error(`Could not find ${merged.typeName!} (${String(cacheKey)})`);

    return merged as ResolvedDataLoaderOptions<Item, Key, CacheKey>;
  }

  protected makeBatchFn<Item, Key, CachedKey = Key>(
    strategy: DataLoaderStrategy<Item, Key, CachedKey>,
    options: ResolvedDataLoaderOptions<Item, Key, CachedKey>,
  ) {
    const { propertyKey: getKey, cacheKeyFn: getCacheKey } = options;

    const batchFn: DataLoaderLib.BatchLoadFn<Key, Item> = async (keys) => {
      const docs = await strategy.loadMany(keys);

      // Put documents (docs) into a map where key is a document's ID or some
      // property (prop) of a document and value is a document.
      const docsMap = new Map();
      for (const doc of docs) {
        if (
          doc &&
          typeof doc === 'object' &&
          'error' in doc &&
          doc.error instanceof Error
        ) {
          docsMap.set(getCacheKey(doc.key), doc.error);
        } else {
          docsMap.set(getCacheKey(getKey(doc as Item)), doc);
        }
      }

      return keys.map((key) => {
        const cacheKey = getCacheKey(key);
        return docsMap.get(cacheKey) || options.createError({ key, cacheKey });
      });
    };
    return batchFn;
  }

  protected addPrimeAll<Key, Item, CachedKey>(
    loader: DataLoader<Item, Key, CachedKey>,
    options: ResolvedDataLoaderOptions<Item, Key, CachedKey>,
  ) {
    loader.primeAll = (items) => {
      for (const item of items) {
        loader.prime(options.propertyKey(item), item);
      }
      return loader;
    };
  }
}

const identity = <T>(x: T) => x;
