import { LazyGetter as Once } from 'lazy-get-decorator';
import { random, range, sumBy } from 'lodash';
import { inspect } from 'util';
import { iterate } from '../../common';
import { BookData, BookList } from './raw-book-data';
import { ScriptureReference } from './scripture-reference.type';

const bookCache = new Map<string, BookData | null>();

export class Book implements Iterable<Chapter> {
  readonly #book: BookData;

  private constructor(book: BookData) {
    this.#book = book;
  }

  static first() {
    return new Book(BookList[0]);
  }

  static last() {
    return new Book(BookList[BookList.length - 1]);
  }

  static tryFind(name: string | null | undefined) {
    if (!name) {
      return null;
    }
    const normalizedName = name.toLowerCase();
    if (!bookCache.has(normalizedName)) {
      const book = BookList.find((book) =>
        book.names.map((n) => n.toLowerCase()).includes(normalizedName),
      );
      bookCache.set(normalizedName, book ?? null);
    }
    const cached = bookCache.get(normalizedName);
    return cached ? new Book(cached) : null;
  }

  static find(name: string) {
    const book = Book.tryFind(name);
    if (book) {
      return book;
    }
    throw new Error(`Book "${name}" does not exist`);
  }

  static fromRef(ref: ScriptureReference) {
    return Book.find(ref.book);
  }

  static isValid(book: string | null | undefined) {
    return !!Book.tryFind(book);
  }

  static random(after?: Book) {
    const min = after ? BookList.indexOf(after.#book) : 0;
    const max = BookList.length - 1;
    const book = BookList[random(min, max)];
    return new Book(book);
  }

  get label() {
    return this.name;
  }

  get name(): string {
    return this.#book.names[0];
  }

  private get index() {
    return BookList.indexOf(this.#book);
  }

  get isFirst() {
    return this.index === 0;
  }

  get isLast() {
    return this.index === BookList.length - 1;
  }

  get previous(): Book | null {
    return this.isFirst ? null : new Book(BookList[this.index - 1]);
  }

  get next(): Book | null {
    return this.isLast ? null : new Book(BookList[this.index + 1]);
  }

  get totalChapters() {
    return this.#book.chapters.length;
  }

  @Once()
  get totalVerses() {
    return sumBy(this.chapters, (chapter) => chapter.totalVerses);
  }

  get firstChapter() {
    return this.chapter(1);
  }

  get lastChapter() {
    return this.chapter(this.totalChapters);
  }

  get chapters() {
    return iterate(this);
  }

  randomChapter(after?: Chapter) {
    return this.chapter(random(after?.chapter ?? 1, this.totalChapters));
  }

  chapter(chapterNumber: number) {
    const totalVerses = this.#book.chapters[chapterNumber - 1];
    if (totalVerses > 0) {
      return new Chapter(this, chapterNumber, totalVerses);
    }
    throw new Error(`Chapter ${chapterNumber} of ${this.label} does not exist`);
  }

  equals(other: Book) {
    return this.name === other.name;
  }

  static *[Symbol.iterator]() {
    for (const book of BookList) {
      yield Book.find(book.names[0]);
    }
  }

  *[Symbol.iterator]() {
    for (const chapter of range(1, this.totalChapters + 1)) {
      yield this.chapter(chapter);
    }
  }

  [inspect.custom]() {
    return `[Book] ${this.label}`;
  }
}

export class Chapter implements Iterable<Verse> {
  constructor(
    readonly book: Book,
    readonly chapter: number,
    readonly totalVerses: number,
  ) {}

  static first() {
    return Book.first().firstChapter;
  }

  static last() {
    return Book.last().lastChapter;
  }

  static fromRef(ref: ScriptureReference) {
    return Book.fromRef(ref).chapter(ref.chapter);
  }

  static random(after?: Chapter) {
    const book = Book.random(after?.book);
    return book.randomChapter(after?.book.equals(book) ? after : undefined);
  }

  static isValid(book: Book, chapter: number) {
    try {
      book.chapter(chapter);
      return true;
    } catch {
      return false;
    }
  }

  get label() {
    return `${this.book.label} ${this.chapter}`;
  }

  get firstVerse() {
    return this.verse(1);
  }

  get lastVerse() {
    return this.verse(this.totalVerses);
  }

  get isFirst() {
    return this.chapter === 1;
  }

  get isLast() {
    return this.chapter === this.book.totalChapters;
  }

  get previousInBook(): Chapter | null {
    return this.isFirst ? null : this.book.chapter(this.chapter - 1);
  }

  get nextInBook(): Chapter | null {
    return this.isLast ? null : this.book.chapter(this.chapter + 1);
  }

  equals(other: Chapter) {
    return this.book.equals(other.book) && this.chapter === other.chapter;
  }

  randomVerse(after?: Verse) {
    return this.verse(random(after?.verse ?? 1, this.totalVerses));
  }

  verse(verseNumber: number) {
    if (verseNumber <= 0 || verseNumber > this.totalVerses) {
      throw new Error(`Verse ${verseNumber} of ${this.label} does not exist`);
    }
    return new Verse(this, verseNumber);
  }

  *[Symbol.iterator]() {
    for (const verseNum of range(1, this.totalVerses + 1)) {
      yield this.verse(verseNum);
    }
  }

  get verses() {
    return iterate(this);
  }

  [inspect.custom]() {
    return `[Chapter] ${this.label}`;
  }
}

export class Verse {
  constructor(readonly chapter: Chapter, readonly verse: number) {}

  static first() {
    return Chapter.first().firstVerse;
  }

  static last() {
    return Chapter.last().lastVerse;
  }

  static fromRef(ref: ScriptureReference) {
    return Chapter.fromRef(ref).verse(ref.verse);
  }

  static fromId(verseId: number) {
    // Start by converting the 0-indexed number to the 1-indexed verse total
    let versesRemaining = verseId + 1;

    let book: Book | null = Book.first();
    while (book && versesRemaining > 0) {
      // First narrow it down to the book
      if (versesRemaining - book.totalVerses > 0) {
        versesRemaining -= book.totalVerses;
        book = book.next;
        continue;
      }

      let chapter: Chapter | null = book.firstChapter;
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

  static random(after?: Verse) {
    const chapter = Chapter.random(after?.chapter);
    return chapter.randomVerse(
      after?.chapter.equals(chapter) ? after : undefined,
    );
  }

  static isValid(chapter: Chapter, verse: number) {
    try {
      chapter.verse(verse);
      return true;
    } catch {
      return false;
    }
  }

  get book() {
    return this.chapter.book;
  }

  get label() {
    return `${this.chapter.label}:${this.verse}`;
  }

  get isFirst() {
    return this.verse === 1;
  }

  get isLast() {
    return this.verse === this.chapter.totalVerses;
  }

  equals(other: Verse) {
    return this.id === other.id;
  }

  @Once()
  get id() {
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
    verseCount += this.verse;

    return verseCount;
  }

  get reference() {
    return {
      book: this.chapter.book.name,
      chapter: this.chapter.chapter,
      verse: this.verse,
    };
  }

  // For comparison
  // noinspection JSUnusedGlobalSymbols
  valueOf() {
    return this.id;
  }

  // For JSON.stringify()
  toJSON() {
    return this.reference;
  }

  [inspect.custom]() {
    return `[Verse] ${this.label}`;
  }
}
