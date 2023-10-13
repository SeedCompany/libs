import { describe, expect, test } from '@jest/globals';
import { mapOf } from './map-of';
import { EntriesResult, mapEntries, mapKeys, mapValues } from './map-to';

const colorList = ['red', 'blue', 'green'] as const;
const colorRecord = {
  red: '#f00',
  green: '#0f0',
  blue: '#00f',
} as const;
const colorMap = mapOf(colorRecord);

const upperCase = <const T extends string>(str: T) =>
  str.toUpperCase() as Uppercase<T>;

describe('mapEntries', () => {
  test('fromRecord', () => {
    const result = mapEntries(colorRecord, ([color, hex], { SKIP }) =>
      color !== 'red' ? [`${color}!`, upperCase(hex)] : SKIP,
    ).asRecord;
    expect(result).toEqual({
      'green!': '#0F0',
      'blue!': '#00F',
    });
  });
  test('fromMap', () => {
    const result = mapEntries(colorMap, ([color, hex], { SKIP }) =>
      color !== 'red' ? [`${color}!`, upperCase(hex)] : SKIP,
    ).asRecord;
    expect(result).toEqual({
      'green!': '#0F0',
      'blue!': '#00F',
    });
  });
  test('fromList', () => {
    const result = mapEntries(colorList, (color, { SKIP }) =>
      color !== 'red' ? [`${color}!`, upperCase(color)] : SKIP,
    ).asRecord;
    expect(result).toEqual({
      'green!': 'GREEN',
      'blue!': 'BLUE',
    });
  });
  test('fromList helper', () => {
    const result = mapEntries.fromList(colorList, (color, { SKIP }) =>
      color !== 'red' ? [`${color}!`, upperCase(color)] : SKIP,
    ).asRecord;
    expect(result).toEqual({
      'green!': 'GREEN',
      'blue!': 'BLUE',
    });
  });
});

describe('mapKeys', () => {
  test('fromRecord', () => {
    const result = mapKeys(colorRecord, (color, hex, { SKIP }) =>
      color !== 'red' ? upperCase(hex) : SKIP,
    ).asRecord;
    expect(result).toEqual({
      '#0F0': '#0f0',
      '#00F': '#00f',
    });
  });
  test('fromMap', () => {
    const result = mapKeys(colorMap, (color, hex, { SKIP }) =>
      color !== 'red' ? upperCase(hex) : SKIP,
    ).asRecord;
    expect(result).toEqual({
      '#0F0': '#0f0',
      '#00F': '#00f',
    });
  });
  test('fromList', () => {
    const result = mapKeys.fromList(colorList, (color, { SKIP }) =>
      color !== 'red' ? upperCase(color) : SKIP,
    ).asRecord;
    expect(result).toEqual({
      GREEN: 'green',
      BLUE: 'blue',
    });
  });
});

describe('mapValues', () => {
  test('fromRecord', () => {
    const result = mapValues(colorRecord, (color, hex, { SKIP }) =>
      color !== 'red' ? upperCase(hex) : SKIP,
    ).asRecord;
    expect(result).toEqual({
      green: '#0F0',
      blue: '#00F',
    });
  });
  test('fromMap', () => {
    const result = mapValues(colorMap, (color, hex, { SKIP }) =>
      color !== 'red' ? upperCase(hex) : SKIP,
    ).asRecord;
    expect(result).toEqual({
      green: '#0F0',
      blue: '#00F',
    });
  });
  test('fromList', () => {
    const result = mapValues.fromList(colorList, (color, { SKIP }) =>
      color !== 'red' ? upperCase(color) : SKIP,
    ).asRecord;
    expect(result).toEqual({
      green: 'GREEN',
      blue: 'BLUE',
    });
  });
});

test('EntriesResult', () => {
  const result = new EntriesResult([
    ['green!', '#0F0'],
    ['blue!', '#00F'],
  ]);

  expect(result.asRecord).toEqual({
    'green!': '#0F0',
    'blue!': '#00F',
  });

  const map = result.asMap;
  expect(map).toBeInstanceOf(Map);
  expect(map.size).toBe(2);
  expect(map.get('green!')).toBe('#0F0');
  expect(map.get('blue!')).toBe('#00F');

  expect(result.entries).toEqual(
    expect.arrayContaining([
      ['green!', '#0F0'],
      ['blue!', '#00F'],
    ]),
  );

  expect([...result]).toEqual(
    expect.arrayContaining([
      ['green!', '#0F0'],
      ['blue!', '#00F'],
    ]),
  );
});
