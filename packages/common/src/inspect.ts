import type {
  inspect as inspectFn,
  InspectOptions,
  InspectOptionsStylized,
} from 'node:util';
import type { LiteralUnion, SetNonNullable, SetRequired } from 'type-fest';

type Inspect<T> = InspectFn<T> | InspectShortcut<T>;

type InspectFn<TThis = unknown> = (
  this: TThis,
  params: SetRequired<
    SetNonNullable<InspectOptionsStylized, 'depth'>,
    'depth'
  > & {
    inspect: InnerInspectFn;
  } & WithCollapsedFn,
) => string | object;

interface WithCollapsedFn {
  /**
   * Render a collapsed representation of the current object.
   *
   * This mimics Node.js native logic by default.
   * e.g. `[Foo]` where the object is an instance of the `Foo` class.
   * This method, however, adds color.
   *
   * @param id An identifier to help distinguish the instance in this collapsed state.
   * ```ts
   * collapsed('red') => "[Color red]"
   * ```
   * @param type An override for the class name.
   * Use case: A compiler has obfuscated the class name.
   * ```ts
   * collapsed() => "[_Color2]"
   * collapsed(undefined, "Color") => "[Color]"
   * ```
   */
  collapsed: (id?: string, type?: string) => string;
}

type InnerInspectFn = (
  object: unknown,
  optionOverrides?: Partial<InspectOptions>,
) => string;

interface InspectShortcut<T> {
  /**
   * An override for the class name.
   * Use case: A compiler has obfuscated the class name.
   */
  type?: string;
  /**
   * An identifier to help distinguish the instance in the collapsed state.
   * ```ts
   * { collapsedId: 'red' } => "[Color red]"
   * ```
   */
  collapsedId?: string;
  /**
   * A list of property keys that should be included in the object's representation.
   * This declares the order as well, so more important identifying properties
   * can be put first.
   */
  include?: ReadonlyArray<LiteralUnion<keyof T, string>>;
  /**
   * A list of property keys that should be excluded in the object's representation.
   * While this can be used in conjunction with `include`, the main use case is
   * to omit a few keys while keeping the majority.
   */
  exclude?: ReadonlyArray<LiteralUnion<keyof T, string>>;
}

type NativeInspectFn<T> = (
  this: T,
  depth: number | null,
  options: InspectOptionsStylized,
  inspect: typeof inspectFn,
) => string | object;

/**
 * This sets a custom inspection method for this object.
 *
 * This is an improvement over the native functionality by:
 * - allowing type signatures to be inferred.
 * - omitting this method from the public TS shape
 *   (since this method isn't meant to be called directly).
 * - additional ergonomic improvements described below.
 *
 * The inspect function is wrapped to provide a few things:
 * - One parameter as object.
 *   The first parameter being depth was annoying because it is not always
 *   necessary, and it was also included in the native `options` parameter.
 * - `depth` is non-nullable.
 *   `null` is defaulted to `Infinity` as these are the same functionally
 *    and avoid the need for null checks before comparison.
 *    `Infinity` is still easy to check for as well if that is needed.
 * - The `inspect` function passed in, meant for sub/nested inspection,
 *   already has the depth decremented, and all the other options defaulted.
 *   More options can still be passed to override these.
 * - A {@link WithCollapsedFn.collapsed `collapsed`} helper function is provided.
 *
 * The most common use case of these custom functions is to more succinctly represent the object.
 * Many objects have properties (that are enumerable) that don't add value to their representation.
 * These functions almost always end up being a depth check to return a collapsed representation,
 * followed by an inner inspection with a limited set of the object's properties.
 *
 * To that end, a {@link InspectShortcut shortcut} object can be passed instead of a function.
 *
 * This object has two (optional) `include` & `exclude` lists that declare
 * the keys to include or exclude from the representation.
 * `include` also declares the order, so more important identifying properties
 * can be put first.
 *
 * @example
 * ```ts
 * setInspect(obj, {
 *   collapsedId: obj.name,
 *   include: ['foo', 'bar'],
 * });
 * ```
 * ```ts
 * setInspect(obj, ({ depth, collapsed, inspect, stylize }) => {
 *   if (depth <= 0) {
 *     return collapsed(obj.name);
 *   }
 *   const { foo, bar } = obj;
 *   return stylize('Foo ', 'special') + inspect({ foo, bar });
 * });
 * ```
 */
export const setInspect = <T>(object: T, onInspect: Inspect<T>): T =>
  setInspectRaw(object, wrapInspect(onInspect));

/**
 * Same as {@link setInspect} but for use on class prototypes.
 *
 * This differs in that the second argument is a callback that is given the
 * instance, which then returns the customized inspection function/shortcut.
 *
 * @example
 * ```ts
 * setInspectOnClass(User, user => ({
 *   collapsedId: user.email,
 *   include: ['id', 'email', 'name'],
 * });
 * ```
 * ```ts
 * setInspectOnClass(FooLib, () => ({
 *   exclude: ['req'], // hide req that vomits useless stream & wire info.
 * });
 * ```
 */
export const setInspectOnClass = <T>(
  cls: { prototype: T; name: string },
  onInspect: (this: T, instance: T) => Inspect<T>,
) =>
  setInspectRaw(cls.prototype, function inspect(...args) {
    const inspect = onInspect.call(this, this);
    if (typeof inspect !== 'function') {
      inspect.type = inspect.type ? inspect.type : cls.name;
    }
    return wrapInspect(inspect).apply(this, args);
  });

const wrapInspect = <TThis>(
  onInspect: Inspect<TThis>,
): NativeInspectFn<TThis> => {
  const fn: InspectFn<TThis> =
    typeof onInspect === 'function'
      ? onInspect
      : function ({ depth, stylize, collapsed, inspect }) {
          const { type, collapsedId: id, include, exclude } = onInspect;
          if (depth <= 0) {
            return collapsed(id, type);
          }

          const inner = include
            ? include.reduce((acc: object, key) => {
                // @ts-expect-error yes, it is fine - not everything is typed.
                acc[key] = this[key];
                return acc;
              }, {})
            : // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ({ ...this } as object);
          if (exclude) {
            for (const key of exclude) {
              // @ts-expect-error It is fine - we just cloned the object.
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete inner[key];
            }
          }

          if (!type) {
            return inner;
          }
          return `${stylize(type, 'special') + ' '}${inspect(inner)}`;
        };

  return function (depth, options, inspect) {
    depth = depth != null ? depth : Infinity;
    return fn.call(this, {
      ...options,
      depth,
      inspect: (inner, overrideOptions) =>
        inspect(inner, {
          ...options,
          depth: depth! - 1,
          ...overrideOptions,
        }),
      collapsed: (id, type) =>
        options.stylize(
          `[${type ?? String((this as object).constructor.name)}${
            id ? ' ' : ''
          }`,
          'special',
        ) +
        (id || '') +
        options.stylize(']', 'special'),
    });
  };
};

const setInspectRaw = <T>(object: T, fn: NativeInspectFn<T>): T =>
  Object.defineProperty(object, inspectSymbol, {
    value: fn,
    configurable: true,
  });
// Not using `inspect.custom` to avoid runtime imports
const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
