import { rules } from '@typescript-eslint/eslint-plugin';
import type {
  BaseNode,
  Comment,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier as ImportNamedSpecifier,
  ImportNamespaceSpecifier,
  Node,
  Token,
} from '@typescript-eslint/types/dist/generated/ast-spec';
import {
  ReportDescriptor,
  RuleModule,
} from '@typescript-eslint/utils/dist/ts-eslint/Rule';
import { Writable as Mutable } from 'type-fest';

type ImportSpecifier = ImportNamedSpecifier | ImportDefaultSpecifier;

const baseRule = rules['no-unused-vars'];

export const noUnusedVars: RuleModule<string, any[]> = {
  meta: {
    ...baseRule.meta,
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const report = (descriptor: ReportDescriptor<string>) => {
      const node = (descriptor as unknown as { node?: Node }).node;
      if (!node) {
        return;
      }
      if (!node.parent || !isImportSpecifier(node.parent)) {
        context.report(descriptor);
        return;
      }

      (descriptor as Mutable<typeof descriptor>).fix = (fixer) => {
        const sourceCode = context.getSourceCode();
        const unusedImport = node.parent as ImportSpecifier;
        const declaration = unusedImport.parent as ImportDeclaration;
        const { specifiers: imports } = declaration;

        const removeBetween = (
          start: Token | BaseNode | null,
          end: Token | BaseNode | null,
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

const isImportSpecifier = (node: Node) =>
  isNamedImportSpecifier(node) ||
  isDefaultImportSpecifier(node) ||
  isNamespaceImportSpecifier(node);

const isNamespaceImportSpecifier = (
  node: Node,
): node is ImportNamespaceSpecifier => node.type === 'ImportNamespaceSpecifier';

const isNamedImportSpecifier = (node: Node): node is ImportSpecifier =>
  node.type === 'ImportSpecifier';

const isDefaultImportSpecifier = (node: Node): node is ImportDefaultSpecifier =>
  node.type === 'ImportDefaultSpecifier';

const isComma = (token: Token | Comment) => token.value === ',';

const isClosingBracket = (token: Token | Comment) => token.value === '}';
