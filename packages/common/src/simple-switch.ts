/**
 * A simpler switch expression.
 *
 * This is only good when the possible options are simple values,
 * since all values must be evaluated before picking one.
 *
 * @example
 * simpleSwitch(val.__typename, { Image, Video, Audio });
 * @example
 * simpleSwitch(code, {
 *   InternalServerError: 'Server',
 *   BadRequest: 'Input',
 *   Forbidden: 'Unauthorized',
 *   Unauthorized: 'Unauthenticated',
 * })
 */
export const simpleSwitch = <const T, const K extends string = string>(
  key: K | null | undefined,
  options: Record<K, T>,
): T | undefined => (key ? options[key] : undefined);
