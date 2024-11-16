import { TSESLint } from '@typescript-eslint/utils';
import { expect, test } from 'vitest';
import * as configs from '../src/configs';

test.each(Object.entries(configs))('%s', async (name, config) => {
  const linter = new TSESLint.ESLint({
    baseConfig: config,
    useEslintrc: false,
    cwd: __dirname,
  });
  const [results] = await linter.lintFiles([`../src/configs/${name}.ts`]);
  expect(results.messages.map((m) => m.message)).toEqual([]);
  expect(results.usedDeprecatedRules).toHaveLength(0);
});
