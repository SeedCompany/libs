import {
  type TSESTree as AST,
  ASTUtils,
  type TSESLint as ESLint,
} from '@typescript-eslint/utils';
import ignore, { type Ignore } from 'ignore';
import type { JSONSchema4 as JSONSchema } from 'json-schema';
import interpolate from 'pupa';
import type { Merge } from 'type-fest';

type Many<T> = T | readonly T[];
type Maybe<T> = T | null | undefined;

export type ImportRestriction = Readonly<{
  /** Identify restriction by these paths */
  path?: Many<string>;
  /** Identify restriction by these patterns */
  pattern?: Many<string>;
  /** Limit restriction to only type or value imports only */
  kind?: ImportKind;
  /** Limit restriction to only these names/specifiers */
  importNames?: Many<string>;
  /** Allow these names/specifiers */
  allowNames?: Many<string>;
  message?: string;
  replacement?: ReplacementOrFn;
}>;

export type ReplacementOrFn = Replacement | ReplacementFn;

export type ReplacementFn = (
  args: ReplacementFnArgs,
) => Omit<Replacement, 'importNames'> & { importName?: string };
export interface ReplacementFnArgs {
  /** null if path declaration error */
  importName: string;
  /** null if path declaration error */
  localName: string;
  path: string;
}

export type Replacement = Readonly<{
  /**
   * The new replacement path
   */
  path?: string;
  /**
   * A mapping of restricted specifiers to their replacement names.
   * Any omissions here will leave the specifier unchanged.
   */
  importNames?: Readonly<Record<string, string>>;

  /**
   * A shortcut for replacement.importNames.
   * Useful, and ony allowed, when importNames is a single item.
   */
  importName?: string;
}>;

type ResolvedImportRestriction = Readonly<
  Merge<
    ImportRestriction,
    {
      path: ReadonlySet<string>;
      pattern?: Omit<Ignore, 'add'>;
      importNames?: ReadonlySet<string>;
      allowNames?: ReadonlySet<string>;
    }
  >
>;

const string: JSONSchema = { type: 'string', minLength: 1 };
const oneOrMore = (schema: JSONSchema) => ({
  anyOf: [
    schema,
    {
      type: 'array',
      items: schema,
      minItems: 1,
      uniqueItems: true,
    },
  ],
});
const oneOrMoreStrings = oneOrMore(string);

const importKind: JSONSchema = {
  type: 'string',
  enum: ['value', 'type'],
};
const schema: JSONSchema = {
  type: 'array',
  items: [
    {
      type: 'object',
      properties: {
        path: oneOrMoreStrings,
        pattern: oneOrMoreStrings,
        kind: importKind,
        importNames: oneOrMoreStrings,
        allowNames: oneOrMoreStrings,
        message: string,
        replacement: {}, // "any" to allow functions
      },
      additionalProperties: false,
    },
  ],
  minItems: 0,
};

const messages = {
  path: "'{{importSource}}' import is restricted from being used.",
  pathWithCustomMessage: '{{customMessage}}',

  everything: "'{{importName}}' import from '{{importSource}}' is restricted.",
  everythingWithCustomMessage: '{{customMessage}}',

  specifier: "'{{importName}}' import from '{{importSource}}' is restricted.",
  specifierWithCustomMessage: '{{customMessage}}',
};

export const rule: ESLint.RuleModule<
  keyof typeof messages,
  ImportRestriction[]
> = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages,
    schema,
  },
  defaultOptions: [],

  create(context) {
    const options = context.options;
    if (options.length === 0) {
      return {};
    }

    const resolved = options
      .map(
        (opt): ResolvedImportRestriction => ({
          ...opt,
          path: new Set<string>(castArray(opt.path)),
          pattern:
            opt.pattern && opt.pattern.length > 0
              ? ignore({
                  allowRelativePaths: true,
                  ignorecase: false, // import names are case-sensitive
                }).add(castArray(opt.pattern))
              : undefined,
          importNames: maybeCastSet(opt.importNames),
          allowNames: maybeCastSet(opt.allowNames),
        }),
      )
      .map((opt, i) => {
        if (
          (opt.importNames?.size ?? 0) > 1 &&
          typeof opt.replacement === 'object' &&
          opt.replacement.importName
        ) {
          throw new Error(
            `@seedcompany/no-restricted-imports [${i}].replacement.importName can only be used in when importNames is one item`,
          );
        }
        return opt;
      })
      .filter((opt) => opt.pattern || opt.path.size > 0);

    const checkNode = nodeChecker(context, resolved);
    return {
      ImportDeclaration: checkNode,
      ExportNamedDeclaration: checkNode,
      ExportAllDeclaration: checkNode,
    };
  },
};

/**
 * Checks a node to see if any problems should be reported.
 */
const nodeChecker =
  (
    context: Readonly<ESLint.RuleContext<any, unknown[]>>,
    resolved: ResolvedImportRestriction[],
  ) =>
  (node: DeclarationNode) => {
    if (!node.source) {
      return;
    }
    const importSource = node.source.value;

    // Skip `import {} from '..'` as it's unused and should be removed by another rule.
    if (
      node.type === 'ImportDeclaration' &&
      node.specifiers.length === 0 &&
      /import\s*{\s*}\s*from\s*.+/.test(context.getSourceCode().getText(node))
    ) {
      return;
    }

    const restrictions = resolved.filter((opt) => {
      if (opt.path.has(importSource)) {
        return true;
      }
      if (!opt.pattern) {
        return false;
      }
      return opt.pattern.ignores(importSource);
    });
    if (restrictions.length === 0) {
      return;
    }

    const declaration = new Declaration(node, context.getSourceCode());

    for (const specifier of declaration.specifiers) {
      const match = restrictions.find(matchSpecifierRestriction(specifier));
      if (!match) {
        continue;
      }
      const replacement = resolveSpecifierReplacement(specifier, match);
      context.report({
        ...reportSpecifier(specifier, match),
        fix: fixSpecifier(specifier, match, replacement),
      });
    }

    if (declaration.specifiers.length === 0) {
      const match = restrictions.find(matchDeclarationRestriction(declaration));
      if (!match) {
        return;
      }
      const replacement = resolveDeclarationReplacement(declaration, match);
      context.report({
        ...reportDeclaration(declaration, match),
        fix: fixDeclaration(declaration, match, replacement),
      });
    }
  };

const matchDeclarationRestriction =
  (declaration: Declaration) => (res: ResolvedImportRestriction) =>
    (!res.importNames || declaration.isExportALl) &&
    (res.kind ? res.kind === declaration.kind : true);

const matchSpecifierRestriction =
  (specifier: Specifier) => (res: ResolvedImportRestriction) =>
    (specifier.name === '*' ||
      ((res.importNames?.has(specifier.name) ?? true) &&
        !res.allowNames?.has(specifier.name))) &&
    (res.kind ? res.kind === specifier.effectiveKind : true);

const reportDeclaration = (
  declaration: Declaration,
  restriction: ResolvedImportRestriction,
): ReportDescriptor => ({
  node: declaration.node,
  messageId: `${restriction.importNames ? 'specifier' : 'path'}${
    restriction.message ? 'WithCustomMessage' : ''
  }`,
  data: {
    importSource: declaration.source.value,
    customMessage: restriction.message,
  },
});

const reportSpecifier = (
  specifier: Specifier,
  restriction: ResolvedImportRestriction,
): ReportDescriptor => ({
  node: specifier.node,
  messageId: `${
    restriction.importNames
      ? specifier.isNamespace
        ? 'everything'
        : 'specifier'
      : 'path'
  }${restriction.message ? 'WithCustomMessage' : ''}`,
  data: {
    importSource: specifier.source.value,
    importName:
      specifier.name === '*'
        ? restriction.importNames
          ? [...restriction.importNames].join(',')
          : '*'
        : specifier.name,
    customMessage: restriction.message,
  },
});

