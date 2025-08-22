import { cmpBy, setInspectOnClass, setToStringTag } from '@seedcompany/common';

/**
 * A Set-like data structure that holds items by priority.
 *
 * Items are sorted when first enumerated after an insertion (or creation).
 * This balances allowing fast inserts with fast enumerations (after first).
 */
export class ReadonlyPrioritySet<T>
  implements Omit<Partial<Set<T>>, 'add' | 'entries'>
{
  protected priorityMap: Map<T, number>;
  protected ordered = false;

  constructor(values?: Iterable<[item: T, priority: number]> | null) {
    this.priorityMap = new Map(values);
  }

  static from<T>(values?: Iterable<[item: T, priority: number]> | null) {
    return new ReadonlyPrioritySet(values);
  }

  protected sort() {
    if (!this.ordered) {
      if (this.size > 0) {
        this.priorityMap = new Map(
          [...this.priorityMap].sort(cmpBy(([_, priority]) => priority)),
        );
      }
      this.ordered = true;
    }
    return this;
  }

  get size() {
    return this.priorityMap.size;
  }

  has(item: T) {
    return this.priorityMap.has(item);
  }

  /**
   * Returns an iterator of the items in this set, sorted by priority.
   * This sorts the set if it hasn't already been sorted.
   */
  values() {
    return this.sort().priorityMap.keys();
  }

  /**
   * Returns an iterator for the [item, priority] tuple in this set, sorted by priority.
   * This sorts the set if it hasn't already been sorted.
   */
  entries() {
    return this.sort().priorityMap.entries();
  }

  /**
   * Copy this set to a new instance.
   */
  copy() {
    return new ReadonlyPrioritySet(this.entries());
  }

  /**
   * Copy this set to a regular set.
   *
   * This is useful for converting a priority set to a regular set,
   * so it can be used with the regular set methods.
   */
  toSet() {
    return new Set(this);
  }

  /**
   * Copy this set to a regular map.
   *
   * This is useful for converting a priority set to a regular map,
   * so it can be used with the regular map methods.
   */
  toPriorityMap() {
    return new Map(this.sort().priorityMap);
  }

  [Symbol.iterator]() {
    return this.values();
  }
}

setToStringTag(ReadonlyPrioritySet, 'PrioritySet');
setInspectOnClass(
  ReadonlyPrioritySet,
  function (this: ReadonlyPrioritySet<unknown>) {
    return ({ inspect, stylize, collapsed, depth }) => {
      if (depth <= 0) {
        return collapsed(stylize(String(this.size), 'number'), 'PrioritySet');
      }
      // Re-use Map's inspection, changing the type name.
      return 'PrioritySet' + inspect(this.priorityMap).slice(3);
    };
  },
);

/**
 * A mutable version of {@link ReadonlyPrioritySet}.
 *
 * @inheritDoc
 */
export class PrioritySet<T> extends ReadonlyPrioritySet<T> {
  static from<T>(values?: Iterable<[item: T, priority: number]> | null) {
    return new PrioritySet(values);
  }

  add(item: T, priority = 0) {
    if (this.priorityMap.get(item) === priority) {
      return this;
    }
    this.priorityMap.set(item, priority);
    this.ordered = false;
    return this;
  }

  delete(item: T) {
    return this.priorityMap.delete(item);
  }

  clear() {
    this.priorityMap.clear();
  }

  copy() {
    return new PrioritySet(this.entries());
  }
}
