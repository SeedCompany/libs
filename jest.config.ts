import type { JestConfigWithTsJest } from 'ts-jest';

export default (): JestConfigWithTsJest => ({
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testRegex: '\\.test\\.tsx?$',
  moduleNameMapper: {
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
