import { describe, expect, it } from '@jest/globals';
import { labelOfVerseRanges } from './label-of-verse-ranges';
import { parseScripture } from './parser';

describe('mergeVerseRanges', () => {
  it.each([
    ['Genesis 1:1, 1–4', 'Genesis 1–4'],
    ['Genesis 1:2, 1–4', 'Genesis 1–4'],
    ['Genesis 1:1-3:2, 1–4', 'Genesis 1–4'],
    ['Genesis 1-5, 1–4', 'Genesis 1–5'],
    ['Genesis 2-3, 1–4', 'Genesis 1–4'],
    ['Genesis 1-4, 2-3', 'Genesis 1–4'],
    ['Genesis 1-4, 1–5', 'Genesis 1–5'],
    ['Genesis 1-4, 2–5', 'Genesis 1–5'],
    ['Genesis 1-3, 4–5', 'Genesis 1–5'],
    ['Genesis 1:1, 1:1', 'Genesis 1:1'],
    ['Genesis 1:1, 1:2', 'Genesis 1:1–2'],
    ['Genesis 1:1, 1:3', 'Genesis 1:1, 1:3'],
    ['Genesis 1:3, 1:1', 'Genesis 1:1, 1:3'],
  ])('%s', (input, output) => {
    expect(labelOfVerseRanges(parseScripture(input))).toEqual(output);
  });
});
