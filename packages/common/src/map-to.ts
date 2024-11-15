import { entries } from './entries.js';
import { mapOf } from './map-of.js';

const SKIP = Symbol.for('SKIP');
type SKIP = typeof SKIP;

interface Options {
  SKIP: SKIP;
}

type EntryMapper<Entry, NewKey, NewValue> = (
  item: Entry,
  options: Options,
) => readonly [key: NewKey, value: NewValue] | SKIP;

/**
 * Converts a Record/Map/`Iterable` to a new Map/Record.
 *
 * It takes anything having entries, which could be:
 *   - a plain object
 *   - a Map
 *   - an array of items
 *   - an array of [key, value] tuples
 *   - an `Iterable` of [key, value] tuples
 *     (many objects produce this, even
 *       the output of this function can be used as input)
 *
 * The function given is called with each key/value pair/tuple,
 * and it should return a tuple of the new key/value pair.
 *
 * The output of this function is a result class.
 * It can be used to convert the results to a Map or a Record,
 * or even passed to another function that accepts an `Iterable` of entries.
 * This allows each use-case to use the type best suited for it.
 *
 * It's a common practice to filter out some pairs as well,
 * this can be done with the `SKIP` option, see example below.
 *
 * @example
 * const res = mapEntries({ a: 1, b: 2 }, ([key, value]) =>
 *   [key.toUpperCase(), value * 2]
 * );
 * // Choose the output type best suited for the specific use case.
 * res.asRecord // => { A: 2, B: 4 }
 * res.asMap // => Map of { A: 2, B: 4 }
 *
 * @example
 * const userColors = new Map<User, string>([
 *   [user1, 'red'],
 *   [user2, 'blue'],
 * ]);
 * mapEntries(userColors, ([user, color]) =>
 *   [user, color.toUpperCase()]
 * ).asMap // => Map { user1: 'RED', user2: 'BLUE' }
 *
 * @example From a list
 * mapEntries(['red', 'blue', 'green'], (color) =>
 *   [color, color.toUpperCase()]
 * ).asRecord // => { red: 'RED', blue: 'BLUE', green: 'GREEN' }
 *
 * @example Filtering out/skipping some entries
 * mapEntries({ a: 10, b: 0, c: 4 }, ([key, value], { SKIP }) =>
 *   value <= 0 ? SKIP : [key, value * 2]
 * ).asRecord // => { a: 2, c: 4 }
 */
export function mapEntries<const Entry, const NewKey, const NewValue>(
  entries: Iterable<Entry>,
  mapper: EntryMapper<Entry, NewKey, NewValue>,
): EntriesResult<NewKey, NewValue>;
export function mapEntries<
  const OldKey extends keyof any,
  const OldValue,
  const NewKey,
  const NewValue,
>(
  record: Partial<Record<OldKey, OldValue>>,
  mapper: EntryMapper<
    readonly [key: OldKey, value: OldValue],
    NewKey,
    NewValue
  >,
): EntriesResult<NewKey, NewValue>;
export function mapEntries(list: any, mapper: EntryMapper<any, any, any>) {
  return new EntriesResult(
    entries(list).flatMap((item) => {
      const res = mapper(item, { SKIP });
      return res === SKIP ? [] : [res];
    }),
  );
}

/**
 * This is the same as {@link mapEntries}, but it's here for symmetry with the other map functions.
 */
mapEntries.fromList = mapEntries;

type KeyMapper<OldKey, Value, NewKey> = (
  key: OldKey,
  value: Value,
  options: Options,
) => NewKey | SKIP;

/**
 * Converts a Record/Map/`Iterable`-of-entries to a new Map/Record.
 *
 * This is similar to {@link mapEntries}, but is a shortcut for when the values should remain the same.
 *
 * The entries-like input is the same as {@link mapEntries}, except lists/iterables of values are not allowed, they have to be entries.
 * See {@link mapKeys.fromList} for conversion from a list.
 *
 * The mapper function is given the key as the first argument, and the value as the second.
 * This saves the caller from having to destructure the entry tuple.
 *
 * @example
 * mapKeys({ a: 1, b: 2 }, (key) => key.toUpperCase()).asRecord // => { A: 1, B: 2 }
 *
 * @example
 * mapKeys({ a: 1, b: 0, c: 4 }, (key, value, { SKIP }) =>
 *   value <= 0 ? SKIP : key.toUpperCase()
 * ).asRecord // => { A: 1, C: 4 }
 */
export function mapKeys<const OldKey, const NewKey, const Value>(
  entries: Iterable<readonly [key: OldKey, value: Value]>,
  mapper: KeyMapper<OldKey, Value, NewKey>,
): EntriesResult<NewKey, Value>;
export function mapKeys<
  const OldKey extends keyof any,
  const NewKey,
  const Value,
