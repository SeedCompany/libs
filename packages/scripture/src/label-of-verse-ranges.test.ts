import { describe, expect, it } from 'vitest';
import { labelOfVerseRanges } from './label-of-verse-ranges.js';
import { parseScripture } from './parser.js';

describe('labelOfVerseRanges', () => {
  it.each([
    ['Genesis 1'],
    ['Genesis 1:1'],
    ['Genesis 1:1, 1:3, 1:5, 1:7'],
    ['Genesis 1–2'],
    ['Genesis 3:5–20'],
    ['Genesis 3:5–6:20'],
    ['1 John 3–5'],
    ['1 John 3, 5'],
    ['Matthew 1, Matthew 3, and Luke 1'],
    ['Matthew 3–Luke 2'],
    ['Matthew 1 and Matthew 5–Luke 2'],
    ['Genesis 1, 2:3–3:4, 6–8, 9:3'],
    ['Genesis 9:18–9:28, 19:31–19:38'],
  ])('%s', (input) => {
    expect(labelOfVerseRanges(parseScripture(input))).toEqual(input);
  });

  it.each([
    ['Genesis 1:1, 1:3, 1:5, 1:7', 2, 'Genesis 1:1, 1:3, and 2 other portions'],
    ['Matthew 1:1, 1:4, 1:20, 2:1', undefined, 'Matthew 1:1, 1:4, 1:20, 2:1'],
    ['Isaiah 1:1, 1:5, 1:7', 0, 'Isaiah 1:1, 1:5, 1:7'],
    ['Jeremiah 1:4, 1:6, 1:8', 4, 'Jeremiah 1:4, 1:6, 1:8'],
    ['Mark 2:4, 2:6, 2:8, 4:7', -1, 'Mark 2:4, 2:6, 2:8, 4:7'],
  ])('%s', (input, collapseAfter, output) => {
    expect(labelOfVerseRanges(parseScripture(input), collapseAfter)).toEqual(
      output,
    );
  });
});
