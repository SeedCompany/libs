import type { Paths, PickDeep } from 'type-fest';

/**
 * Like `pick`, but the keys can be nested string paths.
 *
 * @example
 * ```ts
 * const info = {
 *   names: { first: 'carson', last: 'full' },
 *   colors: { favorite: 'blue', hate: 'orange', neutral: undefined }
 * };
 * pickPaths(info, [
 *   'names.first',
 *   'colors.favorite',
 *   'colors.neutral',
 *   'undeclared.path',
 * ]); //=> { names: { first: 'carson' }, colors: { favorite: 'blue' } }
 * ```
 */
export const pickDeep = <T extends object, K extends Paths<T>>(
  obj: T,
  paths: Iterable<K>,
): PickDeep<T, K> => {
  const out: Record<string, any> = {};
  for (const path of paths) {
    const segments = String(path).split('.');

    // traverse and gather info. stop when a segment is undefined
    const definedSegments = [];
    const indexesThatAreArrays = new Set<number>();
    let value = obj as Record<string, any> | undefined;
    for (const segment of segments) {
      value = value![segment];
      if (value === undefined) {
        break;
      }
      definedSegments.push(segment);
      if (Array.isArray(value)) {
        indexesThatAreArrays.add(definedSegments.length - 1);
      }
    }

    // push the value into the output object, creating objects/arrays as needed.
    definedSegments.reduce((subObject, segment, idx) => {
      if (idx === segments.length - 1) {
        if (value !== undefined) {
          subObject[segment] = value;
        }
        return subObject;
      }
      if (!subObject[segment]) {
        subObject[segment] = indexesThatAreArrays.has(idx) ? [] : {};
      }
      return subObject[segment];
    }, out);
  }
  return out as any;
};
