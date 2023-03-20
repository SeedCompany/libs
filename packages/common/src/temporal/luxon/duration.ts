import { delayFnImpl, parseHumanToDurationLike } from '@seedcompany/common';
import { Duration, DurationLike } from 'luxon';
import { Writable } from 'type-fest';
import { inspect } from 'util';

/**
 * A duration represented as an:
 * - ISO string {@link Duration.fromISO}
 * - Human string {@link Duration.fromHuman}
 * - millisecond number {@link Duration.fromMillis}
 * - object literal {@link Duration.fromObject}
 * - Duration instance
 */
export type DurationIn = string | DurationLike;

declare module 'luxon/src/duration' {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- augmenting static class method
  namespace Duration {
    /**
     * Create from ISO, Human, ms number, std object, or another Duration.
     */
    export const from: (duration: DurationIn) => Duration;
    /**
     * Parse a humanized duration string.
     * @example
     * '1hour 20mins'
     * '27,681 ms'    // numeric separators
     * '2hr -40mins'  // negatives
     * '2e3 secs'     // exponents
     */
    export const fromHuman: (duration: string) => Duration;
  }
}

const D = Duration as Writable<typeof Duration>;

D.from = (input: DurationIn) =>
  typeof input === 'string'
    ? input.startsWith('P') || input.startsWith('-P')
      ? D.fromISO(input)
      : D.fromHuman(input)
    : D.fromDurationLike(input);

D.fromHuman = (input: string) =>
  Duration.fromObject(parseHumanToDurationLike(input));

// @ts-expect-error Yes, it doesn't have to be defined, we are adding it.
Duration.prototype[inspect.custom] = function (this: Duration) {
  const str = this.toHuman({ unitDisplay: 'short' });
  return `[Duration] ${str}`;
};

declare module '@seedcompany/common' {
  export interface DelayFn {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (duration: DurationIn): Promise<void>;
  }
}

delayFnImpl.current = async (duration: DurationIn) => {
  const d = Duration.from(duration);
  await new Promise((resolve) => setTimeout(resolve, d.toMillis()));
};
