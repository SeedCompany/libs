import { expect, test } from 'vitest';
import { CachedByArg } from './CachedByArg.js';

class TestCacheByArg {
  i = 0;

  @CachedByArg()
  noArgs() {
    return ++this.i;
  }

  @CachedByArg()
  withMap(key: string) {
    this.i++;
    return key + '!';
  }

  @CachedByArg({ weak: true })
  withWeakMap({ key }: { key: string }) {
    this.i++;
    return key + '!';
  }

  // @ts-expect-error expected as these are invalid args
  @CachedByArg()
  excessiveArgs(_arg1: string, _ohNoMore: string) {
    // TS test
  }

  // @ts-expect-error weak requires an object arg
  @CachedByArg({ weak: true }) invalidWeakArgs(_arg1: string) {
    // TS test
  }
}

test('CachedByArg with no args', () => {
  const sut = new TestCacheByArg();

  const result1 = sut.noArgs();
  expect(result1).toBe(1);

  const result2 = sut.noArgs();
  expect(result2).toBe(1);
});

test('CachedByArg with Map', () => {
  const sut = new TestCacheByArg();

  const result1 = sut.withMap('key');
  expect(result1).toBe('key!');
  expect(sut.i).toBe(1);

  const result2 = sut.withMap('key');
  expect(result2).toBe('key!');
  expect(sut.i).toBe(1);
});

test('CachedByArg with WeakMap', () => {
  const sut = new TestCacheByArg();

  const obj = { key: 'red' };
  const result1 = sut.withWeakMap(obj);
  expect(result1).toBe('red!');
  expect(sut.i).toBe(1);

  const result2 = sut.withWeakMap(obj);
  expect(result2).toBe('red!');
  expect(sut.i).toBe(1);

  const result3 = sut.withWeakMap({ key: 'red' });
  expect(result3).toBe('red!');
  expect(sut.i).toBe(2);
});

test('each instance has their own map', () => {
  const sut1 = new TestCacheByArg();
  const sut2 = new TestCacheByArg();

  sut1.withMap('key');
  expect(sut1.i).toBe(1);
  expect(sut2.i).toBe(0);

  sut2.withMap('key');
  expect(sut1.i).toBe(1);
  expect(sut1.i).toBe(1);
});
