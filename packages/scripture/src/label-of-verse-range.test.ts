import { describe, expect, it } from '@jest/globals';
import { labelOfVerseRange } from './label-of-verse-range.js';
import { parseScripture } from './parser.js';

describe('labelOfVerseRange', () => {
  it.each([
    ['Genesis 1'],
    ['Genesis 1:1'],
    ['Genesis 1–2'],
    ['Genesis 3:5–20'],
    ['Genesis 3:5–6:20'],
    ['1 John 3–5'],
    ['Matthew 3–Luke 2'],
  ])('%s', (input) => {
    expect(labelOfVerseRange(parseScripture(input)[0])).toEqual(input);
  });
});
