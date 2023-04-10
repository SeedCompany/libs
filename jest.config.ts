import type { JestConfigWithTsJest } from 'ts-jest';

export default (): JestConfigWithTsJest => ({
  preset: 'ts-jest/presets/default-esm',
  testRegex: '\\.test\\.tsx?$',
  moduleNameMapper: {
    '^@seedcompany/(.*)$': '<rootDir>/../$1/src',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      }
    ],
  },
});
