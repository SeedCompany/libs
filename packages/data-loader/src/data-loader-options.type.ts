import DataLoaderLib from 'dataloader';
import { DataLoaderStrategy } from './data-loader.strategy';

export interface DataLoaderOptions<T, Key, CachedKey = Key>
  extends DataLoaderLib.Options<Key, T, CachedKey> {
  /**
   * How should the object be identified?
   * A function to do so or a property key. Defaults to `id`
   */
  propertyKey?: keyof T | ((obj: T) => Key);

  /**
   * How to describe the object in errors.
   * Defaults to the class name minus loader suffix
   */
  typeName?: string;

  createError?: ({ key, cacheKey }: { key: Key; cacheKey: CachedKey }) => Error;
}

/**
 * Shortcut to reference options of class name instead of having to duplicate
 * these generic values.
 */
export type DataLoaderOptionsOf<Strategy> = Strategy extends DataLoaderStrategy<
  infer T,
  infer Key,
  infer CachedKey
>
  ? DataLoaderOptions<T, Key, CachedKey>
  : never;
