/**
 * Convert an async iterable into an array.
 *
 * Two upcoming ESMA proposals will make this obsolete:
 * https://tc39.es/proposal-async-iterator-helpers/
 * https://tc39.es/proposal-array-from-async/
 */
export const asyncIteratorToArray = async <T>(
  iterator: AsyncIterable<T> | AsyncIterableIterator<T>,
): Promise<readonly T[]> => {
  const res: T[] = [];
  for await (const item of iterator) {
    res.push(item);
  }
  return res;
};
