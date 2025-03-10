import { patchMethod } from '@seedcompany/common';

/**
 * A small wrapper around {@link patchMethod} that forwards
 * the original method's metadata to the replaced method, if any.
 *
 * This is always safe to use instead of {@link patchMethod}.
 *
 * @see patchMethod
 */
export const patchDecoratedMethod: typeof patchMethod = (
  obj,
  name,
  replacer,
) => {
  const prev = Object.getOwnPropertyDescriptor(obj, name)?.value;
  const keys = typeof prev === 'function' ? Reflect.getMetadataKeys(prev) : [];
  const metadata = keys.map((key) => ({
    key,
    value: Reflect.getMetadata(key, prev),
  }));

  patchMethod(obj, name, replacer);

  const next = Object.getOwnPropertyDescriptor(obj, name)!.value;
  for (const { key, value } of metadata) {
    Reflect.defineMetadata(key, value, next);
  }
};
