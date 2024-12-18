import { expect, test } from 'vitest';
import { entries } from './entries.js';
import { mapOf } from './map-of.js';

test('mapOf works', () => {
  const map = mapOf({
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
  });
  expect(map).toBeInstanceOf(Map);
  // @ts-expect-error the map should be declared as readonly
  map.set(undefined, undefined);
  // @ts-expect-error the keys should be strict
  map.get('yellow');

  // Map input works
  expect(mapOf(map)).toEqual(map);

  // Entries input works
  expect(mapOf(entries(map))).toEqual(map);
});
