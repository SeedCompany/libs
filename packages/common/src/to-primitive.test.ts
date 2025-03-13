import { expect, test } from 'vitest';
import { setToPrimitive } from './to-primitive.js';

test('setToPrimitive works', () => {
  class Foo {
    hi = 'hi';
  }
  const foo = new Foo();

  setToPrimitive(Foo, (f, hint) =>
    hint === 'string' ? f.hi : hint === 'number' ? 5 : 'def',
  );
  expect(String(foo)).toBe('hi');
  expect(+foo).toBe(5);
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  expect(foo + '').toBe('def');
});
