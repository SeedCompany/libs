import { describe, expect, test } from '@jest/globals';
import { simpleSwitch } from './simple-switch';

describe('simpleSwitch', () => {
  const options = {
    InternalServerError: 'Server',
    BadRequest: 'Input',
    Forbidden: 'Unauthorized',
    Unauthorized: 'Unauthenticated',
  } as const;
  test('simple', () => {
    const mapped = simpleSwitch('Forbidden', options);
    expect(mapped).toBe('Unauthorized');
  });
  test('unmatched is undefined', () => {
    const unknown = simpleSwitch('Unknown' as string, options);
    expect(unknown).toBe(undefined);
    // @ts-expect-error option keys must match first arg
    simpleSwitch('Unknown', options);
    // @ts-expect-error option keys must try to be exhaustive
    simpleSwitch('red' as 'red' | 'blue', {
      red: 'green',
    });
  });
  test('types', () => {
    const out = simpleSwitch('Forbidden', options);
    // @ts-expect-error Expected output items to have correctly inferred generic
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,@typescript-eslint/no-unused-expressions
    out === 'Unknown';

    // @ts-expect-error option keys must match first arg
    simpleSwitch('Unknown', options);

    // @ts-expect-error option keys must try to be exhaustive
    simpleSwitch('red' as 'red' | 'blue', {
      red: 'green',
    });
  });
});
