import type { PartialDeep } from 'type-fest';
import { describe, expect, test } from 'vitest';
import { pickDeep } from './pick-deep.js';
import { setOf } from './set-of.js';

describe('pickDeep', () => {
  const info = {
    names: { first: 'carson', last: 'full' },
    colors: { favorite: 'blue', hate: 'orange', neutral: undefined },
  };

  test('works', () => {
    const picked = pickDeep(info, ['names.first', 'colors.favorite']);
    expect(picked).toEqual({
      names: { first: 'carson' },
      colors: { favorite: 'blue' },
    });

    // @ts-expect-error the output type is narrowed.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    picked.colors.hate;
  });

  test('picks that are undefined are omitted', () => {
    const picked = pickDeep(info, ['colors.neutral']);
    // but parents are included to match types.
    expect(picked).toEqual({ colors: {} });
    expect(picked.colors.neutral).toBeUndefined();
  });

  test('unknown keys type error, ignored at runtime', () => {
    expect(
      // @ts-expect-error unknown keys aren't allowed, paths are strict
      pickDeep(info, ['unknown.key']),
    ).toEqual({}); // but still just ignores unknown at runtime.
  });

  test('optional keys', () => {
    const obj: PartialDeep<typeof info> = { names: {} };
    const picked = pickDeep(obj, ['names.first', 'colors.favorite']);
    expect(picked).toEqual({
      // created as an empty object because src has it declared
      names: {},
      // undefined because src doesn't have it declared
      colors: undefined,
    });
    expect(picked.names?.first).toBeUndefined();
    expect(picked.colors?.favorite).toBeUndefined();
  });

  test('paths can be a set', () => {
    expect(pickDeep(info, setOf(['names.first']))).toEqual({
      names: { first: 'carson' },
    });
  });

  test('nested arrays are maintained', () => {
    const obj = {
      events: [
        {
          5: { name: 'event 5' },
          10: { name: 'event 10' },
        },
      ],
    };
    const picked = pickDeep(obj, ['events.0.5.name']);
    expect(picked).toEqual({
      events: [{ 5: { name: 'event 5' } }],
    });
    expect(picked.events.length).toBe(1);
  });
});
