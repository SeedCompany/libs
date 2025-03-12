import { expect, test } from 'vitest';
import { setToJson } from './to-json.js';

test('setToJson works', () => {
  class Foo {
    hi = 'hi';
  }
  const foo = new Foo();

  setToJson(Foo, (f) => f.hi);
  expect(JSON.stringify(foo)).toBe('"hi"');

  setToJson(Foo, function () {
    return this.hi;
  });
  expect(JSON.stringify(foo)).toBe('"hi"');

  const plain = { hi: 'hi' };
  setToJson(plain, (p) => p.hi);
  expect(JSON.stringify(plain)).toBe('"hi"');
  setToJson(plain, function () {
    return this.hi;
  });
  expect(JSON.stringify(plain)).toBe('"hi"');
});
