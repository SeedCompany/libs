/* eslint @typescript-eslint/ban-ts-comment: ["error", minimumDescriptionLength: 0] */
import { describe, expect, test } from '@jest/globals';
import * as Nest from '@nestjs/common';
import * as NestConstants from '@nestjs/common/constants.js';
import { createMetadataDecorator } from './metadata-decorator';

test('TS: Get/Set based on configured types', () => {
  // Not executed to avoid affecting coverage.
  function _assert() {
    const Any = createMetadataDecorator();
    const Class = createMetadataDecorator({
      types: ['class'],
    });
    const Property = createMetadataDecorator({
      types: ['property'],
    });
    const Method = createMetadataDecorator({
      types: ['method'],
    });
    const Parameter = createMetadataDecorator({
      types: ['parameter'],
    });

    @Any()
    @Class()
    // @ts-expect-error
    @Property()
    // @ts-expect-error
    @Method()
    // @ts-expect-error
    @Parameter()
    class T {
      @Any()
      // @ts-expect-error
      @Class()
      @Property()
      // @ts-expect-error
      @Method()
      // @ts-expect-error
      @Parameter()
      prop: string;

      @Any()
      // @ts-expect-error
      @Class()
      // @ts-expect-error
      @Property()
      @Method()
      // @ts-expect-error
      @Parameter()
      method(
        @Any()
        // @ts-expect-error
        @Class()
        // @ts-expect-error
        @Property()
        // @ts-expect-error
        @Method()
        @Parameter()
        _arg: string,
      ) {
        return;
      }
    }

    Any.get(T);
    Any.get(T, 'prop');
    Any.get(T, 'method');
    Any.get(T, 'method', 0);

    Class.get(T);
    // @ts-expect-error
    Class.get(T, 'prop');
    // @ts-expect-error
    Class.get(T, 'method');
    // @ts-expect-error
    Class.get(T, 'method', 0);

    // @ts-expect-error
    Property.get(T);
    Property.get(T, 'prop');
    // @ts-expect-error
    Property.get(T, 'method');
    // @ts-expect-error
    Property.get(T, 'method', 0);

    // @ts-expect-error
    Method.get(T);
    // @ts-expect-error
    Method.get(T, 'prop');
    Method.get(T, 'method');
    // @ts-expect-error
    Method.get(T, 'method', 0);

    // @ts-expect-error
    Parameter.get(T);
    // @ts-expect-error
    Parameter.get(T, 'prop');
    // @ts-expect-error
    Parameter.get(T, 'method');
    Parameter.get(T, 'method', 0);
    // @ts-expect-error built-in types allow this for some reason. be sure we block.
    Parameter.get(T, undefined, 0);

    // @ts-expect-error literal failure is marked
    Any.get(T, 'nope');
    // generic string is allowed
    Any.get(T, 'nope' as string);
    // @ts-expect-error literal failure is marked
    Any.get(T, 'nope', 0);
    // generic string is allowed
    Any.get(T, 'nope' as string, 0);
    // @ts-expect-error literal failure is marked
    Property.get(T, 'nope');
    // generic string is allowed
    Property.get(T, 'nope' as string);
    // @ts-expect-error literal failure is marked
    Method.get(T, 'nope');
    // generic string is allowed
    Method.get(T, 'nope' as string);
    // @ts-expect-error literal failure is marked
    Parameter.get(T, 'nope', 0);
    // generic string is allowed
    Parameter.get(T, 'nope' as string, 0);
  }
});

test('TS: Setter Defines input args & output type', () => {
  const Name = createMetadataDecorator({
    setter: (name: string) => name.toUpperCase(),
  });
  const Mark = createMetadataDecorator();

  class T {}

  function _typeAssertions() {
    // @ts-expect-error
    Name();
    // @ts-expect-error
    Name(false);
    // @ts-expect-error
    Mark(false);
    // @ts-expect-error
    Name('', false);
    // @ts-expect-error
    Mark(false, false);

    // @ts-expect-error
    Name.get(T).toLocaleLowerCase();
    Name.get(T)?.toLocaleLowerCase();

    // @ts-expect-error
    const _nope: false = Mark.get(T);
    const _yes: true | undefined = Mark.get(T);
  }

  expect(Name.get(T)).toBeUndefined();
  Name('hello')(T);
  expect(Name.get(T)).toBe('HELLO');
  Name('world')(T);
  expect(Name.get(T)).toBe('WORLD');

  Mark()(T);
  expect(Mark.get(T)).toBe(true);
});

