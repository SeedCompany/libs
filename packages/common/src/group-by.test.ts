import { describe, expect, test } from '@jest/globals';
import { groupBy, groupToMapBy } from './group-by';

const characters = {
  albus: { name: 'Albus Dumbledore', age: 115 },
  severus: { name: 'Severus Snape', age: 38 },
  harry: { name: 'Harry Potter', age: 17 },
  hermione: { name: 'Hermione Granger', age: 17 },
  ron: { name: 'Ron Weasley', age: 17 },
};
const entriesGroupedByAge = expect.arrayContaining([
  [
    17,
    expect.arrayContaining([
      characters.harry,
      characters.hermione,
      characters.ron,
    ]),
  ],
  [38, [characters.severus]],
  [115, [characters.albus]],
]);

describe('groupToMapBy', () => {
  test('with Array', () => {
    const grouped = groupToMapBy(
      Object.values(characters),
      (character) => character.age,
    );
    expect(grouped).toBeInstanceOf(Map);
    expect([...grouped]).toEqual(entriesGroupedByAge);

    // @ts-expect-error the map should be declared as readonly
    grouped.set(undefined, undefined);
  });

  test('with Iterable', () => {
    const grouped = groupToMapBy(
      new Map(Object.entries(characters)).values(),
      (character) => character.age,
    );
    expect([...grouped]).toEqual(entriesGroupedByAge);
  });
});

test('groupBy', () => {
  const grouped = groupBy(
    Object.values(characters),
    (character) => character.age,
  );
  expect(grouped).toBeInstanceOf(Array);
  expect(grouped).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([
        characters.harry,
        characters.hermione,
        characters.ron,
      ]),
      [characters.severus],
      [characters.albus],
    ]),
  );

  // @ts-expect-error the array should be declared as readonly
  grouped.push(undefined);
  // @ts-expect-error the array should be declared as readonly
  grouped[0].push(undefined);
});
