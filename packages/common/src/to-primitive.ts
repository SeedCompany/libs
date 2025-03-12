import type { Primitive } from 'type-fest';
import { defineClassProp } from './define-class-prop.js';

export type PrimitiveHint = 'string' | 'number' | 'default';

/**
 * A small helper to define how to convert the class or object to a primitive.
 *
 * This keeps the method out of the public shape, which is good because it is not meant to be called directly.
 * However, if private access is needed, this will not work.
 *
 * @see Symbol.toPrimitive
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive
 */
export const setToPrimitive = <
  Cls extends { prototype: unknown } | object,
  T = Cls extends { prototype: infer I } ? I : Cls,
>(
  classOrObject: Cls,
  toPrimitiveFn: (this: T, instance: T, hint: PrimitiveHint) => Primitive,
) =>
  defineClassProp(classOrObject, Symbol.toPrimitive, {
    value: function toPrimitive(this: T, hint: PrimitiveHint) {
      return toPrimitiveFn.call(this, this, hint);
    },
  });
