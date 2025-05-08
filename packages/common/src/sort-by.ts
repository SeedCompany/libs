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
  if (a == null || b == null) {
    return a == null ? (b == null ? 0 : 1) : -1;
  }
  a = toPrimitive(a);
  b = toPrimitive(b);

  let diff = 0;
  if (typeof a === 'string' && typeof b === 'string') {
    diff = a.localeCompare(b);
  } else {
    diff = a < b ? -1 : a > b ? 1 : 0;
  }
  return diff;
};

function toPrimitive(v: SortableValue & {}) {
  if (typeof v !== 'object') {
    return v;
  }
  if (Symbol.toPrimitive in v) {
    return v[Symbol.toPrimitive]('number');
  }
  const vo = v.valueOf();
  // Implicit functionality on objects is to return themselves.
  // Guard against that, since we're looking for actual primitives here.
  if (vo !== v) {
    return vo;
  }
  return vo.toString();
}

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
 * If crafting a custom type, just declare the {@link Symbol.toPrimitive} method to make it sortable.
 *
 * However, we do support this now.
 * But adding this type here is essentially `object`, essentially making this any.
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
