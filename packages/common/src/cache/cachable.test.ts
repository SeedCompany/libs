import { expect, test } from 'vitest';
import { cacheable } from './cachable.js';

test('cachable', () => {
  const cache = new Map<string, string>();
  const cached = cacheable(cache, (key: string) => key);

  expect(cached.cache).toBe(cache);
  expect(cached('key')).toBe('key');
});

test('cachable inferred signatures', () => {
  const cached = cacheable((key: 'red') => ({ key }))(new Map());
  expect(cached('red').key).toBe('red');
  // @ts-expect-error the key should be strict
  cached('blue');
  // @ts-expect-error the key should be strict
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions,@typescript-eslint/no-unnecessary-condition
  cached('red').key === 'blue';
});
