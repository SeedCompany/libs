/**
 * @internal
 */
export const defineClassProp = <T extends { prototype: unknown } | object>(
  classOrObject: T,
  key: string | symbol,
  descriptor: PropertyDescriptor,
): T => {
  const proto = Object.hasOwn(classOrObject, 'prototype')
    ? (classOrObject as { prototype: unknown }).prototype
    : classOrObject;
  Object.defineProperty(proto, key, {
    configurable: true,
    ...descriptor,
  });
  return classOrObject;
};
