import type { ArrayItem, FnLike } from '@seedcompany/common';
import type {
  AbstractClass,
  ConditionalExcept,
  ConditionalKeys,
  StringKeyOf,
  UnionToIntersection,
} from 'type-fest';
import * as uuid from 'uuid';
import 'reflect-metadata';

const { defineMetadata } = Reflect;

export type MetadataDecorator<
  Types extends DecoratorTypes,
  ArgsIn extends unknown[],
  ValueStored,
> = ((...args: ArgsIn) => DecoratorForTypes<Types>) & {
  /**
   * The given or created metadata key used in storage.
   */
  KEY: string | symbol;
  /**
   * Get the value stored, if any, from the given target.
   * This will pull from inherited targets as well if the given target doesn't have a value stored.
   */
  get: GetterForTypes<Types, ValueStored | undefined>;
  /**
   * Get the value stored, if any, from the given target.
   * Inherited values are not considered with this getter.
   */
  getOwn: GetterForTypes<Types, ValueStored | undefined>;
};

export interface MetadataDecoratorOptions<
  Types extends DecoratorTypes,
  ArgsIn extends unknown[],
  ValueStored,
> {
  /**
   * The metadata key that will be used in storage
   * Defaults to a UUID.
   */
  key?: string | symbol;
  /**
   * Limit the decorator to certain locations/usages.
   */
  types?: readonly Types[];
  /**
   * Defines the arguments required when calling the decorator
   * and how those are converted to the stored value.
   */
  setter?: (...args: ArgsIn) => ValueStored;
  /**
   * A function to declare how a new value should be stored.
   * Without this, the default behavior is to overwrite the former value and ignore the inherited.
   * This allows defining how previous, inherited values are considered.
   * For example, this could enable lists to be merged.
   */
  merge?: (args: MergeArgs<ValueStored>) => ValueStored;
}

interface MergeArgs<ValueStored> {
  /**
   * The new value from this decorator call.
   */
  next: ValueStored;
  /**
   * The previous value stored, if any, from this current target.
   * Inherited values aren't given here.
   */
  previous: ValueStored | undefined;
  /**
   * The inherited value stored, if any, from the parent target.
   * The current target is never considered for this.
   */
  inherited: ValueStored | undefined;
  /**
   * The decorator location type where the merge is happening.
   * Not sure if this is useful.
   * Was attempting to allow some sort of fallback logic, but
   * so far it hasn't panned out.
   */
  type: DecoratorTypes;
}

/**
 * Create a decorator that stores metadata.
 * This is a wrapper around the reflect-metadata library that
 * provides strict types and an easy-to-use API for any kind of decorator.
 *
 * @example Simple marker tag
 * ```ts
 * const Tag = createMetadataDecorator();
 *
 * @Tag()
 * class Foo {}
 *
 * Tag.get(Foo) // => true | undefined
 * // === true
 * ```
 *
 * @example Add data to be stored
 * ```ts
 * const Tag = createMetadataDecorator({
 *   // This function declares the args that are exposed to the decorator
 *   // And the return type declares the stored value shape
 *   setter: (name: string, opts?: { age?: number }) => ({
 *     name,
 *     age: opts?.age,
 *   })
 * });
 *
 * @Tag('Bob', { age: 50 })
 * class Foo {}
 *
 * Tag.get(Foo) // => { name: string, age?: number } | undefined
 * // === { name: 'Bob', age: 50 }
 * ```
 *
 * @example Labels with merging
 * ```ts
 * const Label = createMetadataDecorator({
 *   type: ['class'] // only allow for classes
 *   setter: (label: string) => [label],
 *   merge: ({ next, previous }) => [...previous ?? [], ...next],
 * });
 *
 * @Label('A')
 * @Label('B')
 * class Foo {}
 *
 * Label.get(Foo) // => string[] | undefined
 * // === ['B', 'A']
 * ```
 *
 * # Prior Art
 *
 * This is similar to {@link import('@nestjs/core').Reflector NestJS' Reflector}.
 * But it doesn't have as much flexibility in what types of decoration are allowed, nor
 * what types of input args are allowed, nor values stored.
 * The Reflector class doesn't correctly type that values could be missing/`undefined`.
 */
export const createMetadataDecorator = <
  ArgsIn extends unknown[] = [],
  ValueStored = true,
  const Types extends DecoratorTypes = DecoratorTypes,
