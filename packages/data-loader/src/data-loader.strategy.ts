/* eslint-disable @typescript-eslint/method-signature-style */
import { DataLoaderOptions } from './data-loader-options.type';

export interface DataLoaderStrategy<Item, Key, CachedKey = Key> {
  loadMany(
    keys: readonly Key[],
  ): Promise<ReadonlyArray<Item | { key: Key; error: Error }>>;

  getOptions?: () => DataLoaderOptions<Item, Key, CachedKey>;
}
