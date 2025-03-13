import { setToStringTag } from '@seedcompany/common';
import { expect, test } from 'vitest';
import {
  markSkipClassTransformation,
  shouldSkipTransform,
} from './class-transformer.patch.js';

class DataHolder {}

class AScalar {}
setToStringTag(AScalar, 'AScalar');
markSkipClassTransformation(AScalar);

test.each([
  [new DataHolder(), true],
  [new AScalar(), true],
  [{}, false],
  ['string', false],
  [null, false],
  [new Date(), false],
  [new Set(), false],
  [new Map(), false],
])('shouldSkipTransform(%o) -> %s', (val: unknown, result: boolean) => {
  expect(shouldSkipTransform(val)).toBe(result);
});
