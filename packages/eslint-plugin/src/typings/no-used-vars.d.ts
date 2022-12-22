declare module '@typescript-eslint/eslint-plugin/dist/rules/no-unused-vars' {
  import { RuleModule } from '@typescript-eslint/utils/dist/ts-eslint/Rule';

  const rule: RuleModule<string, any[]>;
  // eslint-disable-next-line import/no-default-export
  export default rule;
}
