/**
 * Decorate a getter to only execute it once and cache the result.
 *
 * @example
 * ```ts
 * class Foo {
 *   @CachedGetter() get bar() {
 *     // this will only be executed once, and the result will be cached
 *     return 42;
 *   }
 * }
 * ```
 *
 * @see Adapted from https://github.com/Alorel/typescript-lazy-get-decorator
 */
export const CachedGetter =
  (): MethodDecorator => (target, key, descriptor) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const getter = descriptor.get;
    if (!getter) {
      throw new Error(`@${CachedGetter.name} can only decorate getters`);
    }
    if (!descriptor.configurable) {
      throw new Error(`@${CachedGetter.name} target must be configurable`);
    }

    const opts = {
      configurable: true,
      enumerable: descriptor.enumerable,
    } satisfies PropertyDescriptor;
    return {
      ...opts,
      get: function () {
        const value = getter.apply(this);
        Object.defineProperty(this, key, { ...opts, value });
        return value;
      },
    };
  };