const resolveDeclarationReplacement = (
  declaration: Declaration,
  restriction: ResolvedImportRestriction,
) => {
  if (!restriction.replacement) {
    return null;
  }
  const { path } =
    typeof restriction.replacement === 'function'
      ? restriction.replacement({
          path: declaration.source.value,
          // @ts-expect-error This arg property should be typed as nullable
          // We leave it non-nullable, so it's easier to work with for the
          // majority use case, which is specifiers - not declarations (this).
          importName: undefined,
          // @ts-expect-error This arg property should be typed as nullable ^
          localName: undefined,
        })
      : restriction.replacement;
  const replacement = {
    path: maybe(path, (path) =>
      interpolate(path, {
        path: declaration.source.value,
      }),
    ),
  };
  return replacement;
};

const resolveSpecifierReplacement = (
  specifier: Specifier,
  restriction: ResolvedImportRestriction,
) => {
  if (!restriction.replacement) {
    return null;
  }
  let replacement;
  if (typeof restriction.replacement === 'function') {
    const result = restriction.replacement({
      importName: specifier.name,
      localName: specifier.node.local.name,
      path: specifier.declaration.source.value,
    });
    replacement = {
      path: result.path,
      importName: result.importName ?? specifier.name,
    };
  } else {
    const { importName, importNames, ...rest } = restriction.replacement;
    replacement = {
      ...rest,
      importName: importName ?? importNames?.[specifier.name] ?? specifier.name,
    };
  }
  const templateData = {
    path: specifier.source.value,
    localName: specifier.node.local.name,
  };
  const interpolated = {
    path: maybe(replacement.path, (path) => interpolate(path, templateData)),
    importName: interpolate(replacement.importName, templateData),
  };
  return interpolated;
};

const fixDeclaration =
  (
    declaration: Declaration,
    restriction: ResolvedImportRestriction,
    replacement: Maybe<{ path?: string | undefined }>,
  ) =>
  (fixer: ESLint.RuleFixer) => {
    if (!replacement) {
      return null;
    }
    if (
      declaration.node.type === 'ExportAllDeclaration' &&
      restriction.importNames
    ) {
      // Not worth trying to figure this out, namespace imports are rare anyway.
      return null;
    }

    return replacement.path
      ? fixer.replaceText(declaration.source, `'${replacement.path}'`)
      : null;
  };

