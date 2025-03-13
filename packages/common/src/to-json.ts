import { defineClassProp } from './define-class-prop.js';

/**
 * A small helper to define the toJSON for the class or object.
 *
 * Useful to customize how the object is serialized with {@link JSON.stringify}
 *
 * This keeps the method out of the public shape, which is good because it is not meant to be called directly.
 * However, if private access is needed, this will not work.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
 */
export const setToJson = <
  Cls extends { prototype: unknown } | object,
  T = Cls extends { prototype: infer I } ? I : Cls,
>(
  classOrObject: Cls,
  toJson: (this: T, instance: T, key: string) => unknown,
) =>
  defineClassProp(classOrObject, 'toJSON', {
    value: function toJSON(this: T, key: string) {
      return toJson.call(this, this, key);
    },
  });
