import * as change from 'change-case';
import * as titleCase from 'title-case';
import type * as typefest from 'type-fest';
import { nonEnumerable } from '../index.js';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Case {
  /** @example "fooBar" */
  export type Camel<S extends string> = typefest.CamelCase<
    NoPunctuation<S>,
    { preserveConsecutiveUppercase: false }
  >;
  /** @example "FooBar" */
  export type Pascal<S extends string> = typefest.PascalCase<
    NoPunctuation<S>,
    { preserveConsecutiveUppercase: false }
  >;
  /** @example "FOO_BAR" */
  export type Constant<S extends string> = typefest.ScreamingSnakeCase<
    NoPunctuation<S>
  >;
  /** @example "foo bar" */
  export type No<S extends string> = Lowercase<
    typefest.DelimiterCase<NoPunctuation<S>, ' '>
  >;
  /** @example "foo.bar" */
  export type Dot<S extends string> = typefest.DelimiterCase<
    NoPunctuation<S>,
    '.'
  >;
  /** @example "foo/bar" */
  export type Path<S extends string> = typefest.DelimiterCase<
    NoPunctuation<S>,
    '/'
  >;
  /** @example "Foo bar" */
  export type Sentence<S extends string> = Capitalize<
    Lowercase<typefest.DelimiterCase<NoPunctuation<S>, ' '>>
  >;
  /** @example "foo_bar" */
  export type Snake<S extends string> = typefest.SnakeCase<NoPunctuation<S>>;
  /** @example "foo-bar" */
  export type Kebab<S extends string> = typefest.KebabCase<NoPunctuation<S>>;

  /** @example "Foo-Bar" */
  export type Train<S extends string> = PascalLikeCase<NoPunctuation<S>, '-'>;
  /** @example "Foo_Bar" */
  export type PascalSnake<S extends string> = PascalLikeCase<
    NoPunctuation<S>,
    '_'
  >;
  /** @example "Foo Bar" */
  export type Capital<S extends string> = PascalLikeCase<NoPunctuation<S>, ' '>;

  // Aliasing these builtin types for parity with our runtime methods.

  /** @example "foobar" */
  export type Lower<S extends string> = Lowercase<S>;
  /** @example "FOOBAR" */
  export type Upper<S extends string> = Uppercase<S>;
  /** @example "foo bAr" -> "Foo bAr" */
  export type UpperFirst<S extends string> = Capitalize<S>;
  /** @example "Foo Bar" -> "foo Bar" */
  export type LowerFirst<S extends string> = Uncapitalize<S>;

  // region No Punctuation
  type NoPunctuation<
    S extends string,
    Marks extends readonly string[] = PunctuationMarks,
  > = Marks extends [infer M extends string, ...infer R extends string[]]
    ? NoPunctuation<typefest.Replace<S, M, ' ', { all: true }>, R>
    : S;
  // eslint-disable-next-line prettier/prettier
  type PunctuationMarks = ['.', ',', ';', ':', '!', '?', '-', '_', '/', '\\', "'", '"', '(', ')', '[', ']', '{', '}', '@', '#', '$', '%', '^', '&', '*', '+', '=', '<', '>', '`', '~'];
  // endregion

  // region PascalLikeCase
  // follows suit of type-fest's DelimiterCase & CamelCase
  type PascalLikeCase<
    S extends string,
    Delimiter extends string,
  > = typefest.IsStringLiteral<S> extends false
    ? S
    : RemoveFirstLetter<
        PascalLikeCaseFromArray<
          typefest.Words<S, { splitOnNumbers: false }>,
          Delimiter
        >
      >;
  type PascalLikeCaseFromArray<
    Words extends string[],
    Delimiter extends string,
    OutputString extends string = '',
  > = Words extends [
    infer FirstWord extends string,
    ...infer RemainingWords extends string[],
  ]
    ? `${Delimiter}${Capitalize<Lowercase<FirstWord>>}${PascalLikeCaseFromArray<
        RemainingWords,
        Delimiter
      >}`
    : OutputString;
  type RemoveFirstLetter<S extends string> = S extends `${infer _}${infer Rest}`
    ? Rest
    : '';
  // endregion
}

/**
 * This wraps the {@link import('change-case')} library & provides string literal types via {@link import('type-fest')}
 *
 * Options have been removed so that functions are 1-arity and can be passed directly.
 * Options are provided under the {@link advanced} namespace.
 */
