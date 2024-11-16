/* eslint-disable @typescript-eslint/method-signature-style */
import type { DataLoaderOptions } from './data-loader-options.type.js';
import type { LoaderContextType } from './data-loader.context.js';

export interface DataLoaderStrategy<Item, Key, CachedKey = Key> {
  loadMany(
    keys: readonly Key[],
    loaderContext: LoaderContextType,
  ): Promise<ReadonlyArray<Item | { key: Key; error: Error }>>;

  getOptions?: () => DataLoaderOptions<Item, Key, CachedKey>;
}
