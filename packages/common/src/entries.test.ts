/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/no-unnecessary-condition */
// noinspection BadExpressionStatementJS

import { expect, test } from '@jest/globals';
import { entries } from './entries.js';

test('entries works', () => {
  const colors = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
  } as const;
  const expected = Object.entries(colors);

  const fromRecord = entries(colors);
  expect(fromRecord).toEqual(expected);
  // @ts-expect-error the keys should be strict
  fromRecord[0][0] === 'yellow';
  for (const [name, hex] of fromRecord) {
    // @ts-expect-error inference should succeed making these keys strict
    name === 'yellow';
    if (name === 'red') {
      // @ts-expect-error pairs should be inferred as unique and narrow down to correct value from the associated key
      hex === '#0000ff';
    }
  }
  // @ts-expect-error the array should be declared as readonly
  fromRecord.push(undefined);
  // @ts-expect-error the tuple should be declared as readonly
  fromRecord[0].push(undefined);

  // Map input works
  const colorMap = new Map(Object.entries(colors));
  expect(entries(colorMap)).toEqual(expected);

  // Array input is a no-op
  expect(entries(fromRecord)).toEqual(expected);
});

test('should infer strict keys from partial record', () => {
  const colors: Partial<Record<'red' | 'blue' | 'green', string>> = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
  };

  const fromRecord = entries(colors);
  expect(fromRecord).toEqual(Object.entries(colors));
  // @ts-expect-error inference should succeed making these keys strict
  fromRecord[0][0] === 'yellow';

  for (const [name, _hex] of fromRecord) {
    // @ts-expect-error inference should succeed making these keys strict
    name === 'yellow';
  }
});

test('strict entry pairs', () => {
  class Car {
    drive() {
      // drove
    }
  }
  class Dog {
    bark() {
      // barked
    }
  }
  const things = { Car, Dog };

  for (const [name, thingCls] of entries(things)) {
    if (name === 'Car') {
      new thingCls().drive();
    }
    if (name === 'Dog') {
      new thingCls().bark();
    }
  }
});

test('array index entries', () => {
  const colors = ['red', 'green', 'blue'];

  const fromRecord = entries(colors.entries());
  expect(fromRecord).toEqual([
    [0, 'red'],
    [1, 'green'],
    [2, 'blue'],
  ]);
  // @ts-expect-error keys should be numbers
  fromRecord[0][0] as string;
  // @ts-expect-error values should be strings
  fromRecord[0][1] as number;
});
