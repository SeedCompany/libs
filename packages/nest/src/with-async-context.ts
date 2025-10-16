import { AsyncLocalStorage } from 'async_hooks';
import { type MonoTypeOperatorFunction, Observable } from 'rxjs';

/**
 * Ensures that the subscriber's ALS context is preserved for the observed stream.
 */
export const withAsyncContext =
  <T>(): MonoTypeOperatorFunction<T> =>
  (source) =>
    new Observable<T>((subscriber) => {
      const scoped = AsyncLocalStorage.snapshot();
      return source.subscribe({
        next: (message) => scoped(() => subscriber.next(message)),
        error: (err) => scoped(() => subscriber.error(err)),
        complete: () => scoped(() => subscriber.complete()),
      });
    });