>(
  record: Partial<Record<OldKey, Value>>,
  mapper: KeyMapper<OldKey, Value, NewKey>,
): EntriesResult<NewKey, Value>;
export function mapKeys(list: any, mapper: KeyMapper<any, any, any>) {
  return new EntriesResult(
    entries(list).flatMap(([oldKey, value]) => {
      const newKey = mapper(oldKey, value, { SKIP });
      return newKey === SKIP ? [] : [[newKey, value]];
    }),
  );
}

/**
 * Converts a List/`Iterable`-of-items to a new Map/Record, where the input items become the values.
 *
 * @example
 * mapKeys.fromList(['red', 'blue', 'green'], (color) =>
 *   color.toUpperCase()
 * ).asRecord // => { RED: 'red', BLUE: 'blue', GREEN: 'green' }
 *
 * @example
 * mapKeys.fromList(new Set(['red', 'blue', 'green']), (color, { SKIP }) =>
 *   color === 'green' ? SKIP : color.toUpperCase()
 * ).asRecord // => { RED: 'red', BLUE: 'blue' }
 */
mapKeys.fromList = <const Item, const NewKey>(
  entries: Iterable<Item>,
  mapper: (value: Item, options: Options) => NewKey | SKIP,
) => mapKeys([...entries].entries(), (_, item, opts) => mapper(item, opts));

type ValueMapper<Key, OldValue, NewValue> = (
  key: Key,
  value: OldValue,
  options: Options,
) => NewValue | SKIP;

/**
 * Converts a Record/Map/`Iterable`-of-entries to a new Map/Record.
 *
 * This is similar to {@link mapEntries}, but is a shortcut for when the keys should remain the same.
 *
 * The entries-like input is the same as {@link mapEntries}, except lists/iterables of values are not allowed, they have to be entries.
 * See {@link mapValues.fromList} for conversion from a list.
 *
 * The mapper function is given the key as the first argument, and the value as the second.
 * This saves the caller from having to destructure the entry tuple.
 *
 * @example
 * mapValues({ a: 1, b: 2 }, (_, value) => value * 2).asRecord // => { a: 2, b: 4 }
 *
 * @example
 * mapValues({ a: 1, b: 0, c: 4 }, (key, value, { SKIP }) =>
 *   value <= 0 ? SKIP : value * 2
 * ).asRecord // => { a: 1, b: 4 }
 */
export function mapValues<const Key, const OldValue, const NewValue>(
  entries: Iterable<readonly [key: Key, value: OldValue]>,
  mapper: ValueMapper<Key, OldValue, NewValue>,
): EntriesResult<Key, NewValue>;
export function mapValues<
  const Key extends keyof any,
  const OldValue,
  const NewValue,
>(
  record: Partial<Record<Key, OldValue>>,
  mapper: ValueMapper<Key, OldValue, NewValue>,
): EntriesResult<Key, NewValue>;
export function mapValues(list: any, mapper: ValueMapper<any, any, any>) {
  return new EntriesResult(
    entries(list).flatMap(([key, oldValue]) => {
      const newValue = mapper(key, oldValue, { SKIP });
      return newValue === SKIP ? [] : [[key, newValue]];
    }),
  );
}

/**
 * Converts a List/`Iterable`-of-items to a new Map/Record, where the input items become the keys.
 *
 * @example
 * mapValues.fromList(['red', 'blue', 'green'], (color) =>
 *   color.toUpperCase()
 * ).asRecord // => { red: 'RED', blue: 'BLUE', green: 'GREEN' }
 *
 * @example
 * mapValues.fromList(new Set(['red', 'blue', 'green']), (color, { SKIP }) =>
 *   color === 'green' ? SKIP : color.toUpperCase()
 * ).asRecord // => { red: 'RED', blue: 'BLUE' }
 */
mapValues.fromList = <const Item, const NewVal>(
  entries: Iterable<Item>,
  mapper: (value: Item, options: { SKIP: typeof SKIP }) => NewVal | typeof SKIP,
) =>
  mapValues(
    [...entries].map((item) => [item, item] as const),
    (_, item, opts) => mapper(item, opts),
  );

/**
 * The output of {@link mapEntries}, {@link mapKeys}, {@link mapValues}.
 *
 * It allows easily converting the results to a Map or a Record
 * or passing to another function that accepts an `Iterable` of entries.
 */
export class EntriesResult<const Key, const Value>
  implements Iterable<readonly [key: Key, value: Value]>
{
  constructor(
    readonly entries: ReadonlyArray<readonly [key: Key, value: Value]>,
  ) {}

  get asRecord(): Readonly<Record<Key extends keyof any ? Key : never, Value>> {
    return Object.fromEntries(this.entries);
  }

  get asMap() {
    return mapOf(this.entries);
  }

  *[Symbol.iterator]() {
    yield* this.entries;
  }
}
