import { AsyncLocalStorage } from 'async_hooks';
import { type MonoTypeOperatorFunction, Observable } from 'rxjs';

/**
 * Ensures that the subscriber's ALS context is preserved for the observed stream.
 */
export const withAsyncContext$ = <T>(): MonoTypeOperatorFunction<T> => {
  const scoped = AsyncLocalStorage.snapshot();
  return (source) =>
    new Observable<T>((subscriber) =>
      source.subscribe({
        next: (message) => scoped(() => subscriber.next(message)),
        error: (err) => scoped(() => subscriber.error(err)),
        complete: () => scoped(() => subscriber.complete()),
      }),
    );
};

/**
 * Ensures that the iterator's ALS context is preserved throughout its iteration.
 */
export function withAsyncContextIterator<T, TReturn, TNext>(
  iterator: AsyncIterable<T, TReturn, TNext> | AsyncIterator<T, TReturn, TNext>,
): AsyncIterableIterator<T, TReturn, TNext> {
  const scoped = AsyncLocalStorage.snapshot();
  const it =
    Symbol.asyncIterator in iterator
      ? iterator[Symbol.asyncIterator]()
      : iterator;
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next: (...args) => scoped(() => it.next(...args)),
    return: (...args) =>
      it.return
        ? scoped(() => it.return!(...args))
        : Promise.resolve({ value: undefined as TReturn, done: true }),
    throw: (...args) =>
      it.throw ? scoped(() => it.throw!(...args)) : Promise.reject(args[0]),
  };
}

/**
 * @deprecated Use {@link withAsyncContext$} instead.
 */
export const withAsyncContext = withAsyncContext$;