>(
  options: MetadataDecoratorOptions<Types, ArgsIn, ValueStored> = {},
): MetadataDecorator<Types, ArgsIn, ValueStored> => {
  const {
    key: keyIn,
    // types: typesIn,
    setter = () => true as ValueStored,
    merge,
  } = options;
  const id = keyIn ?? uuid.v7();

  const makeGetter =
    (getMetadata: typeof Reflect.getMetadata) =>
    (
      target: AbstractClass<any>,
      property?: string | symbol,
      index?: number,
    ): ValueStored | undefined => {
      // ParameterDecorator
      if (typeof index === 'number') {
        const val = getMetadata(id, target, `${String(property)}:${index}`);
        return val;
      }

      if (property) {
        // PropertyDecorator
        let val = getMetadata(id, target, property);
        if (val !== undefined) {
          return val;
        }

        // MethodDecorator
        const descriptor = Object.getOwnPropertyDescriptor(
          target.prototype,
          property,
        );
        val = descriptor ? getMetadata(id, descriptor.value) : undefined;
        return val;
      }

      // ClassDecorator
      const val = getMetadata(id, target);
      return val;
    };

  const getOwn = makeGetter(Reflect.getOwnMetadata);
  const get = makeGetter(Reflect.getMetadata);

  const decorator = (
    ...args: ArgsIn
  ):
    | ClassDecorator
    | MethodDecorator
    | PropertyDecorator
    | ParameterDecorator => {
    const value = setter(...args);
    return (
      target: object,
      property?: string | symbol,
      indexOrDescriptor?: number | TypedPropertyDescriptor<any>,
    ) => {
      let next = value;

      // ClassDecorator
      if (!property && indexOrDescriptor == null) {
        if (merge) {
          const previous = getOwn(target as AbstractClass<any>);
          const inherited = get(Object.getPrototypeOf(target));
          next = merge({
            next,
            previous,
            inherited,
            type: 'class',
          });
        }
        defineMetadata(id, next, target);
        return;
      }

      const staticCls = target.constructor as AbstractClass<any>;
      let parentCls = Object.getPrototypeOf(staticCls) as
        | AbstractClass<any>
        | undefined;
      // prototype doesn't exist when the staticCls doesn't extend anything.
      parentCls = parentCls?.prototype ? parentCls : undefined;
      const index =
        typeof indexOrDescriptor === 'number' ? indexOrDescriptor : undefined;
      const descriptor =
        indexOrDescriptor && index === undefined
          ? (indexOrDescriptor as TypedPropertyDescriptor<any>)
          : undefined;

      // ParameterDecorator
      if (index != null) {
        if (merge) {
          const previous = getOwn(staticCls, property, index);
          const inherited = parentCls
            ? get(parentCls, property, index)
            : undefined;
          next = merge({
            next,
            previous,
            inherited,
            type: 'parameter',
          });
        }
        defineMetadata(id, next, staticCls, `${String(property)}:${index}`);
        return;
      }

      // MethodDecorator
      if (descriptor) {
        if (merge) {
          const previous = getOwn(staticCls, property);
          const inherited = parentCls ? get(parentCls, property) : undefined;
          next = merge({
            next,
            previous,
            inherited,
            type: 'method',
          });
        }
        defineMetadata(id, next, descriptor.value);
        return descriptor;
      }

      // PropertyDecorator
      if (property) {
        if (merge) {
          const previous = getOwn(staticCls, property);
          const inherited = parentCls ? get(parentCls, property) : undefined;
          next = merge({
            next,
            previous,
            inherited,
            type: 'property',
          });
        }
        defineMetadata(id, next, staticCls, property);
        return;
      }

      /* istanbul ignore next */
      throw new Error('Invalid decorator usage');
    };
  };

  return Object.assign(decorator, { KEY: id, get, getOwn }) as any;
};

const allDecoratorTypes = ['class', 'property', 'method', 'parameter'] as const;
type DecoratorTypes = ArrayItem<typeof allDecoratorTypes>;

type DecoratorForTypes<Types extends DecoratorTypes> = UnionToIntersection<
  | (Types extends 'class' ? ClassDecorator : never)
  | (Types extends 'property' ? PropertyDecorator : never)
  | (Types extends 'method' ? MethodDecorator : never)
  | (Types extends 'parameter' ? ParameterDecorator : never)
>;
type GetterForTypes<Types extends DecoratorTypes, Return> = UnionToIntersection<
  | (Types extends 'class' ? ClassGetter<Return> : never)
  | (Types extends 'method' ? MethodGetter<Return> : never)
  | (Types extends 'property' ? PropertyGetter<Return> : never)
  | (Types extends 'parameter' ? ParameterGetter<Return> : never)
>;

type ClassGetter<Return> = <T>(target: AbstractClass<T>) => Return;
interface MethodGetter<Return> {
  <T, const K extends string>(
    target: AbstractClass<T>,
    methodName: (string extends K ? K : ConditionalKeys<T, FnLike>) | symbol,
  ): Return;
  (method: FnLike): Return;
}
type PropertyGetter<Return> = <T, const K extends string>(
  target: AbstractClass<T>,
  methodName:
    | (string extends K ? K : StringKeyOf<ConditionalExcept<T, FnLike>>)
    | symbol,
) => Return;
type ParameterGetter<Return> = <T, const K extends string>(
  target: AbstractClass<T>,
  methodName: (string extends K ? K : ConditionalKeys<T, FnLike>) | symbol,
  parameterIndex: number,
) => Return;

type PropertyDecorator = (
  target: object,
  propertyKey: string | symbol,
  // I added this arg.
  // It avoids this decorator mistakenly matching / being compatible with MethodDecorator
  nope?: never,
) => void;

type ParameterDecorator = (
  target: object,
  // I changed to be non-nullable. I'm not sure why TS has this as nullable.
  methodName: string | symbol,
  parameterIndex: number,
) => void;
