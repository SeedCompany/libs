export type MaybeAsync<T> = T | Promise<T>;

export type Nil = null | undefined;

export type IteratorItem<T> = T extends Iterator<infer Item> ? Item : never;

export type IterableItem<T> = T extends {
  [Symbol.iterator]: () => infer TIterator;
}
  ? IteratorItem<TIterator>
  : never;

export type ArrayItem<T> = IterableItem<T>;
