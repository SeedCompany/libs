/**
 * Parse a humanized duration string into a DurationLike object.
 *
 * Output from this can be passed into Luxon or Temporal Duration
 *
 * @example
 * '1hour 20mins'
 * '27,681 ms'    // numeric separators
 * '2hr -40mins'  // negatives
 * '2e3 secs'     // exponents
 */
export const parseHumanToDurationLike = (input: string) => {
  // Adapted from https://github.com/jkroso/parse-duration
  const durationRE =
    /(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)\s*([\p{L}]*)/giu;
  input = input.replace(/(\d)[,_](\d)/g, '$1$2');
  const result: { [K in Units]?: number } = {};
  input.replace(durationRE, (_, num, unit) => {
    result[normalizedUnit(unit)] = parseFloat(num);
    return '';
  });
  return result;
};

const normalizedUnit = (unit: string): Units => {
  unit = unit.toLowerCase();
  // Handle specially here before plural is removed, conflicting with min/sec.
  if (unit === '' || unit === 'ms') {
    return 'milliseconds';
  }
  unit = unit.replace(/s$/, '');
  /* eslint-disable prettier/prettier */
  switch (unit) {
    case 'sec': case '': return 'seconds';
    case 'min': case 'm': return 'minutes';
    case 'hr': case 'h': return 'hours';
    case 'd': return 'days';
    case 'wk': case 'w': return 'weeks';
    case 'yr': case 'y': return 'years';
  }
  /* eslint-enable prettier/prettier */

  if (validUnits.has(unit as Unit)) {
    return (unit + 's') as Units;
  }
  throw new Error('Unknown unit: ' + unit);
};

const validUnits = new Set<Unit>([
  'millisecond',
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
]);

type Units = `${Unit}s`;
type Unit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';
