import { expect, test } from 'vitest';
import { setToStringTag, toStringTag } from './to-string-tag.js';

test('toStringTag works', () => {
  expect(toStringTag({})).toBe('Object');
  expect(toStringTag([])).toBe('Array');
});

test('setToStringTag works', () => {
  class Foo {
    hi = 'hi';
  }
  const foo = new Foo();

  setToStringTag(Foo, 'F');
  expect(toStringTag(foo)).toBe('F');

  setToStringTag(Foo, (f) => f.hi);
  expect(toStringTag(foo)).toBe('hi');
});
