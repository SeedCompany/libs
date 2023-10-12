import { describe, expect, fit, it } from '@jest/globals';
import 'reflect-metadata';
import { plainToClass, Type } from 'class-transformer';
import { Validator } from 'class-validator';
import { ExclusiveFieldExists } from './exclusive-field.validator';

class CharacterAbility {
  strength?: number;
  stealth?: number;
  magic?: number;
}

class CharacterFealty {
  orcs?: boolean;
  elves?: boolean;
  humans?: boolean;
  dwarves?: boolean;
}

class AllOrNothingCharacterInput {
  @Type(() => CharacterAbility)
  @ExclusiveFieldExists()
  ability: CharacterAbility;
}

class InvalidCharacterInput {
  @Type(() => CharacterAbility)
  @ExclusiveFieldExists(['strength'])
  ability: CharacterAbility;
}

class OneOfTwoCharacterInput {
  @Type(() => CharacterFealty)
  @ExclusiveFieldExists(['orcs', 'elves'])
  fealty: CharacterFealty;
}

class OneOfTwoArrayCharacterInput {
  @Type(() => CharacterFealty)
  @ExclusiveFieldExists([
    ['orcs', 'elves'],
    ['humans', 'dwarves'],
  ])
  fealty: CharacterFealty;
}

const validator = new Validator();

describe('ExclusiveFieldExists', () => {
  describe('no parameters', () => {
    it('should throw zero errors if only one of the fields exist', async () => {
      const strongCharacter = { ability: { strength: 10 } };

      const errors = await validator.validate(
        plainToClass(AllOrNothingCharacterInput, strongCharacter),
      );
      expect(errors).toHaveLength(0);
    });

    it('should return specific error message if zero fields exist', async () => {
      const emptyCharacter = { ability: {} };

      const errors = await validator.validate(
        plainToClass(AllOrNothingCharacterInput, emptyCharacter),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toEqual({
        exclusiveFieldExists:
          "Exactly one of CharacterAbility's fields must be given",
      });
    });

    it('should return specific error message if more than one field exists', async () => {
      const invalidCharacter = {
        ability: { stealth: 5, magic: 4 },
      };

      const errors = await validator.validate(
        plainToClass(AllOrNothingCharacterInput, invalidCharacter),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toEqual({
        exclusiveFieldExists:
          "Only one of CharacterAbility's fields may exist, but received: stealth, magic",
      });
    });
  });

  describe('with parameters', () => {
    fit('should return specific error message if only one field is given', async () => {
      const invalidCharacter = {
        ability: { stealth: 5 },
      };

      const errors = await validator.validate(
        plainToClass(InvalidCharacterInput, invalidCharacter),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toEqual({
        exclusiveFieldExists:
          'Cannot validate against a single field; either supply an array of more than one field or remove all fields',
      });
    });
    it('should throw zero errors if only one of the given fields exist', async () => {
      const validFealtyCharacter = { fealty: { orcs: true } };

      const errors = await validator.validate(
        plainToClass(OneOfTwoCharacterInput, validFealtyCharacter),
      );
      expect(errors).toHaveLength(0);
    });

    it('should throw zero errors if more than one of the given fields in multiple sets do not exist', async () => {
      const validMultipleFealtyCharacter = {
        fealty: { elves: true, dwarves: true },
      };

      const errors = await validator.validate(
        plainToClass(OneOfTwoArrayCharacterInput, validMultipleFealtyCharacter),
      );
      expect(errors).toHaveLength(0);
    });

    it('should return specific error message if more than one of the given fields in a single set exists', async () => {
      const invalidFealtyCharacter = { fealty: { orcs: true, elves: true } };

      const errors = await validator.validate(
        plainToClass(OneOfTwoCharacterInput, invalidFealtyCharacter),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toEqual({
        exclusiveFieldExists:
          'Only one of these fields in CharacterFealty may exist: orcs, elves',
      });
    });

    it('should return specific error message if more than one of the given fields in multiple sets exist', async () => {
      const invalidMultipleFealtyCharacter = {
        fealty: { elves: true, humans: true, dwarves: true },
      };

      const errors = await validator.validate(
        plainToClass(
          OneOfTwoArrayCharacterInput,
          invalidMultipleFealtyCharacter,
        ),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toEqual({
        exclusiveFieldExists:
          'Only one of these fields in CharacterFealty may exist: humans, dwarves',
      });
    });
  });
});