describe('Get/Set', () => {
  const Word = createMetadataDecorator({
    setter: (word: string) => word,
  });

  @Word('hello class')
  class Y {
    @Word('hello prop')
    prop: string;

    @Word('hello method')
    method(
      @Word('hello param 0')
      _param: string,
    ) {
      return;
    }
  }

  test('As Class', () => {
    expect(Word.get(Y)).toBe('hello class');
  });

  test('As Prop', () => {
    expect(Word.get(Y, 'prop')).toBe('hello prop');
  });

  test('As Method', () => {
    expect(Word.get(Y, 'method')).toBe('hello method');
    const instance = new Y();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Word.get(instance.method)).toBe('hello method');
  });

  test('As Parameter', () => {
    expect(Word.get(Y, 'method', 0)).toBe('hello param 0');
  });
});

describe('Inheritance', () => {
  const Marked = createMetadataDecorator({
    setter: (marked = true) => marked,
  });

  class Person {
    @Marked()
    name: string;
    @Marked()
    age: number;
  }
  class Hero extends Person {
    @Marked(false)
    declare age: number;
  }

  test('Defaults to inherited', () => {
    expect(Marked.get(Hero, 'name')).toBe(true);
  });
  test('getOwn ignores inheritance', () => {
    expect(Marked.getOwn(Hero, 'name')).toBeUndefined();
  });
  test('Own value overrides inherited value', () => {
    expect(Marked.get(Hero, 'age')).toBe(false);
    expect(Marked.getOwn(Hero, 'age')).toBe(false);
  });
});

describe('Merging', () => {
  describe('As Class', () => {
    test('Overrides by default', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => [label],
      });

      @Label('Foo')
      @Label('Bar')
      class A {}

      expect(Label.get(A)).toEqual(['Foo']);
    });

    test('Merges with own previous value & includes inherited', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => ({ labels: [label] }),
        merge: ({ next, previous, inherited, type }) => ({
          type,
          labels: [...next.labels, ...(previous?.labels ?? [])],
          inherited,
        }),
      });

      @Label('Foo')
      @Label('Bar')
      class A {}
      @Label('Baz')
      @Label('Yo')
      class B extends A {}

      expect(Label.get(A)).toEqual({
        type: 'class',
        labels: ['Foo', 'Bar'],
        inherited: undefined,
      });
      expect(Label.get(B)).toEqual({
        type: 'class',
        labels: ['Baz', 'Yo'],
        inherited: {
          type: 'class',
          labels: ['Foo', 'Bar'],
          inherited: undefined,
        },
      });
    });
  });

  describe('As Property', () => {
    test('Overrides by default', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => [label],
      });

      class A {
        @Label('Foo')
        @Label('Bar')
        prop: string;
      }

      expect(Label.get(A, 'prop')).toEqual(['Foo']);
    });

    test('Merges with own previous value & includes inherited', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => ({ labels: [label] }),
        merge: ({ next, previous, inherited, type }) => ({
          type,
          labels: [...next.labels, ...(previous?.labels ?? [])],
          inherited,
        }),
      });

      class A {
        @Label('Foo')
        @Label('Bar')
        prop: string;
      }
      class B extends A {
        @Label('Baz')
        @Label('Yo')
        declare prop: string;
      }

      expect(Label.get(A, 'prop')).toEqual({
        type: 'property',
        labels: ['Foo', 'Bar'],
        inherited: undefined,
      });
      expect(Label.get(B, 'prop')).toEqual({
        type: 'property',
        labels: ['Baz', 'Yo'],
        inherited: {
          type: 'property',
          labels: ['Foo', 'Bar'],
          inherited: undefined,
        },
      });
    });
  });

  describe('As Method', () => {
    test('Overrides by default', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => [label],
      });

      class A {
        @Label('Foo')
        @Label('Bar')
        method() {
          return;
        }
      }

      expect(Label.get(A, 'method')).toEqual(['Foo']);
    });

    test('Merges with own previous value & includes inherited', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => ({ labels: [label] }),
        merge: ({ next, previous, inherited, type }) => ({
          type,
          labels: [...next.labels, ...(previous?.labels ?? [])],
          inherited,
        }),
      });

      class A {
        @Label('Foo')
        @Label('Bar')
        method() {
          return;
        }
      }
      class B extends A {
        @Label('Baz')
        @Label('Yo')
        method() {
          return;
        }
      }

      expect(Label.get(A, 'method')).toEqual({
        type: 'method',
        labels: ['Foo', 'Bar'],
        inherited: undefined,
      });
      expect(Label.get(B, 'method')).toEqual({
        type: 'method',
        labels: ['Baz', 'Yo'],
        inherited: {
          type: 'method',
          labels: ['Foo', 'Bar'],
          inherited: undefined,
        },
      });
    });
  });

  describe('As Parameter', () => {
    test('Overrides by default', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => [label],
      });

      class A {
        method(
          @Label('Foo')
          @Label('Bar')
          _param: string,
        ) {
          return;
        }
      }

      expect(Label.get(A, 'method', 0)).toEqual(['Foo']);
    });

    test('Merges with own previous value & includes inherited', () => {
      const Label = createMetadataDecorator({
        setter: (label: string) => ({ labels: [label] }),
        merge: ({ next, previous, inherited, type }) => ({
          type,
          labels: [...next.labels, ...(previous?.labels ?? [])],
          inherited,
        }),
      });

      class A {
        method(
          @Label('Foo')
          @Label('Bar')
          _param: string,
        ) {
          return;
        }
      }
      class B extends A {
        method(
          @Label('Baz')
          @Label('Yo')
          _param: string,
        ) {
          return;
        }
      }

      expect(Label.get(A, 'method', 0)).toEqual({
        type: 'parameter',
        labels: ['Foo', 'Bar'],
        inherited: undefined,
      });
      expect(Label.get(B, 'method', 0)).toEqual({
        type: 'parameter',
        labels: ['Baz', 'Yo'],
        inherited: {
          type: 'parameter',
          labels: ['Foo', 'Bar'],
          inherited: undefined,
        },
      });
    });
  });
});