export class Case {
  /**
   * @example
   * "FooBar" -> "fooBar"
   * "FOOBar" -> "fooBar"
   * "foo bar" -> "fooBar"
   */
  static camel<const S extends string>(this: void, str: S): Case.Camel<S> {
    return change.camelCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "foo bar"
   * "FOOBar" -> "foo bar"
   * "foo bar" -> "foo bar"
   */
  static no<const S extends string>(this: void, str: S): Case.No<S> {
    return change.noCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "FooBar"
   * "FOOBar" -> "FooBar"
   * "foo bar" -> "FooBar"
   */
  static pascal<const S extends string>(this: void, str: S): Case.Pascal<S> {
    return change.pascalCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "Foo_Bar"
   * "FOOBar" -> "Foo_Bar"
   * "foo bar" -> "Foo_Bar"
   */
  static pascalSnake<const S extends string>(
    this: void,
    str: S,
  ): Case.PascalSnake<S> {
    return change.pascalSnakeCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "Foo Bar"
   * "FOOBar" -> "Foo Bar"
   * "foo bar" -> "Foo Bar"
   */
  static capital<const S extends string>(this: void, str: S): Case.Capital<S> {
    return change.capitalCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "FOO_BAR"
   * "FOOBar" -> "FOO_BAR"
   * "foo bar" -> "FOO_BAR"
   */
  static constant<const S extends string>(
    this: void,
    str: S,
  ): Case.Constant<S> {
    return change.constantCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "foo.bar"
   * "FOOBar" -> "foo.bar"
   * "foo bar" -> "foo.bar"
   */
  static dot<const S extends string>(this: void, str: S): Case.Dot<S> {
    return change.dotCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "foo-bar"
   * "FOOBar" -> "foo-bar"
   * "foo bar" -> "foo-bar"
   */
  static kebab<const S extends string>(this: void, str: S): Case.Kebab<S> {
    return change.kebabCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "foo/bar"
   * "FOOBar" -> "foo/bar"
   * "foo bar" -> "foo/bar"
   */
  static path<const S extends string>(this: void, str: S): Case.Path<S> {
    return change.pathCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "Foo bar"
   * "FOOBar" -> "Foo bar"
   * "foo bar" -> "Foo bar"
   */
  static sentence<const S extends string>(
    this: void,
    str: S,
  ): Case.Sentence<S> {
    return change.sentenceCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "foo_bar"
   * "FOOBar" -> "foo_bar"
   * "foo bar" -> "foo_bar"
   */
  static snake<const S extends string>(this: void, str: S): Case.Snake<S> {
    return change.snakeCase(str) as any;
  }

  /**
   * @example
   * "FooBar" -> "Foo-Bar"
   * "FOOBar" -> "Foo-Bar"
   * "foo bar" -> "Foo-Bar"
   */
  static train<const S extends string>(this: void, str: S): Case.Train<S> {
    return change.trainCase(str) as any;
  }

  /**
   * @example
   * "FooAtBar" -> "FooAtBar"
   * "Foo At Bar" -> "Foo At Bar"
   * "foo at bar" -> "Foo at Bar"
   */
  static title(this: void, str: string): string {
    return titleCase.titleCase(str);
  }

  /**
   * @example "foobar"
   */
  static lower<const S extends string>(this: void, str: S): Case.Lower<S> {
    return str.toUpperCase() as any;
  }

  /**
   * @example "FOOBAR"
   */
  static upper<const S extends string>(this: void, str: S): Case.Upper<S> {
    return str.toUpperCase() as any;
  }

  /** @example "foo bAr" -> "Foo bAr" */
  static upperFirst<const S extends string>(
    this: void,
    str: S,
  ): Case.UpperFirst<S> {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as any;
  }

  /** @example "Foo Bar" -> "foo Bar" */
  static lowerFirst<const S extends string>(
    this: void,
    str: S,
  ): Case.LowerFirst<S> {
    return (str.charAt(0).toLowerCase() + str.slice(1)) as any;
  }

  /**
   * Case transformers that have more options but aren't strictly typed.
   */
  static readonly advanced = {
    split: change.split,
    splitSeparateNumbers: change.splitSeparateNumbers,
    camel: change.camelCase,
    no: change.noCase,
    pascal: change.pascalCase,
    pascalSnake: change.pascalSnakeCase,
    capital: change.capitalCase,
    constant: change.constantCase,
    dot: change.dotCase,
    kebab: change.kebabCase,
    path: change.pathCase,
    sentence: change.sentenceCase,
    snake: change.snakeCase,
    train: change.trainCase,
    title: Object.assign(titleCase.titleCase, titleCase),
  };
}
nonEnumerable(Case, 'advanced');
nonEnumerable(Case.advanced, ...Object.keys(Case.advanced));
