import {
  hasCtor,
  isObjectLike,
  isObjectStringTag,
  patchMethod,
} from '@seedcompany/common';
// @ts-expect-error not typed, but it is the file loaded at runtime
import { TransformOperationExecutor as TransformExecutor } from 'class-transformer/cjs/TransformOperationExecutor.js';

/**
 * Patch class-transformer to not re-transform class instances.
 * https://github.com/typestack/class-transformer/issues/1443
 * If encountered, the value is probably a custom scalar that GraphQL has already parsed.
 */
export const patchDoNotRetransformClassInstances = () => {
  patchMethod(TransformExecutor.prototype, 'transform', (orig) => (...args) => {
    const [_, value] = args;
    if (shouldSkipTransform(value)) {
      return value;
    }
    return orig(...args);
  });
};

/**
 * Use this method to mark your class instance to skip transformation.
 * This is only required if your class declares a custom {@link Symbol.toStringTag}
 * @example
 * class FooScalar {}
 * setToStringTag(FooScalar, 'FooScalar');
 * markSkipClassTransformation(FooScalar);
 */
export const markSkipClassTransformation = (cls: { prototype: unknown }) => {
  Object.defineProperty(cls.prototype, skip, {
    configurable: true,
    value: true,
  });
};

export const shouldSkipTransform = (value: unknown) =>
  isObjectLike(value) &&
  hasCtor(value) &&
  ((value as any)[skip] === true || isObjectStringTag(value));

const skip = Symbol.for('class-transformer.skipTransform');
