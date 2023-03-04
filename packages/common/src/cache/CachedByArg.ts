import { cacheable } from './cachable';
import { CacheableMap } from './CachableMap';
import { cached } from './cached';

/**
 * A method decorator that will cache return values based on the input argument.
 * It's expected that this method takes a single argument that's a medium-lived object.
 *
 * The result doesn't need to be serializable.
 */
export const CachedByArg =
  <Weak extends boolean | undefined>(options: { weak?: Weak } = {}) =>
  <Arg extends Weak extends true ? object : any, R>(
    staticClass: any,
    methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: [Arg]) => R>,
  ) => {
    const execute = descriptor.value!;
    const getInstance = cacheable(
      new WeakMap<object, CacheableMap<any, any>>(),
      options.weak ? () => new WeakMap() : () => new Map(),
    );
    descriptor.value = function (arg) {
      return cached(getInstance(this), arg, () => execute.call(this, arg));
    };
  };
