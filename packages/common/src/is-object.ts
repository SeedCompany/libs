import { hasProto } from './has-ctor-proto.js';
import { toStringTag } from './to-string-tag.js';

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

/**
 * Is this value a plain object?
 *
 * Plain objects are created via object literals or with `Object.create(null)`
 *
 * Other implementations:
 * - lodash
 * - @nestjs/common/utils/shared.utils.js
 * - @apollo/client/utilities
 *
 * I would consider a different implementation for this function,
 * but it would be surprising to deviate from these other same-named, well-known other implementations.
 * So this is here to continue to move away from lodash and avoid other library dependencies.
 *
 * Edge cases:
 * - Plain objects that are "extended" with {@link Object.create} aren't considered plain.
 *   ```ts
 *   const base = { ... };
 *   isPlainObject(base) === true
 *   const sub = Object.create(base);
 *   isPlainObject(sub) === false
 *   ```
 *   Why do this?
 *   It is rare from what I've seen.
 *   But it allows `base` to be modified and have those changes in `sub` as well as long as `sub` hasn't overridden.
 *   This is the prototype chain.
 *
 * - Plain objects could have a custom {@link Symbol.toStringTag} defined.
 *   ```ts
 *   const opts = { ... };
 *   setToStringTag(opts, 'MyOptions');
 *   ```
 *   This, in my opinion, _could_ be considered NOT a plain object anymore, but a custom one.
 *   It is hard to say.
 *
 * ## Composing lower level functions
 *
 * The above edge cases are part of why I've exported lower-level functions to compose up slightly different logic.
 * @example
 * ```ts
 * const isPlain = (value: unknown) => isObjectLike(value) && !hasCtor(value) && isObjectStringTag(value)
 * isPlain(new Foo()) === false
 * isPlain({}) === true
 * isPlain(Object.create({})) === true
 * isPlain(setToStringTag({}, 'Options')) === false
 * ```
 */
export const isPlainObject = (value: unknown): value is object =>
  isObjectLike(value) && !hasProto(value);

/**
 * Does the value represent some kind of regular object?
 *
 * Plain objects & class instances are by default, unless
 * they've specified a custom {@link Symbol.toStringTag}.
 *
 * Builtin objects like `Date`, `Array`, `Map`, `Set`, `Error`, `URL`, etc. aren't,
 * as they have a specific {@link Symbol.toStringTag}.
 */
export const isRegularObject = (value: unknown): value is object =>
  isObjectLike(value) && isObjectStringTag(value);

/**
 * Does this value have a regular "Object" toStringTag?
 *
 * Plain objects & class instances by default do, unless
 * they've specified a custom {@link Symbol.toStringTag}.
 *
 * Builtin objects like `Date`, `Array`, `Map`, `Set`, `Error`, `URL`, etc. aren't,
 * as they have a specific {@link Symbol.toStringTag}.
 */
export const isObjectStringTag = (value: unknown) =>
  toStringTag(value) === 'Object';
