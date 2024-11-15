import { expect, test } from '@jest/globals';
import { type DurationLikeObject } from 'luxon';
import { parseHumanToDurationLike } from './parseHumanToDurationLike.js';

const full = {
  years: 1,
  months: 2,
  weeks: 3,
  days: 4,
  hours: 5,
  minutes: 6,
  seconds: 7,
  milliseconds: 8,
};
test.each([
  [
    '1 years, 2 months, 3 weeks, 4 days, 5 hours, 6 minutes, 7 seconds, 8 milliseconds',
    full,
  ],
  ['1 year 2 month 3 week 4 day 5 hour 6 minute 7 second 8 millisecond', full],
  ['1year 2month 3week 4day 5hour 6minute 7second 8millisecond', full],
  ['1yrs 2months 3wks 4days 5hrs 6mins 7secs 8ms', full],
  ['1yr 2month 3wk 4day 5hr 6min 7sec 8', full],
  ['1y 2month 3w 4d 5h 6m 7s 8', full],
  ['27,681 ms', { milliseconds: 27681 }],
  ['27,681', { milliseconds: 27681 }],
  ['2hr -40m', { hours: 2, minutes: -40 }],
  ['2hr-40m', { hours: 2, minutes: -40 }],
  ['2hr,4,200m', { hours: 2, minutes: 4200 }],
  ['2e3 secs', { seconds: 2e3 }],
])('valid cases', (input: string, output: DurationLikeObject) => {
  expect(parseHumanToDurationLike(input)).toEqual(output);
});

test('unknown case', () => {
  expect(() => parseHumanToDurationLike('5 x')).toThrowError(
    new Error('Unknown unit: x'),
  );
});
