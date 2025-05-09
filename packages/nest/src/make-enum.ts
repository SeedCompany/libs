import { registerEnumType } from '@nestjs/graphql';
import {
  cleanJoin,
  isPlainObject,
  mapKeys,
  mapValues,
  nonEnumerable,
  setToStringTag,
} from '@seedcompany/common';
import { noCase, splitSeparateNumbers } from 'change-case';
import { titleCase } from 'title-case';
import { inspect, type InspectOptionsStylized } from 'util';

export type EnumType<Enum> = Enum extends MadeEnum<infer Values, any, any>
  ? Values
  : never;

export type MadeEnum<
  Values extends string,
  ValueDeclaration = EnumValueDeclarationShape,
  Extra = unknown,
> = EnumHelpers<
  Values,
  ValueDeclaration & ImplicitValueDeclarationShape<Values>
> &
  Readonly<Extra> &
  // Allow direct access to the values if they're strict.
  // For generic `string` we don't allow this.
  // This allows strict values to be compatible with generic values.
  // MadeEnum<string> = MadeEnum<X>
  (string extends Values
    ? unknown // ignore addition
    : { readonly [Value in Values & string]: Value });

interface EnumOptions<
  ValueDeclaration extends EnumValueDeclarationShape,
  Extra extends Record<string, any>,
> {
  /**
   * The name to register this enum with GraphQL.
   * If this is omitted, the enum is not exposed to GraphQL.
   */
  readonly name?: string;

  /**
   * The description of this enum for GraphQL.
   */
  readonly description?: string;

  /**
   * The values/members of the enum.
   * These can be strings or objects with extra metadata.
   */
  readonly values: Iterable<ValueDeclaration>;

  /**
   * Expose the order of the enum values to GraphQL.
   */
  readonly exposeOrder?: boolean;

  /**
   * Add extra (non-enumerable) properties to this enum object.
   * These will not be values of the enum, but helper things.
   *
   * This is given the built enum (without any extras), to prevent circular references.
   */
  readonly extra?: (
    // MadeEnum without Extras & ImplicitValueDeclarationShape
    enumObject: {
      readonly [Value in ValuesOfDeclarations<ValueDeclaration> &
        string]: Value;
    } & EnumHelpers<
      ValuesOfDeclarations<ValueDeclaration>,
      NormalizedValueDeclaration<ValueDeclaration>
    >,
  ) => Extra;
}

/**
 * Create a better enum object that can be used in both TS & GraphQL.
 */
export function makeEnum<const Value extends string>(
  input: Iterable<Value>,
): MadeEnum<Value>;
export function makeEnum<
  const ValueDeclaration extends EnumValueDeclarationShape,
  const Extra extends Record<string, any> = never,
>(
  input: EnumOptions<ValueDeclaration, Extra>,
): MadeEnum<
  ValuesOfDeclarations<ValueDeclaration>,
  NormalizedValueDeclaration<ValueDeclaration>,
  [Extra] extends [never] ? unknown : Extra
