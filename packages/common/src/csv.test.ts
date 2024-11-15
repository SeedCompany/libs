import { describe, expect, test } from '@jest/globals';
import { cleanSplit, csv } from './csv.js';

describe('csv', () => {
  test('simple & types', () => {
    const split = csv<'red'>('red ,   blue,green,,white');
    expect(split).toEqual(['red', 'blue', 'green', 'white']);
    // @ts-expect-error Expected array items should be correct cast from generic
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,@typescript-eslint/no-unused-expressions
    split[0] === 'teal';
    // @ts-expect-error Expected array should be readonly
    split.push('teal');
  });
});

describe('cleanSplit', () => {
  test('string separator', () => {
    const split = cleanSplit<'red'>('red ;   blue;green;;white', ';');
    expect(split).toEqual(['red', 'blue', 'green', 'white']);
    // @ts-expect-error Expected array items should be correct cast from generic
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,@typescript-eslint/no-unused-expressions
    split[0] === 'teal';
    // @ts-expect-error Expected array should be readonly
    split.push('teal');
  });

  test('regex separator', () => {
    const split = cleanSplit('red ;   blue,green;,white', /[,;]/);
    expect(split).toEqual(['red', 'blue', 'green', 'white']);
  });
});
