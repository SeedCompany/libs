import { expect, test } from '@jest/globals';
import { cacheable } from './cachable';

test('cachable', () => {
  const cache = new Map<string, string>();
  const cached = cacheable(cache, (key: string) => key);

  expect(cached.cache).toBe(cache);
  expect(cached('key')).toBe('key');
});
