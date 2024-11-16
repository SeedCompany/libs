import { expect, test } from 'vitest';
import { cacheable } from './cachable.js';

test('cachable', () => {
  const cache = new Map<string, string>();
  const cached = cacheable(cache, (key: string) => key);

  expect(cached.cache).toBe(cache);
  expect(cached('key')).toBe('key');
});
