import { describe, expect, jest, test } from '@jest/globals';
import { DateTime } from 'luxon';
import { cmpBy, sortBy } from './sort-by';

describe('sortBy', () => {
  describe('simple primitives', () => {
    type PT<T> = [string, readonly T[], readonly T[]];
    test.each<PT<any>>([
      ['strings', ['b', 'd', 'a', 'c'], ['a', 'b', 'c', 'd']],
      ['numbers', [2, 4, 1, 3], [1, 2, 3, 4]],
      ['bigints', [2n, 4n, 1n, 3n], [1n, 2n, 3n, 4n]],
      [
        'nullable',
        [2, 4, null, 1, undefined, 3],
        [1, 2, 3, 4, null, undefined],
      ],
      [
        'Date / Symbol.toPrimitive',
        [
          new Date('2020-01-01'),
          new Date('2020-01-03'),
          new Date('2020-01-02'),
        ],
        [
          new Date('2020-01-01'),
          new Date('2020-01-02'),
          new Date('2020-01-03'),
        ],
      ],
      [
        'DateTime / .valueOf()',
        [
          DateTime.fromISO('2020-01-01'),
          DateTime.fromISO('2020-01-03'),
          DateTime.fromISO('2020-01-02'),
        ],
        [
          DateTime.fromISO('2020-01-01'),
          DateTime.fromISO('2020-01-02'),
          DateTime.fromISO('2020-01-03'),
        ],
      ],
    ])('%s', (_, input, sorted) => {
      expect(sortBy(input)).toEqual(sorted);
    });
  });

  test('single criterion desc', () => {
    expect(sortBy(['b', 'd', 'a', 'c'], [(x) => x, 'desc'])).toEqual([
      'd',
      'c',
      'b',
      'a',
    ]);
  });

  test('empty criteria remains unsorted', () => {
    const items = ['b', 'd', 'a', 'c'];
    expect(sortBy(items, [])).toEqual(items);
  });

  test('sortees are called well', () => {
    interface Palette {
      hex: string;
    }
    const sortee = jest.fn((palette: Palette) => palette.hex);
    expect(
      sortBy([{ hex: 'blue' }, { hex: 'red' }, { hex: 'green' }], sortee),
    ).toEqual([{ hex: 'blue' }, { hex: 'green' }, { hex: 'red' }]);
    expect(sortee).toHaveBeenCalled();
  });

  test('types are ergonomic', () => {
    expect(
      sortBy(
        [
          { rgb: 'rgb(0, 0, 0)' },
          null,
          { hex: 'yellow' },
          { rgb: null },
          { rgb: 'rgb(255, 255, 255)' },
          { hex: 'green' },
        ],
        // hex first, then rgb
        [(palette) => palette?.hex, (p) => p?.rgb],
      ),
    ).toEqual([
      { hex: 'green' },
      { hex: 'yellow' },
      { rgb: 'rgb(0, 0, 0)' },
      { rgb: 'rgb(255, 255, 255)' },
      null,
      { rgb: null },
    ]);
  });

  test('custom object', () => {
    class YearQuarter {
      constructor(public year: number, public quarter: number) {}
      [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') {
          return this.year * 10 + this.quarter;
        }
        return `Q${this.quarter} ${this.year}`;
      }
    }
    expect(
      sortBy(
        [
          { report: { quarter: new YearQuarter(2020, 1) } },
          { report: { quarter: new YearQuarter(2019, 4) } },
          { report: { quarter: new YearQuarter(2020, 2) } },
          { report: { quarter: new YearQuarter(2019, 3) } },
          { report: { quarter: new YearQuarter(2019, 1) } },
        ],
        (thing) => thing.report.quarter,
      ),
    ).toEqual([
      { report: { quarter: new YearQuarter(2019, 1) } },
      { report: { quarter: new YearQuarter(2019, 3) } },
      { report: { quarter: new YearQuarter(2019, 4) } },
      { report: { quarter: new YearQuarter(2020, 1) } },
      { report: { quarter: new YearQuarter(2020, 2) } },
    ]);

    // test class defaults to string primitive, indicating that we do prefer `number` hint when calling.
    expect(
      [
        new YearQuarter(2020, 1),
        new YearQuarter(2019, 4),
        new YearQuarter(2020, 2),
        new YearQuarter(2019, 3),
        new YearQuarter(2019, 1),
      ].map((s) => String(s)),
    ).toEqual(['Q1 2020', 'Q4 2019', 'Q2 2020', 'Q3 2019', 'Q1 2019']);
  });

  test('kitchen sink', () => {
    // @ts-expect-error asserts sort criteria is only optional when the input list is a SortableValue[]
    sortBy([{ name: 'Hermione Granger', age: 17 }]);

    expect(
      sortBy(
        [
          { name: 'Hermione Granger', age: 17 },
          { name: 'Ron Weasley', age: 17 },
          { name: 'Albus Dumbledore', age: 115 },
          { name: 'Harry Potter', age: 17 },
          { name: 'Severus Snape', age: 38 },
        ],
        // age first desc, then name asc
        [[(character) => character.age, 'desc'], (character) => character.name],
      ),
    ).toEqual([
      { name: 'Albus Dumbledore', age: 115 },
      { name: 'Severus Snape', age: 38 },
      { name: 'Harry Potter', age: 17 },
      { name: 'Hermione Granger', age: 17 },
      { name: 'Ron Weasley', age: 17 },
    ]);
  });
});

test('cmpBy interface is good and handles the bulk of logic', () => {
  expect(
    [
      { name: 'Hermione Granger', age: 17 },
      { name: 'Ron Weasley', age: 17 },
      { name: 'Albus Dumbledore', age: 115 },
      { name: 'Harry Potter', age: 17 },
      { name: 'Severus Snape', age: 38 },
    ].sort(
      cmpBy(
        // age first desc, then name asc
        [[(character) => character.age, 'desc'], (character) => character.name],
      ),
    ),
  ).toEqual([
    { name: 'Albus Dumbledore', age: 115 },
    { name: 'Severus Snape', age: 38 },
    { name: 'Harry Potter', age: 17 },
    { name: 'Hermione Granger', age: 17 },
    { name: 'Ron Weasley', age: 17 },
  ]);
});
