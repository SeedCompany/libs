import { Inject, Injectable, type Type } from '@nestjs/common';
import { type ContextId, ModuleRef } from '@nestjs/core';
import DataLoaderLib from 'dataloader';
import type { DataLoaderOptions } from './data-loader-options.type.js';
import type { LoaderContextType } from './data-loader.context.js';
import { MODULE_OPTIONS_TOKEN } from './data-loader.module-builder.js';
import type { DataLoaderStrategy } from './data-loader.strategy.js';
import type { DataLoader } from './data-loader.type.js';

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
    loaderContext: LoaderContextType,
  ): Promise<DataLoader<Item, Key, CachedKey>> {
    const strategy = await this.moduleRef.resolve<
      DataLoaderStrategy<Item, Key, CachedKey>
    >(strategyType, contextId, { strict: false });

    const options = this.resolveOptions(strategy, this.defaultOptions);

    const loader = new DataLoaderLib<Key, Item, CachedKey>(
      this.makeBatchFn(strategy, options, loaderContext),
      options,
    ) as DataLoader<Item, Key, CachedKey>;

    this.addPrimeAll(loader, options);

    return loader;
  }

  protected resolveOptions<Item, Key, CacheKey>(
    strategy: DataLoaderStrategy<Item, Key, CacheKey>,
    defaults: DataLoaderOptions<Item, Key, CacheKey>,
  ): ResolvedDataLoaderOptions<Item, Key, CacheKey> {
    const merged = { ...defaults, ...(strategy.getOptions?.() ?? {}) };

    const { propertyKey } = merged;

    merged.name ??= strategy.constructor.name;
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
    loaderContext: LoaderContextType,
  ) {
    const { propertyKey: getKey, cacheKeyFn: getCacheKey } = options;

    const batchFn: DataLoaderLib.BatchLoadFn<Key, Item> = async (keys) => {
      const docs = await strategy.loadMany(keys, loaderContext);

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
        return (
          docsMap.get(cacheKey) ||
          options.createError({ key, cacheKey, typeName: options.typeName })
        );
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
