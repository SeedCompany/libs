import { expect, test } from '@jest/globals';
import { setOf } from './set-of';

test('setOf works', () => {
  const colors = setOf(['red', 'green', 'blue']);
  expect(colors).toBeInstanceOf(Set);
  expect(colors.has('red')).toBe(true);
  // @ts-expect-error the set should be declared as readonly
  colors.add('yellow');
  // @ts-expect-error the keys should be strict
  colors.has('yellow');
});
