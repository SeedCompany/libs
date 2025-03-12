/**
 * Get the string representation of the object.
 *
 * This automatically unwraps the tag from the "[object Tag]" notation.
 *
 * Use with caution, because prototype pollution blah blah.
 * There are also better, more-typed ways to check for specific types.
 *
 * @example
 * toStringTag({}) -> "Object"
 * toStringTag([]) -> "Array"
 * toStringTag(new Map) -> "Map"
 *
 * @see Symbol.toStringTag
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
 */
export const toStringTag = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1);
