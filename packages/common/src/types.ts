export type MaybeAsync<T> = T | Promise<T>;

export type Nil = null | undefined;

export type IteratorItem<T> = T extends Iterator<infer Item> ? Item : never;

export type IterableItem<T> = T extends {
  [Symbol.iterator]: () => infer TIterator;
}
  ? IteratorItem<TIterator>
  : never;

export type ArrayItem<T> = IterableItem<T>;

export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Only use as a generic constraint.
 * @example
 * function foo<T extends FnLike>(fn: T) {}
 */
export type FnLike = (...args: any[]) => any;

/**
 * A type safe function whose signature is unknown.
 */
export type UnknownFn = (...args: unknown[]) => unknown;

export type WidenLiteral<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends bigint
  ? bigint
  : T extends symbol
  ? symbol
  : T;
