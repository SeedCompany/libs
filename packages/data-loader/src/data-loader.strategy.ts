/* eslint-disable @typescript-eslint/method-signature-style */
import { DataLoaderOptions } from './data-loader-options.type';
import { LoaderContextType } from './data-loader.context';

export interface DataLoaderStrategy<Item, Key, CachedKey = Key> {
  loadMany(
    keys: readonly Key[],
    loaderContext: LoaderContextType,
  ): Promise<ReadonlyArray<Item | { key: Key; error: Error }>>;

  getOptions?: () => DataLoaderOptions<Item, Key, CachedKey>;
}
