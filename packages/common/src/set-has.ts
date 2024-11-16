import { type WidenLiteral } from './types.js';

/**
 * A type helper to check if a set has a key
 * whose key is a bit looser than a set of literals.
 *
 * @example
 * const colors = new Set(['red', 'green', 'blue'] as const);
 * const userInput: string = 'blue';
 *
 * // This errors because userInput is not a color literal.
 * const validColor = colors.has(userInput);
 *
 * // This works
 * const validColor = setHas(colors, userInput);
 *
 * // It also narrows the key to the literal type
 * if (validColor) {
 *   // userInput is now 'red' | 'green' | 'blue'
 * }
 */
export const setHas = <T>(
  set: ReadonlySet<T>,
  key: WidenLiteral<T> & {},
): key is WidenLiteral<T> & {} & T => set.has(key as any);
