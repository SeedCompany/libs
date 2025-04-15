import { Verse, type VerseLike } from './books.js';
import { mapRange, type Range } from './scripture-range.js';

export const labelOfVerseRange = (
  ref: Range<VerseLike>,
  omit?: 'book' | 'chapter',
): string => {
  const { start, end } = mapRange(ref, Verse.from);
  if (start.book.equals(end.book)) {
    if (start.isFirst && end.isLast) {
      if (start.chapter.isFirst && end.chapter.isLast) {
        // Matthew
        return start.book.label;
      } else if (start.chapter.equals(end.chapter)) {
        // Matthew 1
        if (omit === 'book') {
          return start.chapter.index.toString();
        }
        return start.chapter.label;
      } else {
        // Matthew 1–4
        if (omit === 'book') {
          return `${start.chapter.index}–${end.chapter.index}`;
        }
        return `${start.chapter.label}–${end.chapter.index}`;
      }
    } else if (start.chapter.equals(end.chapter)) {
      if (start.equals(end)) {
        // Matthew 1:1
        if (omit === 'chapter') {
          return start.index.toString();
        }
        if (omit === 'book') {
          return `${start.chapter.index}:${start.index}`;
        }
        return start.label;
      } else {
        // Matthew 1:1–20
        if (omit === 'chapter') {
          return `${start.index}–${end.index}`;
        }
        if (omit === 'book') {
          return `${start.chapter.index}:${start.index}–${end.chapter.index}:${end.index}`;
        }
        return `${start.label}–${end.index}`;
      }
    } else {
      // Matthew 1:1–4:21
      if (omit === 'book') {
        return `${start.chapter.index}:${start.index}–${end.chapter.index}:${end.index}`;
      }
      return `${start.label}–${end.chapter.index}:${end.index}`;
    }
  } else if (start.isFirst && end.isLast) {
    if (start.chapter.isFirst && end.chapter.isLast) {
      if (start.book.name === 'Genesis' && end.book.name === 'Revelation') {
        return 'Full Bible';
      }
      if (start.book.name === 'Genesis' && end.book.name === 'Malachi') {
        return 'Old Testament';
      }
      if (start.book.name === 'Matthew' && end.book.name === 'Revelation') {
        return 'New Testament';
      }
      // Matthew-John
      return `${start.book.label}–${end.book.label}`;
    } else {
      // Matthew 1-John 2
      return `${start.chapter.label}–${end.chapter.label}`;
    }
  } else {
    // Matthew 1:1-John 2:4
    return `${start.label}–${end.label}`;
  }
};
