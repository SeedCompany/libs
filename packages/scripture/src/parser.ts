import { Book, Verse } from './books';
import { mergeVerseRanges } from './merge-to-minimal-set';
import { Range } from './scripture-range';

export const tryParseScripture = (input: string | null | undefined) => {
  if (!input?.trim()) {
    return undefined;
  }
  try {
    return parseScripture(input);
  } catch (e) {
    return undefined;
  }
};

/**
 * Example inputs:
 * - Genesis 1
 * - Genesis 1-2
 * - Genesis 3:5-45
 * - 1 John 3, 4
 * - Luke 1 and Matthew 1
 */
export const parseScripture = (
  input: string | null | undefined,
): ReadonlyArray<Range<Verse>> => {
  if (!input?.trim()) {
    return [];
  }

  const rawRefs = input
    .replace(/ and /gi, ' , ')
    .split(/[,;&]/)
    .map((p) => p.trim())
    .filter(Boolean);

  const refs: Array<Range<Verse>> = [];
  let lastCompleteRef: Range<Verse> | undefined = undefined;
  for (const rawRef of rawRefs) {
    const parsedRef = parseRange(rawRef, lastCompleteRef?.start.book.name);
    refs.push(parsedRef);
    lastCompleteRef = parsedRef;
  }

  return mergeVerseRanges(refs);
};

const parseRange = (input: string, fallbackBook?: string): Range<Verse> => {
  const given = lexRange(input);
  if (!given.start.book && !fallbackBook) {
    throw new Error(
      'Cannot parse partial reference without previous complete reference',
    );
  }

  const start = Book.named(given.start.book ?? fallbackBook!)
    .chapter(given.start.chapter ?? 1)
    .verse(given.start.verse ?? 1);

  const isSingleVerse = given.start.verse && !given.end.verse;
  if (isSingleVerse) {
    return start.to(start);
  }

  const endBook = Book.named(given.end.book ?? start.book.name);
  const endChapter = endBook.chapter(
    given.end.chapter ?? given.start.chapter ?? endBook.lastChapter.index,
  );
  const end = endChapter.verse(given.end.verse ?? endChapter.lastVerse.index);

  return start.to(end);
};

const lexRange = (input: string) => {
  const [startRaw, endRaw] = input.split(/[-–]/) as [
    string,
    string | undefined,
  ];
  const start = lexRef(startRaw);
  const end = lexRef(endRaw ?? '');
  // Handle a special case of `1:1-3` where 3 should be the end verse not the end chapter
  if (start.verse && end.chapter && !end.verse) {
    end.verse = end.chapter;
    end.chapter = start.chapter;
  }
  return { start, end };
};

const lexRef = (str: string) => {
  const matches = /^(\d?[ A-Za-z]+)?(?:\.\s*)?(\d*)(?:\s*:\s*(\d+))?$/.exec(
    str.trim(),
  );
  const book = matches?.[1]?.trim() || undefined;
  const chapter = parseInt(matches?.[2] ?? '', 10) || undefined;
  const verse = parseInt(matches?.[3] ?? '', 10) || undefined;
  return { book, chapter, verse };
};
