import { defineClassProp } from './define-class-prop.js';

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

/**
 * A small helper to define the {@link Symbol.toStringTag} for the class or object.
 *
 * Useful to convey that the class/object is not a "regular" object.
 * @see isRegularObject
 */
export const setToStringTag = <
  Cls extends { prototype: unknown } | object,
  T = Cls extends { prototype: infer I } ? I : Cls,
>(
  classOrObject: Cls,
  tag: string | ((this: T, instance: T) => string),
) =>
  defineClassProp(
    classOrObject,
    Symbol.toStringTag,
    typeof tag === 'string'
      ? { value: tag }
      : {
          get: function toStringTag(this: T) {
            return tag.call(this, this);
          },
        },
  );
