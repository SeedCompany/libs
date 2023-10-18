/**
 * Returns an array of key-value tuples for the given mapping.
 *
 * This is mainly for Records, where we cannot use `Object.entries` with strict keys.
 * But this also accepts an `Iterable`, so it works with Maps, or an array of entries.
 *
 * I've made the hard choice of not calling `Array.entries()` when given arrays,
 * but instead just returning the same shape.
 * This could be unexpected, since the name is the same.
 * I fear it will cause more confusion, since we can't know if the array
 * should be converted to tuples with indexes, or if it's already a list of entry tuples.
 * I wouldn't want to distinguish based on `Array` vs `Iterable` type to determine this as
 * that also could be unexpected.
 * Since using array indexes is less common, I'm favoring treating Array input the same as Iterable.
 * This still works too, when actually wanting array indexes.
 * ```ts
 * entries([...].entries())
 * ````
 */
export function entries<K, V>(
  map: Iterable<readonly [key: K, value: V]>,
): ReadonlyArray<readonly [key: K, value: V]>;
export function entries<T extends object>(
  object: T,
): ReadonlyArray<EntryOf<Required<T>>>;
export function entries<K, V>(o: any): ReadonlyArray<readonly [K, V]> {
  return Symbol.iterator in o ? [...o] : Object.entries(o);
}

export type EntryOf<T extends object> = {
  [K in keyof T]: readonly [key: K, value: T[K]];
}[keyof T];
