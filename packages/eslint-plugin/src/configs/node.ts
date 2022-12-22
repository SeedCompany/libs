import { TSESLint } from '@typescript-eslint/utils';

/**
 * These rules should be able to be applied ot any node context
 */
export const config: TSESLint.Linter.Config = {
  extends: 'plugin:@seedcompany/base',
  rules: {},
};
