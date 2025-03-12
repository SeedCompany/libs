/**
 * Does the object have a (non-base object) constructor?
 *
 * This doesn't care if the object has a non-base object prototype.
 *
 * ## Input Matrix
 *
 * | Input                 | Constructor/Prototype | `hasCtor` | `hasProto` |
 * |-----------------------|-----------------------|-----------|------------|
 * | `new Foo()`           | `Foo`                 | `true`    | `true`     |
 * | `{}`                  | `Object`              | `false`   | `false`    |
 * | `Object.create(foo)`  | `Foo`                 | `true`    | `true`     |
 * | `Object.create({})`   | `Object`              | `false`   | `true`     |
 * | `Object.create(null)` | `null`                | `false`   | `false`    |
 * | `""`                  | `String`              | `true`    | `true`     |
 * | `[]`                  | `Array`               | `true`    | `true`     |
 *
 * A couple of notes:
 * - Primitives & builtin objects have non-object constructors.
 * - When using `Object.create` on a "plain" object, the resulting object still doesn't have a constructor.
 *   This can be useful for a "class instance" check.
 *   Use {@link hasProto} if trying to see if the object doesn't have a prototype.
 *
 * Combining this with {@link isRegularObject}/{@link isObjectLike} makes the most sense.
 *
 * It is a bit tricky to consider all use cases, so it is up to the implementer.
 * ```ts
 * const isUserLandClassInstance = (value) => isRegularObject(value) && hasCtor(value);
 * const isPlainObject = (value) => isObject(value) && !hasConstructor(value) && !Object.getPrototypeOf(value)
 * ```
 */
export const hasCtor = (value: object) =>
  // Has the object been created with a prototype?
  // `Object.create(null)` creates an object without it.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  typeof value.constructor === 'function' &&
  // And that prototype is not the base object (i.e. `{}`).
  value.constructor !== Object;

/**
 * Does the object have a (non-base object) prototype?
 *
 * This doesn't care if the object has its own constructor.
 *
 * ## Input Matrix
 *
 * | Input                 | Constructor/Prototype | `hasProto` | `hasCtor` |
 * |-----------------------|-----------------------|------------|-----------|
 * | `new Foo()`           | `Foo`                 | `true`     | `true`    |
 * | `{}`                  | `Object`              | `false`    | `false`   |
 * | `Object.create(foo)`  | `Foo`                 | `true`     | `true`    |
 * | `Object.create({})`   | `Object`              | `true`     | `false`   |
 * | `Object.create(null)` | `null`                | `false`    | `false`   |
 * | `""`                  | `String`              | `true`     | `true`    |
 * | `[]`                  | `Array`               | `true`     | `true`    |
 *
 * A couple of notes:
 * - Primitives & builtin objects have non-object prototypes.
 * - When using `Object.create` on a "plain" object, the resulting object's prototype is the input.
 *   This can be surprising if using it for a "plain object" check.
 *   Use {@link hasCtor} if that logic is preferred.
 *
 * Combining this with {@link isRegularObject}/{@link isObjectLike} makes the most sense.
 */
export const hasProto = (value: object) => {
  const proto = Object.getPrototypeOf(value);
  return proto !== Object.prototype && proto != null;
};
