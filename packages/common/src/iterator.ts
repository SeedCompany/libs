/**
 * Convert an async iterable into an array.
 *
 * @deprecated Use {@link Array.fromAsync} instead.
 * Available in Node 22+ & all browsers.
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
