import { TSESLint } from '@typescript-eslint/utils';

/**
 * The config for NestJS projects
 */
export const config: TSESLint.Linter.Config = {
  extends: 'plugin:@seedcompany/node',
  rules: {
    // This gives false positives for NestJS modules
    // TODO PR option to allow decorated classes?
    // Following suit of https://github.com/typescript-eslint/typescript-eslint/pull/2295
    '@typescript-eslint/no-extraneous-class': 'off',
  },
};