const fixSpecifier =
  (
    specifier: Specifier,
    restriction: ResolvedImportRestriction,
    replacement: Maybe<{ path?: string | undefined; importName: string }>,
  ) =>
  (fixer: ESLint.RuleFixer) => {
    if (!replacement) {
      return null;
    }

    const node = specifier.node;
    const declaration = specifier.declaration;

    if (
      replacement.importName === 'default' &&
      !specifier.isDefault &&
      declaration.specifiers.some((s) => s !== specifier && s.isDefault)
    ) {
      // Import already has default, let human fix.
      return null;
    }

    if (specifier.isNamespace) {
      if (restriction.importNames) {
        // Not worth trying to figure this out, namespace imports are rare
        // anyway.
        return null;
      }
      return replacement.path
        ? fixer.replaceText(declaration.source, `'${replacement.path}'`)
        : null;
    }

    if (replacement.path) {
      const newImportSpecifier =
        replacement.importName === 'default' && node.type !== 'ExportSpecifier'
          ? node.local.name
          : `{ ${specifier.rename(replacement)} }`;
      const keyword = specifier.isExport ? 'export' : 'import';
      const newStatement = `${keyword} ${newImportSpecifier} from '${replacement.path}';`;

      if (specifier.isOnly) {
        return fixer.replaceText(declaration.node, newStatement);
      }

      const lastNamed =
        node.type === 'ImportSpecifier' &&
        declaration.specifiers.length === 2 &&
        declaration.specifiers[0]?.node.type === 'ImportDefaultSpecifier';

      const removalRange = lastNamed
        ? maybeRangeOf(
            specifier.getTokenBefore(ASTUtils.isCommaToken),
            specifier.getTokenAfter(ASTUtils.isClosingBraceToken),
          )
        : maybeRangeOf(
            specifier.isLast
              ? specifier.getTokenBefore(ASTUtils.isCommaToken)
              : node,
            specifier.getTokenAfterComma(),
          );
      if (!removalRange) {
        return null;
      }

      return [
        fixer.removeRange(removalRange),
        fixer.insertTextAfter(declaration.node, '\n' + newStatement),
      ];
    }

    // No path or specifier, nothing to change.
    if (!replacement.importName) {
      return null;
    }

    const newIsDefault = replacement.importName === 'default';

    if (specifier.isExport) {
      return fixer.replaceText(node, specifier.rename(replacement));
    }

    if (specifier.isOnly && newIsDefault) {
      const newSpecifier = node.local.name;

      const openingBracket = specifier.getTokenBefore(
        ASTUtils.isOpeningBraceToken,
      );
      const closingBracket = specifier.getTokenAfter(
        ASTUtils.isClosingBraceToken,
      );
      const brackets = maybeRangeOf(openingBracket, closingBracket);
      if (!brackets) {
        return null;
      }
      return fixer.replaceTextRange(brackets, newSpecifier);
    } else if (newIsDefault) {
      const openingBracket = specifier.getTokenBefore(
        ASTUtils.isOpeningBraceToken,
      );
      if (!openingBracket) {
        return null;
      }
      const removal = maybeRangeOf(
        specifier.isLast
          ? specifier.getTokenBefore(ASTUtils.isCommaToken)
          : node,
        specifier.getTokenAfterComma(),
      );
      if (!removal) {
        return null;
      }
      return [
        fixer.insertTextBefore(openingBracket, node.local.name + ', '),
        fixer.removeRange(removal),
      ];
    } else if (specifier.isDefault && specifier.isOnly) {
      return fixer.replaceText(node, `{ ${specifier.rename(replacement)} }`);
    } else if (specifier.isDefault) {
      const removalRange = rangeOf(node, specifier.getTokenAfterComma());
      const removeOldDefault = fixer.removeRange(removalRange);
      const otherIsNs = declaration.specifiers.some((sp) => sp.isNamespace);
      if (otherIsNs) {
        return [
          removeOldDefault,
          fixer.insertTextAfter(
            declaration.node,
            `\nimport { ${specifier.rename(replacement)} } from '${
              declaration.source.value
            }';`,
          ),
        ];
      }
      const openingBracket = specifier.getTokenAfter(
        ASTUtils.isOpeningBraceToken,
      );
      if (!openingBracket) {
        return null;
      }
      return [
        removeOldDefault,
        fixer.insertTextAfter(
          openingBracket,
          ` ${specifier.rename(replacement)},`,
        ),
      ];
    }

    return fixer.replaceText(node, specifier.rename(replacement));
  };

class Specifier {
  readonly name: string;
  constructor(
    readonly node: SpecifierNode,
    /** Declaration kind taken into account here as opposed to AST */
    readonly effectiveKind: ImportKind,
    readonly declaration: Declaration,
  ) {
    this.name =
      node.type === 'ImportSpecifier'
        ? node.imported.name
        : node.type === 'ImportDefaultSpecifier'
        ? 'default'
        : node.type === 'ImportNamespaceSpecifier'
        ? '*'
        : node.local.name;
  }
  get source() {
    return this.declaration.source;
  }

  get isDefault() {
    return this.node.type === 'ImportDefaultSpecifier';
  }
  get isNamespace() {
    return this.node.type === 'ImportNamespaceSpecifier';
  }
  get isExport() {
    return this.node.type === 'ExportSpecifier';
  }
  get isOnly() {
    return this.declaration.specifiers.length === 1;
  }
  get isLast() {
    return (
      this.declaration.specifiers[this.declaration.specifiers.length - 1]
        ?.node === this.node
    );
  }

