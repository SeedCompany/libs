import { TSESLint } from '@typescript-eslint/utils';
import restrictedGlobals from 'confusing-browser-globals';

/**
 * These rules should be able to be applied everywhere: browser, node, lambdas, etc.
 */
export const config: TSESLint.Linter.Config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  plugins: ['import', 'import-helpers', '@seedcompany'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  rules: {
    // region typescript-eslint

    // region recommended rules - deprecated
    // endregion

    // region recommended rules - tweaks

    '@typescript-eslint/restrict-plus-operands': [
      'error',
      {
        // I think this will be default in v4 (they considered it a BC break)
        checkCompoundAssignments: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        // enforce an actual comment instead of just a few chars
        minimumDescriptionLength: 20, // default 3
      },
    ],

    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        // disallow since it hides errors (required fields that are missing)
        objectLiteralTypeAssertions: 'never',
      },
    ],
    // Replacing with our own
    '@typescript-eslint/no-unused-vars': 'off',
    '@seedcompany/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/unbound-method': [
      'error',
      // We'll assume statics don't need scope, so don't need to be bound
      // We should have another lint rule to enforce static methods have
      // (this: unknown) so `this` isn't misused
      { ignoreStatic: true },
    ],
    // endregion

    // region recommended rules - loosening
    // Allow return types to be inferred
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // This is too invasive. Usage is discouraged though.
    '@typescript-eslint/no-explicit-any': 'off',
    // These 5 rules prevent `as any` from being used.
    // I would love to enable them at some point, but I think they need to be
    // opt-in for now.
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    // Loosen because we are still smarter than the compiler sometimes
    '@typescript-eslint/no-non-null-assertion': 'off',
    // I think we should be able to define async functions without using await.
    // We are defining the contract and setting up usages to be async which
    // requires design work. async code could come later.
    '@typescript-eslint/require-await': 'off',
    // endregion

    // region extension rules
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#extension-rules
    // These replace standard eslint rules to apply better to TS code.
    // This can be catching false positives using TS type info or handling special TS syntax.

    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': ['error'],

    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': 'error',

    'no-loss-of-precision': 'off',
    '@typescript-eslint/no-loss-of-precision': 'error',

    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'warn',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],

    // Revisit with ts-eslint v4 which has new code for scope management
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      // This disallows referencing before declaration (stricter, not looser)
      { functions: false, classes: false, variables: false, typedefs: false },
    ],

    'no-useless-constructor': 'off', // replace with TS version
    '@typescript-eslint/no-useless-constructor': 'error',

    // endregion

    // region other rules
    '@typescript-eslint/array-type': [
      'warn',
      // Simple is more friendly until generics are thrown in
      { default: 'array-simple' },
    ],
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'warn',
      // public is default, omit it. Follows same thought process as inferred types.
      // This doesn't need an override for parameter properties, because those
      // should always be readonly.
      { accessibility: 'no-public' },
    ],
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/no-confusing-non-null-assertion': 'warn',
    '@typescript-eslint/no-confusing-void-expression': [
      'warn',
      { ignoreArrowShorthand: true, ignoreVoidOperator: true },
    ],
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'warn',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-qualifier': 'warn',
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
    '@typescript-eslint/non-nullable-type-assertion-style': 'warn',
    '@typescript-eslint/prefer-enum-initializers': 'warn',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-literal-enum-member': 'error',
    // '@typescript-eslint/prefer-nullish-coalescing': 'warn', // TODO Research
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    // TODO Considering but it might be too invasive
    // '@typescript-eslint/prefer-readonly-parameter-types': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    // This doesn't seem to add a lot of value, and is annoying with arrow functions
    // common example: Promise.all(item => handle(item))
    // If we do re-enable I would consider with the option `checkArrowFunctions: false`
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/require-array-sort-compare': 'error',
    // '@typescript-eslint/restrict-template-expressions': 'error', // TODO maybe
    // This importantly catches promises inside of try/catch/finally statements
    // and is the only tool that enforces correct usage. Enabled "always" option
    // to ensure that call site is captured in stack traces.
    '@typescript-eslint/return-await': ['error', 'always'],
    // TODO consider this
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/sort-type-union-intersection-members.md
    // '@typescript-eslint/sort-type-union-intersection-members': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    // endregion

    // endregion

    // region Rules taken from Create React App which apply everywhere
    // Some have been omitted if they are already covered by
    // TypeScript, Prettier, or other configured rules
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-caller': 'warn',
    'no-cond-assign': 'error',
    'no-control-regex': 'warn',
    'no-eval': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-labels': 'warn',
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-mixed-operators': [
      'warn',
      {
        groups: [
          ['&', '|', '^', '~', '<<', '>>', '>>>'],
          ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
          ['&&', '||'],
          ['in', 'instanceof'],
        ],
        allowSamePrecedence: false,
      },
    ],
    'no-multi-str': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-wrappers': 'warn',
    'no-octal-escape': 'warn',
    'no-restricted-globals': ['error', ...restrictedGlobals],
    'no-script-url': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-rename': 'warn',
    strict: ['warn', 'never'],
    'unicode-bom': ['warn', 'never'],
    // endregion

    // region Others
    'array-callback-return': 'error',
    'no-lonely-if': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForStatement',
        message: 'Use a for..of loop instead. They are more concise.',
      },
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want.\n ' +
          'Use Object.{keys,values,entries}, and iterate over the resulting array with a for..of loop.',
      },
      {
        selector: "ImportDeclaration[source.value='.']",
        message: 'Import from sibling file instead of referencing self',
      },
    ],
    'no-trailing-spaces': [
      'warn',
      {
        skipBlankLines: false,
        ignoreComments: false,
      },
    ],
    'one-var': ['error', 'never'],
    'operator-assignment': 'error',
    'prefer-exponentiation-operator': 'error',
    // endregion

    // region Import/Export rules
    // TS handles errors, so these are just for styling
    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-default-export': 'warn',
    'import/no-useless-path-segments': 'warn',
    'import/no-duplicates': 'warn',
    // Orders import statements
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'never',
        groups: ['module', '/^~//', 'absolute', ['parent', 'sibling', 'index']],
        alphabetize: {
          order: 'asc',
          ignoreCase: true,
        },
      },
    ],
    // Alphabetizes imports within modules (curly brackets)
    'sort-imports': [
      'warn',
      {
        // leave it to import-helpers/order-imports
        ignoreDeclarationSort: true,
        // a,Z instead of Z,a
        ignoreCase: true,
      },
    ],
    // endregion

    'prettier/prettier': 'warn',
  },
};
