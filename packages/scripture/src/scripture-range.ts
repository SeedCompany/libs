export interface Range<T> {
  start: T;
  end: T;
}

export const mapRange = <T, U = T>(
  input: Range<T>,
  mapper: (point: T) => U,
): Range<U> => ({
  start: mapper(input.start),
  end: mapper(input.end),
});