  getTokenBefore<T extends ESLint.SourceCode.CursorWithSkipOptions>(
    options?: T,
  ) {
    return this.declaration.sourceCode.getTokenBefore(this.node, options);
  }
  getTokenAfter<T extends ESLint.SourceCode.CursorWithSkipOptions>(
    options?: T,
  ) {
    return this.declaration.sourceCode.getTokenAfter(this.node, options);
  }

  getTokenAfterComma() {
    const token = this.getTokenAfter(
      (token) =>
        ASTUtils.isCommaToken(token) || ASTUtils.isClosingBraceToken(token),
    );
    if (!token || ASTUtils.isClosingBraceToken(token)) {
      return this.node.range[1];
    }
    return (
      token.range[1] +
      (this.declaration.sourceCode.text[token.range[1]] === ' ' ? 1 : 0)
    );
  }

  rename(replacement: { importName: string }) {
    return replacement.importName === this.node.local.name
      ? replacement.importName
      : `${replacement.importName} as ${this.node.local.name}`;
  }
}

class Declaration {
  readonly specifiers: readonly Specifier[];
  readonly specifierNames: Set<string>;
  readonly kind: ImportKind;
  /** import path */
  readonly source: AST.StringLiteral;
  constructor(
    readonly node: DeclarationNode,
    readonly sourceCode: ESLint.SourceCode,
  ) {
    // This is the first thing we check in linter. It's only null for `export { foo };`
    // Non-null here to save headache everywhere else.
    this.source = node.source!;

    const specifiers =
      node.type === 'ExportAllDeclaration' ? [] : node.specifiers;

    let declarationKind =
      node.type === 'ImportDeclaration' ? node.importKind : node.exportKind;

    const getSpecifierKind = (
      node: SpecifierNode,
      declarationKind: ImportKind,
    ): ImportKind =>
      declarationKind === 'type'
        ? 'type'
        : node.type === 'ImportSpecifier'
        ? node.importKind
        : node.type === 'ExportSpecifier'
        ? node.exportKind
        : 'value';

    const specifierKinds = new Set(
      specifiers.map((specifier) =>
        getSpecifierKind(specifier, declarationKind),
      ),
    );
    // Treat these the same:
    // import { type Foo } from 'foo';
    // import type { Foo } from 'foo';
    if (specifierKinds.size > 0 && !specifierKinds.has('value')) {
      declarationKind = 'type';
    }
    this.kind = declarationKind;

    this.specifiers = specifiers.map(
      (sp) => new Specifier(sp, getSpecifierKind(sp, this.kind), this),
    );
    this.specifierNames = new Set(this.specifiers.map((sp) => sp.name));
  }

  get isExportALl() {
    return this.node.type === 'ExportAllDeclaration';
  }
}

const maybeRangeOf = (
  start: Maybe<AST.Node | AST.Token | number>,
  end: Maybe<AST.Node | AST.Token | number>,
): Readonly<AST.Range> | null => (start && end ? rangeOf(start, end) : null);
const rangeOf = (
  start: AST.Node | AST.Token | number,
  end: AST.Node | AST.Token | number,
): Readonly<AST.Range> => [
  typeof start === 'number' ? start : start.range[0],
  typeof end === 'number' ? end : end.range[1],
];

type ReportDescriptor = ESLint.ReportDescriptor<keyof typeof messages>;

type ImportKind = 'type' | 'value';

type DeclarationNode =
  | AST.ImportDeclaration
  | AST.ExportNamedDeclaration
  | AST.ExportAllDeclaration;
type SpecifierNode =
  | AST.ImportSpecifier
  | AST.ImportNamespaceSpecifier
  | AST.ImportDefaultSpecifier
  | AST.ExportSpecifier;

const castArray = <T>(arr: Maybe<Many<T>>): T[] =>
  !arr ? [] : Array.isArray(arr) ? arr : [arr as T];

const maybeCastSet = <T>(arr: Maybe<Many<T>>) =>
  arr && (Array.isArray(arr) ? arr.length > 0 : true)
    ? new Set<T>(castArray<T>(arr))
    : undefined;

const maybe = <T, R>(val: Maybe<T>, then: (val: T) => R) =>
  val ? then(val) : undefined;
