import { registerDecorator, ValidationArguments } from 'class-validator';
import { many, Many } from '../../common/src';

/**
 * Decorator to ensure that only one of the fields in a class exists, or one
 * of the fields in a select group of fields in the class exists.
 *
 * @param fields - An optional array of fields or an array of an array of fields
 * of which each grouping is mutually exclusive. If any of the fields in
 * each group are present, the others must be null or undefined.
 *
 * Given the following class:
 *
 * class CharacterFealty {
 *     orcs?: boolean;
 *     elves?: boolean;
 *     humans?: boolean;
 *     dwarves?: boolean;
 *   }
 *
 * @example
 * @ExclusiveFieldExists()
 * fealty: CharacterFealty;
 *
 * The existence of any of the fields in CharacterFealty is mutually exclusive.
 *
 * @example
 * @ExclusiveFieldExists(['orcs', 'elves'])
 * fealty: CharacterFealty;
 *
 * The existence of 'orcs' and 'elves is mutually exclusive
 *
 * @example
 * @ExclusiveFieldExists([['orcs', 'elves'],['humans', 'dwarves']])
 * fealty: CharacterFealty;
 *
 * The existence of 'orcs' and 'elves is mutually exclusive, as is the existence
 * of 'humans' and 'dwarves'. However, 'orcs' and 'humans' can exist together.
 */
export const ExclusiveFieldExists = (
  fields?: Many<readonly string[]>,
): PropertyDecorator => {
  const groups = !fields
    ? []
    : Array.isArray(fields[0])
    ? (fields as ReadonlyArray<readonly string[]>)
    : ([fields] as ReadonlyArray<readonly string[]>);

  return (object: any, propertyName: string | symbol) => {
    registerDecorator({
      name: 'exclusiveFieldExists',
      target: object.constructor,
      propertyName: propertyName as string,
      validator: {
        validate: (value) => {
          const suppliedKeys = Object.entries(value).flatMap(([key, val]) =>
            val != null ? key : [],
          );
          if (groups.length === 0) {
            return suppliedKeys.length === 1;
          }
          return (
            groups.length > 1 &&
            !groups.some((fields) =>
              many(fields).every((field: string) =>
                suppliedKeys.includes(field),
              ),
            )
          );
        },
        defaultMessage: ({ value }: ValidationArguments) => {
          let message;

          const type = String(value.constructor.name);
          const suppliedKeys = Object.entries(value).flatMap(([key, val]) =>
            val != null ? key : [],
          );

          if (suppliedKeys.length === 0) {
            message = `Exactly one of ${type}'s fields must be given`;
          } else if (groups.length === 0) {
            message = `Only one of ${type}'s fields may exist, but received: ${suppliedKeys.join(
              ', ',
            )}`;
          } else if (groups.length === 1) {
            message =
              'Cannot validate against a single field; either supply an array of more than one field or remove all fields';
          } else {
            const match = groups.find((fields) =>
              many(fields).every((field: string) =>
                suppliedKeys.includes(field),
              ),
            );
            message = `Only one of these fields in ${type} may exist: ${many(
              match,
            ).join(', ')}`;
          }

          return message;
        },
      },
    });
  };
};
