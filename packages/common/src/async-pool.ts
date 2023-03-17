import { asyncIteratorToArray } from './iterator';

/**
 * Like {@link Promise.all} but with a limit on the number of promises executing at once.
 *
 * Note that results could be shuffled if the concurrency limit is reached and a later item finishes faster.
 *
 * @example
 * // Send up to 2 emails at once and wait for entire list to finish
 * await asyncPool(2, emails, async (item) => sendEmail(item));
 *
 * @example
 * // Fetch up to 2 users at once and sequentially process them
 * for await (const user of asyncPool(2, ids, fetchUser) {
 *   // take action after each user is fetched
 * }
 *
 * @see https://github.com/rxaviers/async-pool Based on this implementation
 */
export const asyncPool = <T, R>(
  concurrencyLimit: number,
  iterable:
    | Iterable<T>
    | IterableIterator<T>
    | AsyncIterable<T>
    | AsyncIterableIterator<T>,
  iteratee: (item: T) => Promise<R>,
): AsyncIterable<R> & PromiseLike<readonly R[]> => {
  async function* asyncPoolIterator() {
    const executing = new Set<any>();
    async function consume(): Promise<R> {
      const [promise, value] = await Promise.race(executing);
      executing.delete(promise);
      return value;
    }
    for await (const item of iterable) {
      // Wrap iteratorFn() in an async fn to ensure we get a promise.
      // Then expose such promise, so it's possible to later reference and
      // remove it from the executing pool.
      const promise: any = (async () => await iteratee(item))().then(
        (value) => [promise, value],
      );
      executing.add(promise);
      if (executing.size >= concurrencyLimit) {
        yield await consume();
      }
    }
    while (executing.size) {
      yield await consume();
    }
  }

  return {
    [Symbol.asyncIterator]: asyncPoolIterator,
    then: (...args) => asyncIteratorToArray(asyncPoolIterator()).then(...args),
  };
};
