import { Verse } from './books.js';
import type { Range } from './scripture-range.js';

export const splitRangeByBook = (
  range: Range<Verse>,
): ReadonlyArray<Range<Verse>> => Array.from(splitRangeByBookIterator(range));

function* splitRangeByBookIterator({ start, end }: Range<Verse>) {
  while (start.book.name !== end.book.name) {
    yield {
      start,
      end: start.book.lastChapter.lastVerse,
    };
    start = start.book.next!.firstChapter.firstVerse;
  }
  yield { start, end };
}
