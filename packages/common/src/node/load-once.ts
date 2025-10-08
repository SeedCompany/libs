import type { ValOrFn } from '../types.js';

export interface LoadOnceStorage<T> {
  read: () => Promise<T | undefined>;
  write: (data: T) => Promise<void>;
}

export interface LoadOnceParams<T extends {}> {
  load: () => Promise<T>;
  /**
   * The storage or a function returning the storage.
   * A function is useful as it allows the calc function to declare/infer the
   * shape and have the storage follow it.
   */
  storage: NoInfer<ValOrFn<LoadOnceStorage<T>>>;
}

/**
 * A helper to retrieve a cached value or calculate it & save it.
 *
 * @example
 * ```ts
 * const data = await loadOnce({
 *   load: () => fetch('https://example.com/data.json').then(res => res.json()),
 *   storage: FileHandle.Json.at('./example-data'),
 * });
 * ```
 *
 * @example
 * ```ts
 * const data = await loadOnce(async () => {
 *  const res = await fetch('https://example.com/data.json');
 *  return await res.json();
 * })({ storage: FileHandle.Json.at('./example-data') });
 * ```
 */
export function loadOnce<T extends {}>(
  load: LoadOnceParams<T>['load'],
): (params: Omit<LoadOnceParams<T>, 'load'>) => Promise<T>;
export function loadOnce<T extends {}>(params: LoadOnceParams<T>): Promise<T>;
export function loadOnce<T extends {}>(
  loadOrParams: LoadOnceParams<T> | LoadOnceParams<T>['load'],
): Promise<T> | ((params: Omit<LoadOnceParams<T>, 'load'>) => Promise<T>) {
  if (typeof loadOrParams === 'function') {
    return (params: Omit<LoadOnceParams<T>, 'load'>) => {
      return loadOnce({
        ...params,
        load: loadOrParams,
      });
    };
  }
  const params: LoadOnceParams<T> = loadOrParams;

  return (async () => {
    const storage =
      typeof params.storage === 'function' ? params.storage() : params.storage;
    const cached = await storage.read();
    if (cached) {
      return cached;
    }
    const res = await params.load();
    await storage.write(res);
    return res;
  })();
}

loadOnce.noStorage = {
  read: async () => undefined,
  write: async () => {
    // noop
  },
} satisfies LoadOnceStorage<unknown>;
