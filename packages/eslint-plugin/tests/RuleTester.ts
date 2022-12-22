import { afterAll } from '@jest/globals';
import { clearCaches } from '@typescript-eslint/parser';
import { ParserOptions } from '@typescript-eslint/types';
import { ESLintUtils, TSESLint } from '@typescript-eslint/utils';
import { RuleTesterConfig } from '@typescript-eslint/utils/dist/ts-eslint';
import { RuleModule } from '@typescript-eslint/utils/dist/ts-eslint/Rule';
import {
  TestCaseError,
  ValidTestCase,
} from '@typescript-eslint/utils/dist/ts-eslint/RuleTester';
import * as path from 'path';
import { Writable as Mutable } from 'type-fest';

export type InferInvalidTestCaseFromRule<
  TRuleModule extends TSESLint.RuleModule<any, any>,
> = TSESLint.InvalidTestCase<
  ESLintUtils.InferMessageIdsTypeFromRule<TRuleModule>,
  ESLintUtils.InferOptionsTypeFromRule<TRuleModule>
>;

interface CorrectedInvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> extends ValidTestCase<TOptions> {
  /**
   * Expected errors or number of errors.
   */
  readonly errors: ReadonlyArray<TestCaseError<TMessageIds>> | number;

  /**
   * The expected code after autofixes are applied.
   * If set to `null`, the test runner will assert that no autofix is suggested.
   */
  readonly output?: string | null;
}

interface CorrectedRunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> {
  readonly valid: ReadonlyArray<ValidTestCase<TOptions> | string>;
  readonly invalid: ReadonlyArray<
    CorrectedInvalidTestCase<TMessageIds, TOptions>
  >;
}

export type MessagesOf<TRuleModule extends RuleModule<any>> =
  TRuleModule extends RuleModule<infer Messages> ? Messages : never;
export type OptionsOf<TRuleModule extends RuleModule<any>> =
  TRuleModule extends RuleModule<any, infer Options> ? Options : never;
export type InvalidTestCaseOf<TRuleModule extends RuleModule<any>> =
  CorrectedInvalidTestCase<MessagesOf<TRuleModule>, OptionsOf<TRuleModule>>;

const parser = '@typescript-eslint/parser';

export class RuleTester extends TSESLint.RuleTester {
  private readonly options: RuleTesterConfig;

  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(opts: Partial<RuleTesterConfig> = {}) {
    const options: RuleTesterConfig = {
      ...opts,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018,
        tsconfigRootDir: getFixturesRootDir(),
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
        ...opts.parserOptions,
      },
      parser: require.resolve(parser),
    };
    super(options);
    this.options = options;
  }

  private getFilename(options?: ParserOptions): string {
    if (options) {
      const filename = `file.ts${options.ecmaFeatures?.jsx ? 'x' : ''}`;
      if (options.project) {
        return path.join(getFixturesRootDir(), filename);
      }

      return filename;
    } else if (this.options.parserOptions) {
      return this.getFilename(this.options.parserOptions);
    }

    return 'file.ts';
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: CorrectedRunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;

    // standardize the valid tests as objects
    (tests as Mutable<typeof tests>).valid = tests.valid.map((test) => {
      if (typeof test === 'string') {
        return {
          code: test,
        };
      }
      return test;
    });

    tests.valid.forEach((test) => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
        if (!test.filename) {
          (test as Mutable<typeof test>).filename = this.getFilename(
            test.parserOptions,
          );
        }
      }
    });
    tests.invalid.forEach((test) => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
      if (!test.filename) {
        (test as Mutable<typeof test>).filename = this.getFilename(
          test.parserOptions,
        );
      }
    });

    super.run(
      name,
      rule,
      // @ts-expect-error I corrected the types to allow errors to be size as well
      tests,
    );
  }
}

export function getFixturesRootDir(): string {
  return path.join(process.cwd(), 'tests/fixtures/');
}

// make sure that the parser doesn't hold onto file handles between tests
// on linux (i.e. our CI env), there can be very a limited number of watch handles available
afterAll(() => {
  clearCaches();
});
