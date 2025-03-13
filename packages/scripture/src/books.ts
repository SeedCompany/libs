import {
  setInspectOnClass,
  setToJson,
  setToPrimitive,
  setToStringTag,
} from '@seedcompany/common';
import { BookList, BookLookupMap } from './raw-book-data.js';
import type { Range } from './scripture-range.js';
import type { ScriptureReference } from './scripture-reference.type.js';

export class Book implements Iterable<Chapter> {
  private constructor(
    readonly name: string,
    readonly index: OneBasedIndex,
    private readonly chapterLengths: readonly number[],
  ) {}

  static get first() {
    return Book.at(1);
  }

  static get last() {
    return Book.at(-1);
  }

  static at(index: RelativeOneBasedIndex) {
    const book = this.atMaybe(index);
    if (book) {
      return book;
    }
    if (index === 0) {
      throw new Error('Books are 1-indexed');
    }
    throw new Error('There are only 66 books in the Bible');
  }

  static atMaybe(index: RelativeOneBasedIndex): Book | undefined {
    if (index === 0) {
      return undefined;
    }
    const absoluteIndex: OneBasedIndex =
      index < 0 ? BookList.length + index + 1 : index;
    const book = BookList.at(absoluteIndex - 1);
    return book
      ? new Book(book.names[0], absoluteIndex, book.chapters)
      : undefined;
  }

  static named(name: string) {
    const book = Book.namedMaybe(name);
    if (book) {
      return book;
    }
    throw new Error(`Book "${name}" does not exist`);
  }

  static namedMaybe(name: string) {
    const index = BookLookupMap.get(name.toLowerCase());
    return index !== undefined ? Book.at(index + 1) : undefined;
  }

  static fromRef(ref: ScriptureReference) {
    return Book.named(ref.book);
  }

  get full() {
    return this.firstChapter.firstVerse.to(this.lastChapter.lastVerse);
  }

  get label() {
    return this.name;
  }

  get isFirst() {
    return this.index === 1;
  }

  get isLast() {
    return this.index === BookList.length;
  }

  get previous() {
    return Book.atMaybe(this.index - 1);
  }

  get next() {
    return Book.atMaybe(this.index + 1);
  }

  get totalChapters() {
    return this.chapterLengths.length;
  }

  get totalVerses() {
    const total = this.chapters.reduce(
      (total, chapter) => total + chapter.totalVerses,
      0,
    );
    setPropValue(this, 'totalVerses', total);
    return total;
  }

  get firstChapter() {
    return this.chapter(1);
  }

  get lastChapter() {
    return this.chapter(-1);
  }

  get chapters(): readonly Chapter[] {
    return Array.from(this);
  }

  chapter(chapterNumber: RelativeOneBasedIndex) {
    const maybe = this.chapterMaybe(chapterNumber);
    if (maybe) {
      return maybe;
    }
    if (chapterNumber === 0) {
      throw new Error('Chapters are 1-indexed');
    }
    throw new Error(
      `${this.label} has ${this.totalChapters} chapter(s), not ${Math.abs(
        chapterNumber,
      )}`,
    );
  }

  chapterMaybe(index: RelativeOneBasedIndex) {
    const absoluteIndex: OneBasedIndex =
      index < 0 ? this.totalChapters + index + 1 : index;
    const totalVerses = this.chapterLengths.at(absoluteIndex - 1);
    if (totalVerses && totalVerses > 0) {
      return new Chapter(this, absoluteIndex, totalVerses);
    }
    return undefined;
  }

  equals(other: Book) {
    return this.name === other.name;
  }

  static *[Symbol.iterator]() {
    for (const book of BookList) {
      yield Book.named(book.names[0]);
    }
  }

  *[Symbol.iterator]() {
    for (const chapter of Array(this.totalChapters).keys()) {
      yield this.chapter(chapter + 1);
    }
  }
}
setInspectOnClass(Book, (book) => ({
  collapsedId: book.name,
  include: ['name', 'index'],
}));
setToJson(Book, (book) => book.name);
setToPrimitive(Book, (book, hint) =>
  hint === 'number' ? book.index : book.name,
);
setToStringTag(Book, 'Book');

export class Chapter implements Iterable<Verse> {
  /** @internal */
  constructor(
    readonly book: Book,
    readonly index: OneBasedIndex,
    readonly totalVerses: number,
  ) {}

  static get first() {
    return Book.first.firstChapter;
  }

  static get last() {
    return Book.last.lastChapter;
  }

  static fromRef(ref: ScriptureReference) {
    return Book.fromRef(ref).chapter(ref.chapter);
  }

  get full() {
    return this.firstVerse.to(this.lastVerse);
  }

  get label() {
    return `${this.book.label} ${this.index}`;
  }

  get firstVerse() {
    return this.verse(1);
  }

  get lastVerse() {
    return this.verse(-1);
  }

  get isFirst() {
    return this.index === 1;
  }

  get isLast() {
    return this.index === this.book.totalChapters;
  }

  get previousInBook(): Chapter | undefined {
    return this.isFirst ? undefined : this.book.chapter(this.index - 1);
  }

  get nextInBook(): Chapter | undefined {
    return this.isLast ? undefined : this.book.chapter(this.index + 1);
  }

  equals(other: Chapter) {
    return this.book.equals(other.book) && this.index === other.index;
  }

