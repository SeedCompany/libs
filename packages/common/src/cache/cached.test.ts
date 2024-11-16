import { expect, test } from 'vitest';
import { cached } from './cached.js';

test('cached', () => {
  let i = 0;
  const cache = new Map<string, string>();
  const calculate = (key: string) => {
    i++;
    return key;
  };

  const result1 = cached(cache, 'key', calculate);
  expect(result1).toBe('key');
  expect(i).toBe(1);

  const result2 = cached(cache, 'key', calculate);
  expect(result2).toBe('key');
  expect(i).toBe(1);

  expect([...cache.entries()]).toEqual([['key', 'key']]);
});