>;
export function makeEnum(
  raw: Iterable<string> | EnumOptions<any, any>,
): MadeEnum<string> {
  const input: EnumOptions<any, any> = isPlainObject(raw)
    ? raw
    : ({ values: raw } as any);
  const {
    name,
    description,
    values: valuesIn,
    exposeOrder,
    extra: extraFn,
  } = input;

  const valuesNormalized = [...valuesIn].map(
    (value: EnumValueDeclarationShape): EnumValueDeclarationObjectShape =>
      typeof value === 'string' ? { value } : value,
  );
  const entryMap = mapKeys.fromList(valuesNormalized, (e) => e.value).asMap;
  const entries = [...entryMap.values()];

  const object = mapValues(entryMap, (k) => k).asRecord;
  setToStringTag(object, 'Enum');

  const valueList = Object.keys(object);
  const values = new Set(valueList);
  const helpers = {
    values,
    entries,
    [Symbol.iterator]: () => values.values(),
    // @ts-expect-error Ignoring generics for implementation.
    has: (value: string) => entryMap.has(value),
    entry: (value: string) => {
      const entry = entryMap.get(value);
      if (!entry) {
        throw new Error(`${name ?? 'Enum'} does not have member: "${value}"`);
      }
      return entry;
    },
    indexOf: (value: string) => entries.indexOf(entryMap.get(value)!),
    [inspect.custom]: (
      depth: number,
      options: InspectOptionsStylized,
      innerInspect: typeof inspect,
    ) => {
      const label = options.stylize(
        `[Enum${name ? `: ${name}` : ''}]`,
        'special',
      );
      if (depth <= 0) {
        return label;
      }
      const members = innerInspect(valueList).slice(1, -1).replace(/'/g, '');
      return `${label} {${members}}`;
    },
  } satisfies EnumHelpers<string, any>;

  Object.assign(object, helpers);
  nonEnumerable(object, ...Object.keys(helpers));

  if (extraFn) {
    const extra = extraFn(object as any);
    Object.assign(object, extra);
    nonEnumerable(object, ...Object.keys(extra));
  }

  if (name) {
    const valuesMap = Object.fromEntries(
      entries.map((v, i) => [
        v.value,
        {
          deprecationReason: v.deprecationReason,
          description:
            cleanJoin('\n\n', [
              v.description,
              v.label ? `@label ${v.label}` : undefined,
              exposeOrder ? `@order ${i}` : undefined,
            ]) || undefined,
        },
      ]),
    );
    registerEnumType(object, { name, description, valuesMap });
  }

  for (const entry of entries) {
    // @ts-expect-error ignoring immutable here.
    entry.label ??= titleCase(
      noCase(entry.value, { split: splitSeparateNumbers }),
    ).replace(/ and /g, ' & ');
  }

  return object as any;
}

type EnumValueDeclarationShape<Value extends string = string> =
  | Value
  | EnumValueDeclarationObjectShape<Value>;

interface EnumValueDeclarationObjectShape<Value extends string = string> {
  /**
   * The actual value.
   */
  readonly value: Value;
  /**
   * Declare a custom label for this value which is exposed in GraphQL schema.
   */
  readonly label?: string;
  /**
   * Declare a description for this value which is exposed in GraphQL schema.
   */
  readonly description?: string;
  /**
   * Declare this value as deprecated with the given reason, exposed to GraphQL schema.
   */
  readonly deprecationReason?: string;
}

type ImplicitValueDeclarationShape<Value extends string> = Required<
  Pick<EnumValueDeclarationObjectShape<Value>, 'value' | 'label'>
>;

type ValuesOfDeclarations<ValueDeclaration extends EnumValueDeclarationShape> =
  ValueDeclaration extends string
    ? ValueDeclaration
    : ValueDeclaration extends EnumValueDeclarationObjectShape<infer Value>
    ? Value
    : never;

/**
 * This unifies all values to have the standard object shape, plus the extra
 * properties as optional.
 */
type NormalizedValueDeclaration<Declaration extends EnumValueDeclarationShape> =
  // For values that are objects, accept them as they are...
  | (Extract<Declaration, EnumValueDeclarationObjectShape> &
      // plus all the normal object keys
      EnumValueDeclarationObjectShape<ValuesOfDeclarations<Declaration>>)
  // For values that are strings, convert them to the standard shape...
  | (EnumValueDeclarationObjectShape<Extract<Declaration, string>> &
      // and include all the extra keys as optional
      Partial<
        Omit<
          Extract<Declaration, EnumValueDeclarationObjectShape>,
          keyof EnumValueDeclarationObjectShape
        >
      >);

interface EnumHelpers<Values extends string, ValueDeclaration> {
  readonly values: ReadonlySet<Values>;
  readonly entries: ReadonlyArray<Readonly<ValueDeclaration>>;
  readonly entry: <V extends Values>(value: V) => Readonly<ValueDeclaration>;
  readonly indexOf: <V extends Values>(value: V) => number;
  readonly has: <In extends string>(
    value: In & {},
  ) => value is In & Values & {};
  readonly [Symbol.iterator]: () => Iterator<Values>;
}
