/**
 * Wait for all promises to settle and return the results.
 * If any of the promises reject, then this throws an
 * {@link AggregateError} containing all the promises
 * that rejected.
 *
 * Basically an async/await version of {@link Promise.allSettled}
 */

export async function settledOrThrowAggregate<
  const Items extends readonly unknown[] | [],
>(
  items: Items,
  aggregateErrorMessage?: string,
): Promise<ReadonlyArray<Awaited<Items[number]>>>;
export async function settledOrThrowAggregate<T>(
  items: Iterable<T | PromiseLike<T>>,
  aggregateErrorMessage?: string,
): Promise<ReadonlyArray<Awaited<T>>>;
export async function settledOrThrowAggregate(
  items: Iterable<unknown>,
  aggregateErrorMessage?: string,
) {
  const [values, errors] = await settled(items);
  if (errors.length > 0) {
    throw new AggregateError(errors, aggregateErrorMessage);
  }
  return values;
}

/**
 * {@link Promise.allSettled}, but partitions results
 * into two fulfilled/rejected lists.
 */
export async function settled<const Items extends readonly unknown[] | []>(
  items: Items,
): Promise<
  readonly [
    fulfilled: ReadonlyArray<Awaited<Items[number]>>,
    rejected: readonly Error[],
  ]
>;
export async function settled<T>(
  items: Iterable<T | PromiseLike<T>>,
): Promise<
  readonly [fulfilled: ReadonlyArray<Awaited<T>>, rejected: readonly Error[]]
>;
export async function settled(items: Iterable<unknown>) {
  const settled = await Promise.allSettled(items);
  return partitionSettled(settled);
}

/**
 * Partitions results from {@link Promise.allSettled}
 * into two fulfilled/rejected lists.
 */
export function partitionSettled<
  const Items extends ReadonlyArray<PromiseSettledResult<unknown>> | [],
>(
  items: Items,
): readonly [
  fulfilled: ReadonlyArray<
    Items[number] extends PromiseSettledResult<infer T> ? T : never
  >,
  rejected: readonly Error[],
];
export function partitionSettled<T>(
  items: ReadonlyArray<PromiseSettledResult<T>>,
): readonly [fulfilled: readonly T[], rejected: readonly Error[]];
export function partitionSettled(
  items: ReadonlyArray<PromiseSettledResult<unknown>>,
) {
  return [
    items.flatMap((res) => (res.status === 'fulfilled' ? [res.value] : [])),
    items.flatMap((res) =>
      res.status === 'rejected'
        ? res.reason instanceof Error
          ? res.reason
          : new Error(String(res.reason))
        : [],
    ),
  ] as const;
}
