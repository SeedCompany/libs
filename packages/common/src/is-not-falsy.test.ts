import { expect, test } from '@jest/globals';
import { isNotFalsy, isNotNil } from './is-not-falsy';

test('isNotFalsy', () => {
  const list = ['red', false, null, undefined, 0, 'blue', 0n, NaN] as const;
  const cleaned = list.filter(isNotFalsy);
  expect(cleaned).toEqual(['red', 'blue']);
  // Check the TS type to be only strings
  cleaned[0].toUpperCase();
});

test('isNotNil', () => {
  const list = ['red', null, undefined, 'blue'];
  const cleaned = list.filter(isNotNil);
  expect(cleaned).toEqual(['red', 'blue']);
  // Check the TS type to be only strings
  cleaned[0].toUpperCase();
});
