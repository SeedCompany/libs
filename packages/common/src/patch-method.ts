import type { ConditionalKeys } from 'type-fest';
import type { FnLike } from './types.js';

/**
 * This is a helper to monkey patch methods (probably from libraries) to adjust logic.
 *
 * This replaces a method/function on an object with another.
 * The original function is given to the replacer callback so that it can be called before/after patching logic is applied.
 *
 * A caveat to this is it doesn't support generics on the function.
 *
 * The original function is given with `this` bound to the object being patched.
 * This allows it to be called directly without having to use {@link Function.call}/{@link Function.apply} to forward `this`.
 *
 * The replacer callback and the current function are also called with `this` bound to the object.
 * This allows `this` to be used (in regular functions, not arrow functions) as expected with class methods.
 *
 * @example
 * ```ts
 * patchMethod(FooClass.prototype, 'foo', (orig) => (...args) => {
 *   // {business logic to adjust args}
 *   const result = orig(...args);
 *   // {business logic to adjust result}
 *   return result;
 * });
 * ```
 *
 * The goal of this is to reduce the boilerplate for this common concept for us.
 * Without this helper, the above example would be:
 * ```ts
 * const origFoo = FooClass.prototype.foo;
 * FooClass.prototype.foo = function foo(...args) {
 *   // {business logic to adjust args}
 *   const result = origFoo.call(this, ...args);
 *   // {business logic to adjust result}
 *   return result;
 * };
 * ```
 */
export function patchMethod<
  T,
  const K extends ConditionalKeys<T, Fn>,
  Fn extends T[K] & FnLike = T[K] extends FnLike ? T[K] : never,
>(
  obj: T,
  name: K & string,
  replacer: (
    this: T,
    prev: (this: void, ...args: Parameters<Fn>) => ReturnType<Fn>,
  ) => (this: T, ...args: Parameters<Fn>) => ReturnType<Fn>,
) {
  const prev = obj[name] as Fn;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!prev) {
    throw new Error(`Method ${name} does not exist on ${String(obj)}`);
  }
  (obj as any)[name] = {
    [name]: function (this: T, ...args: Parameters<Fn>): ReturnType<Fn> {
      return replacer.call(this, prev.bind(this)).call(this, ...args);
    } as Fn,
  }[name];
}
