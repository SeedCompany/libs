/**
 * Join the items to a string after stripping nil/false conditions.
 *
 *  @example
 *  cleanJoin(', ', [
 *    'in the future',
 *    includeMonth ? month : null,
 *    includeYear ? year : null,
 *  ]);
 */
export const cleanJoin = (
  separator: string,
  list: ReadonlyArray<string | number | null | undefined | boolean>,
) => list.filter((item) => item != null && item !== false).join(separator);
