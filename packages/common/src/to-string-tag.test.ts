import { expect, test } from 'vitest';
import { toStringTag } from './to-string-tag.js';

test('toStringTag works', () => {
  expect(toStringTag({})).toBe('Object');
  expect(toStringTag([])).toBe('Array');
});