  verse(verseNumber: RelativeOneBasedIndex) {
    const verse = this.verseMaybe(verseNumber);
    if (verse) {
      return verse;
    }
    if (verseNumber === 0) {
      throw new Error('Verses are 1-indexed');
    }
    throw new Error(
      `${this.label} has ${this.totalVerses} verse(s), not ${Math.abs(
        verseNumber,
      )}`,
    );
  }

  verseMaybe(verseNumber: RelativeOneBasedIndex) {
    if (verseNumber === 0) {
      return undefined;
    }
    if (verseNumber < 0) {
      verseNumber = this.totalVerses + verseNumber + 1;
    }
    if (verseNumber <= 0 || verseNumber > this.totalVerses) {
      return undefined;
    }
    return new Verse(this, verseNumber);
  }

  *[Symbol.iterator]() {
    for (const verseNum of Array(this.totalVerses).keys()) {
      yield this.verse(verseNum + 1);
    }
  }

  get verses(): readonly Verse[] {
    return Array.from(this);
  }
}
setInspectOnClass(Chapter, (chapter) => ({
  collapsedId: chapter.label,
  include: [],
}));
setToJson(Chapter, (chapter) => ({
  book: chapter.book,
  chapter: chapter.index,
}));
setToPrimitive(Chapter, (chapter, hint) =>
  hint === 'number' ? chapter.index : chapter.label,
);
setToStringTag(Chapter, 'Chapter');

export class Verse {
  /** @internal */
  constructor(readonly chapter: Chapter, readonly index: OneBasedIndex) {}

  static get first() {
    return Chapter.first.firstVerse;
  }

  static get last() {
    return Chapter.last.lastVerse;
  }

  static from(verse: VerseLike) {
    if (verse instanceof Verse) {
      return verse;
    }
    if (typeof verse === 'number') {
      return Verse.fromId(verse);
    }
    return Verse.fromRef(verse);
  }

  static fromRef(ref: ScriptureReference) {
    return Chapter.fromRef(ref).verse(ref.verse);
  }

  static fromId(verseId: VerseId) {
    // Start by converting the 0-indexed number to the 1-indexed verse total
    let versesRemaining = verseId + 1;

    let book: Book | undefined = Book.first;
    while (book && versesRemaining > 0) {
      // First narrow it down to the book
      if (versesRemaining - book.totalVerses > 0) {
        versesRemaining -= book.totalVerses;
        book = book.next;
        continue;
      }

      let chapter: Chapter | undefined = book.firstChapter;
      while (chapter && versesRemaining > 0) {
        // Now narrow it down to the chapter
        if (versesRemaining - chapter.totalVerses > 0) {
          versesRemaining -= chapter.totalVerses;
          chapter = chapter.nextInBook;
          continue;
        }

        // With previous books & chapters removed the renaming verses
        // is the verse in the chapter & book.
        return chapter.verse(versesRemaining);
      }
    }

    throw new Error('Invalid verse number');
  }

  to(other: VerseLike): Range<Verse> {
    const v = Verse.from(other);
    return v.id <= this.id ? { start: v, end: this } : { start: this, end: v };
  }

  get full() {
    return this.to(this);
  }

  get book() {
    return this.chapter.book;
  }

  get label() {
    return `${this.chapter.label}:${this.index}`;
  }

  get isFirst() {
    return this.index === 1;
  }

  get isLast() {
    return this.index === this.chapter.totalVerses;
  }

  equals(other: Verse) {
    return this.id === other.id;
  }

  get id(): VerseId {
    // Verse ID is just a 0-indexed number starting from Genesis 1:1.
    // Since all verses are 1-indexed, we start with the offset.
    let verseCount = -1;

    // 1. Add all verses in Bible before the current book
    let book = this.book.previous;
    while (book) {
      verseCount += book.totalVerses;
      book = book.previous;
    }

    // 2. Add all verses in chapters up to the current chapter
    let chapter = this.chapter.previousInBook;
    while (chapter) {
      verseCount += chapter.totalVerses;
      chapter = chapter.previousInBook;
    }

    // 3. Add all verses in current chapter including current verse
    verseCount += this.index;

    setPropValue(this, 'id', verseCount);
    return verseCount;
  }

  get reference() {
    return {
      book: this.chapter.book.name,
      chapter: this.chapter.index,
      verse: this.index,
    };
  }
}
setInspectOnClass(Verse, (verse) => ({
  collapsedId: verse.label,
  include: [],
}));
setToJson(Verse, (verse) => verse.reference);
setToPrimitive(Verse, (verse, hint) =>
  hint === 'number' ? verse.id : verse.label,
);
setToStringTag(Verse, 'Verse');

export type VerseLike = ScriptureReference | VerseId | Verse;

/**
 * A 0-based index representing the absolute position
 * of a verse in the Bible across all books and chapters.
 */
export type VerseId = number;

/**
 * A 1-based index number.
 */
export type OneBasedIndex = number;

/**
 * A 1-based index number.
 * Negative numbers can be used to reference items starting from the end of the list, just like {@link Array.at}
 */
export type RelativeOneBasedIndex = number;

function setPropValue(obj: object, key: string, value: unknown) {
  Object.defineProperty(obj, key, { value, configurable: true });
}
