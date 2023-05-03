import { Verse, VerseLike } from './books';
import { mapRange, Range } from './scripture-range';

/**
 * Merges verse ranges into an equivalent minimal set of verse ranges.
 * Combines overlapping and adjacent ranges.
 * Also sorts them.
 */
export const mergeVerseRanges = (
  ranges: ReadonlyArray<Range<VerseLike>>,
): ReadonlyArray<Range<Verse>> => {
  // Adapted from Luxon's Interval.merge logic
  const [found, final] = ranges
    .map((range) => mapRange(range, Verse.from))
    .sort((a, b) => +a.start - +b.start)
    .reduce(
      ([sofar, current], item) => {
        if (!current) {
          return [sofar, item];
        }
        // if current overlaps item or current's end is adjacent to item's start
        if (
          (current.end > item.start && current.start < item.end) ||
          +current.end === +item.start - 1
        ) {
          return [
            sofar,
            // Merge current & item
            {
              start: current.start < item.start ? current.start : item.start,
              end: current.end > item.end ? current.end : item.end,
            },
          ];
        }
        return [[...sofar, current], item];
      },
      [[], null] as [Array<Range<Verse>>, Range<Verse> | null],
    );
  if (final) {
    found.push(final);
  }
  return found;
};