// Trying to enforce the principle of not being magical.
// A fallback for "prop to class level" creates a multi-inheritance situation.
// E.g., If a prop doesn't have its own value, we don't know
// if we should fall back to the own class value or the inherited prop value.
// Thus, we let the caller decide that their own usage of `get` vs `getOwn` and null-coalescing.
test('Multi-Level fall backs are manual', () => {
  const Word = createMetadataDecorator({
    setter: (name: string) => name,
  });

  @Word('Cls')
  class Person {
    @Word('name')
    name: string;
    prop: string;
  }

  // If looking to fall back to class level, you need to do it yourself
  expect(Word.get(Person, 'prop')).toBeUndefined();
  expect(Word.get(Person, 'prop') ?? Word.get(Person)).toBe('Cls');

  // Confirm override is possible with ?? expression.
  expect(Word.get(Person, 'name')).toBe('name');
  expect(Word.get(Person, 'name') ?? Word.get(Person)).toBe('name');
});

describe('Compatibility with NestJS decorators using reflect-metadata', () => {
  describe('As Class', () => {
    const ControllerWatermark = createMetadataDecorator({
      key: NestConstants.CONTROLLER_WATERMARK,
    });

    test('get', () => {
      @Nest.Controller()
      class T {}
      expect(ControllerWatermark.get(T)).toBe(true);
    });
    test('set', () => {
      @ControllerWatermark()
      class T {}
      const value = Reflect.getMetadata(ControllerWatermark.KEY, T);
      expect(value).toBe(true);
    });
  });

  describe('As Method - they set on descriptors', () => {
    const OurHeader = createMetadataDecorator({
      key: NestConstants.HEADERS_METADATA,
      setter: (name: string, value: string | (() => string)) => [
        { name, value },
      ],
      merge: ({ next, previous }) => [...(previous ?? []), ...next],
    });

    test('get', () => {
      class T {
        @Nest.Header('color', 'red')
        method() {
          return;
        }
      }
      expect(OurHeader.get(T, 'method')).toEqual([
        { name: 'color', value: 'red' },
      ]);
    });
    test('set', () => {
      class T {
        @OurHeader('color', 'red')
        method() {
          return;
        }
      }
      const instance = new T();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const value = Reflect.getMetadata(OurHeader.KEY, instance.method);
      expect(value).toEqual([{ name: 'color', value: 'red' }]);
    });
  });
});
