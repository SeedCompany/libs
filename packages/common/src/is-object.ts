/**
 * Does the value represent some kind of object?
 *
 * Plain objects & class instances are object like.
 * Builtin objects like `Date`, `Array`, `Map`, `Set`, `Error`, etc. are as well.
 *
 * Primitives like, `string`, `boolean`, `numbers`, `bigint`, `null`, `undefined`, `functions`, etc. aren't.
 *
 * Other implementations:
 * - lodash isObjectLike
 * - @nestjs/common/utils/shared.utils.js isObject
 * - @apollo/client/utilities isNonNullObject
 */
export const isObjectLike = (value: unknown): value is object =>
  value != null && typeof value === 'object';
