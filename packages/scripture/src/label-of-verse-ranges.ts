import { Verse, VerseLike } from './books';
import { labelOfVerseRange } from './label-of-verse-range';
import { mergeVerseRanges } from './merge-to-minimal-set';
import { mapRange, Range } from './scripture-range';
import { ScriptureReference } from './scripture-reference.type';

export const labelOfVerseRanges = (
  verseRanges: ReadonlyArray<Range<VerseLike>>,
  collapseAfter?: number,
) => {
  if (verseRanges.length === 0) {
    return '';
  }
  if (verseRanges.length === 1) {
    return labelOfVerseRange(verseRanges[0]);
  }
  const ranges = mergeVerseRanges(verseRanges);
  if (ranges.length === 1) {
    return labelOfVerseRange(ranges[0]);
  }

  const sharedBook = hasSame(ranges, 'book');
  const sharedBookName = sharedBook ? ranges[0].start.book.name : undefined;

  const truncatedCount =
    collapseAfter && collapseAfter > 0 ? ranges.length - collapseAfter : 0;

  const labels = ranges
    .slice(0, ranges.length - truncatedCount)
    .map((ref) => labelOfVerseRange(ref, sharedBook ? 'book' : undefined));

  const mergedRangeLabels = new Intl.ListFormat(undefined, {
    style: sharedBook && truncatedCount <= 0 ? 'narrow' : undefined,
  }).format([
    ...labels,
    ...(truncatedCount > 0 ? [`${truncatedCount} other portions`] : []),
  ]);

  return sharedBookName
    ? `${sharedBookName} ${mergedRangeLabels}`
    : mergedRangeLabels;
};

const hasSame = (
  verses: ReadonlyArray<Range<Verse>>,
  key: keyof ScriptureReference,
) => {
  const refs = verses.map((ref) => mapRange(ref, (e) => e.reference));
  return (
    new Set(refs.flatMap(({ start, end }) => [start[key], end[key]])).size === 1
  );
};
