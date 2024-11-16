import { many, type Many } from './many.js';
import { type Nil } from './types.js';

export function sortBy<T extends SortableValue>(
  list: Iterable<T>,
  criteria?: SortCriteria<T>,
): readonly T[];
export function sortBy<T>(
  list: Iterable<T>,
  criteria: SortCriteria<T>,
): readonly T[];
export function sortBy<T>(
  list: Iterable<T>,
  criteria?: SortCriteria<T>,
): readonly T[] {
  return [...list].sort(
    cmpBy(criteria ? criteria : (x: T) => x as SortableValue),
  );
}

export const cmpBy = <T>(criteria: SortCriteria<T>) => {
  const normalized = isSortee(criteria) ? [criteria] : many(criteria);
  const builtCriteria = normalized.map((arg) =>
    Array.isArray(arg) ? [arg[0], arg[1] === 'asc' ? 1 : -1] : [arg, 1],
  );
  return (a: T, b: T): number => {
    for (const [fn, dir] of builtCriteria) {
      const aVal = fn(a);
      const bVal = fn(b);
      const diff = compareSortables(aVal, bVal) * dir;
      if (diff) {
        return diff;
      }
    }
    return 0;
  };
};

const compareSortables = (a: SortableValue, b: SortableValue) => {
  let diff = 0;
  if (a == null || b == null) {
    diff = a == null ? (b == null ? 0 : 1) : -1;
  } else if (
    (typeof a === 'number' && typeof b === 'number') ||
    (typeof a === 'bigint' && typeof b === 'bigint')
  ) {
    diff = a < b ? -1 : a > b ? 1 : 0;
  } else if (typeof a === 'string' && typeof b === 'string') {
    diff = a.localeCompare(b);
  } else if (typeof a === 'object' && typeof b === 'object') {
    if (Symbol.toPrimitive in a && Symbol.toPrimitive in b) {
      diff = compareSortables(
        a[Symbol.toPrimitive]('number'),
        b[Symbol.toPrimitive]('number'),
      );
    } else if ('valueOf' in a && 'valueOf' in b) {
      diff = compareSortables(
        a.valueOf() as SortableValue,
        b.valueOf() as SortableValue,
      );
    }
  }
  return diff;
};

// Is this multiple criteria or a criterion tuple?
const isSortee = <T>(criteria: SortCriteria<T>): criteria is SorteeWithDir<T> =>
  Array.isArray(criteria) && (criteria[1] === 'asc' || criteria[1] === 'desc');

export type SortCriteria<T> = Many<SortCriterion<T>>;
export type SortCriterion<T> = Sortee<T> | SorteeWithDir<T>;
type SorteeWithDir<T> = readonly [Sortee<T>, 'asc' | 'desc'];
type Sortee<T> = (item: T) => SortableValue;

/**
 * A sortable value.
 *
 * I'm ignoring `.toString()` coercion here because it is rarely what is intended.
 * If custom string coercion is desired, the custom object can implement `Symbol.toPrimitive`.
 * We'll call it with `number` as the hint.
 */
type SortableValue =
  | string
  | number
  | bigint
  | HasToPrimitive
  | HasNumericValueOf
  | Nil;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive
 */
interface HasToPrimitive {
  [Symbol.toPrimitive]: (
    hint: 'number' | 'string' | 'default',
  ) => string | number;
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#numeric_coercion
 */
interface HasNumericValueOf {
  valueOf: () => number | bigint;
}
