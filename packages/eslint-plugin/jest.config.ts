import type { JestConfigWithTsJest } from 'ts-jest';
import base from '../../jest.config';

const { testRegex, moduleNameMapper } = base();

// No ESM here yet.
// eslint-disable-next-line import/no-default-export
export default (): JestConfigWithTsJest => ({
  preset: 'ts-jest',
  testRegex,
  moduleNameMapper,
});
