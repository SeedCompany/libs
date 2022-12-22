import { TSESLint } from '@typescript-eslint/utils';

/**
 * The config for React projects
 */
export const config: TSESLint.Linter.Config = {
  extends: 'plugin:@seedcompany/base',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  parserOptions: {
    jsxPragma: null,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['jsx-a11y', 'react', 'react-hooks'],
  rules: {
    'no-restricted-properties': [
      'error',
      ...['require.ensure', 'System.import']
        .map((s) => s.split('.'))
        .map(([object, property]) => ({
          object,
          property,
          message:
            'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        })),
    ],

    //region React
    'react/display-name': 'error',
    'react/forbid-foreign-prop-types': [
      'warn',
      {
        allowInPropTypes: true,
      },
    ],
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
      },
    ],
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-constructed-context-values': 'error',
    'react/jsx-no-target-blank': 'warn',
    'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
    'react/no-find-dom-node': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-danger-with-children': 'warn',
    'react/void-dom-elements-no-children': 'error',

    // styling, has fixer
    'react/jsx-curly-brace-presence': [
      'warn',
      {
        props: 'never',
        children: 'never',
      },
    ],
    // styling, enforce shorthand, has fixer
    'react/jsx-fragments': 'warn',
    //endregion

    //region React Hooks
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    //endregion

    //region JSX A11y
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'warn',
      {
        aspects: ['noHref', 'invalidHref'],
      },
    ],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',
    //endregion
  },
  overrides: [
    // Allow default export on storybook files
    // https://storybook.js.org/docs/formats/component-story-format/
    {
      files: '*.stories.tsx',
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
