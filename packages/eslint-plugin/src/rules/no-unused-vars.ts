import { rules } from '@typescript-eslint/eslint-plugin';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { Writable } from 'type-fest';

const baseRule = rules['no-unused-vars'];

export const noUnusedVars: TSESLint.RuleModule<string, any[]> = {
  meta: {
    ...baseRule.meta,
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const report = (descriptor: TSESLint.ReportDescriptor<string>) => {
      const node = (descriptor as unknown as { node?: TSESTree.Node }).node;
      if (!node) {
        return;
      }
      if (!node.parent || !isImportSpecifier(node.parent)) {
        context.report(descriptor);
        return;
      }

      (descriptor as Writable<typeof descriptor>).fix = (fixer) => {
        const sourceCode = context.getSourceCode();
        const unusedImport = node.parent as TSESTree.ImportSpecifier | TSESTree.ImportDefaultSpecifier;
        const declaration = unusedImport.parent as TSESTree.ImportDeclaration;
        const { specifiers: imports } = declaration;

        const removeBetween = (
          start: TSESTree.Token | TSESTree.BaseNode | null,
          end: TSESTree.Token | TSESTree.BaseNode | null,
        ) =>
          start && end
            ? fixer.removeRange([start.range[0], end.range[1]])
            : null;

        // ex. "import * as unused from 'module';"
        if (isNamespaceImportSpecifier(unusedImport)) {
          return fixer.remove(declaration);
        }

        // Import is not last, remove it and the following comma
        if (unusedImport !== imports[imports.length - 1]) {
          return removeBetween(
            unusedImport,
            sourceCode.getTokenAfter(unusedImport, isComma),
          );
        }

        // Import is a single default import
        // ex. "import module from 'module';"
        if (isDefaultImportSpecifier(unusedImport) && imports.length === 1) {
          return fixer.remove(declaration);
        }

        // Import is the only named import...
        if (imports.filter(isNamedImportSpecifier).length === 1) {
          // ...following a default import
          // ex. "import default, { unused } from 'module';"
          if (imports.some(isDefaultImportSpecifier)) {
            return removeBetween(
              sourceCode.getTokenBefore(unusedImport, isComma),
              sourceCode.getTokenAfter(unusedImport, isClosingBracket),
            );
          }
          // ...in the declaration
          // ex. "import { unused } from 'module';"
          return fixer.remove(declaration);
        }

        // Import is last following another, remove it and the comma before it
        return removeBetween(
          sourceCode.getTokenBefore(unusedImport, isComma),
          unusedImport,
        );
      };

      context.report(descriptor);
    };

    const contextForBaseRule = Object.create(context, {
      report: {
        value: report,
        writable: false,
      },
    });
    return baseRule.create(contextForBaseRule);
  },
};

const isImportSpecifier = (node: TSESTree.Node) =>
  isNamedImportSpecifier(node) ||
  isDefaultImportSpecifier(node) ||
  isNamespaceImportSpecifier(node);

const isNamespaceImportSpecifier = (
  node: TSESTree.Node,
): node is TSESTree.ImportNamespaceSpecifier => node.type === 'ImportNamespaceSpecifier';

const isNamedImportSpecifier = (node: TSESTree.Node): node is TSESTree.ImportSpecifier =>
  node.type === 'ImportSpecifier';

const isDefaultImportSpecifier = (node: TSESTree.Node): node is TSESTree.ImportDefaultSpecifier =>
  node.type === 'ImportDefaultSpecifier';

const isComma = (token: TSESTree.Token | TSESTree.Comment) => token.value === ',';

const isClosingBracket = (token: TSESTree.Token | TSESTree.Comment) => token.value === '}';
