import DataLoaderLib from 'dataloader';
import type { DataLoaderStrategy } from './data-loader.strategy.js';

/**
 * An actual DataLoader at runtime.
 */
export type DataLoader<Result, Key, CachedKey = Key> = DataLoaderLib<
  Key,
  Result,
  CachedKey
> & {
  /**
   * Shortcut for {@link prime}.
   */
  primeAll: (items: readonly Result[]) => DataLoader<Result, Key, CachedKey>;
};

/**
 * An actual DataLoader for the given loader factory
 */
export type LoaderOf<Factory> = Factory extends DataLoaderStrategy<
  infer T,
  infer Key,
  infer CachedKey
>
  ? DataLoader<T, Key, CachedKey>
  : never;
