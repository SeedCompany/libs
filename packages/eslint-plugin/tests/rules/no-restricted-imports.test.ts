import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { rule } from '../../src/rules/no-restricted-imports';
import { RuleTester } from '../RuleTester';

new RuleTester().run('@seedcompany/no-restricted-imports', rule, {
  valid: [
    'import os from "os";',
    { code: 'import os from "os";', options: [{ path: 'osx' }] },
    { code: 'import fs from "fs";', options: [{ path: 'crypto' }] },
    {
      code: 'import path from "path";',
      options: [{ path: ['crypto', 'stream', 'os'] }],
    },
    {
      code: 'import path from "path";',
      options: [{ path: 'crypto' }, { path: 'stream' }, { path: 'os' }],
    },
    { code: 'import "foo"', options: [{ path: 'crypto' }] },
    { code: 'import "foo/bar";', options: [{ path: 'foo' }] },
    {
      code: 'import withPaths from "foo/bar";',
      options: [{ path: ['foo', 'bar'] }],
    },
    {
      code: 'import type withPaths from "foo/bar";',
      options: [{ path: ['foo/bar'], kind: 'value' }],
    },
    {
      code: 'import withPatterns from "foo/bar";',
      options: [{ pattern: ['foo/c*'] }],
    },
    {
      code: 'import type withPatterns from "foo/bar";',
      options: [{ pattern: ['foo/*'], kind: 'value' }],
    },
    { code: "import foo from 'foo';", options: [{ path: ['../foo'] }] },
    { code: "import foo from 'foo';", options: [{ pattern: ['../foo'] }] },
    { code: "import foo from 'foo';", options: [{ path: '/foo' }] },
    "import relative from '../foo';",
    {
      code: "import relative from '../foo';",
      options: [{ path: '../notFoo' }],
    },
    {
      code: "import relativeWithPaths from '../foo';",
      options: [{ path: ['../notFoo'] }],
    },
    {
      code: "import relativeWithPatterns from '../foo';",
      options: [{ pattern: ['notFoo'] }],
    },
    "import absolute from '/foo';",
    { code: "import absolute from '/foo';", options: [{ path: '/notFoo' }] },
    {
      code: "import absoluteWithPaths from '/foo';",
      options: [{ path: ['/notFoo'] }],
    },
    {
      code: "import absoluteWithPatterns from '/foo';",
      options: [{ pattern: ['notFoo'] }],
    },
    {
      code: 'import withPatternsAndPaths from "foo/bar";',
      options: [{ path: ['foo'], pattern: ['foo/c*'] }],
    },
    {
      code: 'import withGitignores from "foo/bar";',
      options: [{ pattern: ['foo/*', '!foo/bar'] }],
    },
    {
      code: 'import withPatterns from "foo/bar";',
      options: [
        {
          pattern: ['foo/*', '!foo/bar'],
          message: 'foo is forbidden, use bar instead',
        },
      ],
    },
    {
      code: 'import AllowedObject from "foo";',
      options: [
        {
          path: ['foo'],
          importNames: ['DisallowedObject'],
        },
      ],
    },
    {
      code: 'import DisallowedObject from "foo";',
      options: [
        {
          path: ['foo'],
          importNames: ['DisallowedObject'],
        },
      ],
    },
    {
      code: 'import * as DisallowedObject from "foo";',
      options: [
        {
          path: ['bar'],
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import type * as DisallowedObject from "foo";',
      options: [
        {
          path: ['foo'],
          importNames: ['DisallowedObject'],
          kind: 'value',
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import { AllowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import type { AllowedObject } from "path";',
      options: [
        {
          path: 'path',
          kind: 'value',
        },
      ],
    },
    {
      code: 'export type { AllowedObject } from "path";',
      options: [
        {
          path: 'path',
          kind: 'value',
        },
      ],
    },
    {
      code: 'import { type AllowedObject } from "path";',
      options: [
        {
          path: 'path',
          kind: 'value',
        },
      ],
    },
    {
      code: 'import { type AllowedObject } from "pattern/foo";',
      options: [
        {
          pattern: 'pattern/*',
          kind: 'value',
        },
      ],
    },
    {
      code: 'import type { AllowedObject } from "specifier";',
      options: [
        {
          path: 'specifier',
          importNames: ['AllowedObject'],
          kind: 'value',
        },
      ],
    },
    {
      code: 'export type { AllowedObject } from "specifier";',
      options: [
        {
          path: 'specifier',
          importNames: ['AllowedObject'],
          kind: 'value',
        },
      ],
    },
    {
      code: 'import { type AllowedObject } from "specifier";',
      options: [
        {
          path: 'specifier',
          importNames: ['AllowedObject'],
          kind: 'value',
        },
      ],
    },
    {
      code: 'import {  } from "foo";',
      options: [
        {
          path: 'foo',
        },
      ],
    },
    {
      code: 'import {  } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
        },
      ],
    },
    {
      code: 'import { DisallowedObject } from "foo";',
      options: [
        {
          path: 'bar',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import { AllowedObject as DisallowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import { AllowedObject, AllowedObjectTwo } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import { AllowedObject, AllowedObjectTwo  as DisallowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import AllowedObjectThree, { AllowedObject as AllowedObjectTwo } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import AllowedObject, { AllowedObjectTwo as DisallowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import AllowedObject, { AllowedObjectTwo as DisallowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject', 'DisallowedObjectTwo'],
          message:
            "Please import 'DisallowedObject' and 'DisallowedObjectTwo' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import AllowedObject, * as DisallowedObject from "foo";',
      options: [
        {
          path: 'bar',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
    },
    {
      code: 'import onlyDefault from "foo";',
      options: [
        {
          path: 'foo',
          allowNames: 'default',
        },
      ],
    },
    {
      code: 'import { onlyName } from "foo";',
      options: [
        {
          path: 'foo',
          allowNames: ['onlyName'],
        },
      ],
    },
    {
      code: 'import { good, fine } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['bad'],
          allowNames: ['fine'],
        },
      ],
    },
    {
      code: 'import "foo-without-restricted-specifiers";',
      options: [
        {
          path: 'foo-without-restricted-specifiers',
          importNames: ['DisallowedObject', 'DisallowedObjectTwo'],
        },
      ],
    },
    {
      code: `import {
AllowedObject,
DisallowedObject, // eslint-disable-line
} from "foo";`,
      options: [{ path: 'foo', importNames: ['DisallowedObject'] }],
    },
    {
      code: 'export type * from "path";',
      options: [
        {
          path: 'path',
          kind: 'value',
        },
      ],
    },
    {
      code: 'export type * from "specifier";',
      options: [
        {
          path: 'specifier',
          importNames: ['DisallowedObject'],
          kind: 'value',
        },
      ],
    },
    {
      code: 'export * from "safe-path";',
      options: [{ path: 'bar' }],
    },
    {
      code: 'export * from "safe-specifier";',
      options: [
        {
          path: 'bar',
          importNames: ['DisallowedObject'],
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'import "fs"',
      options: [{ path: 'fs' }],
      errors: [
        {
          messageId: 'path',
          data: { importSource: 'fs' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'import "foo/bar";',
      options: [{ path: 'foo/bar' }],
      errors: [
        {
          messageId: 'path',
          data: { importSource: 'foo/bar' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 1,
          endColumn: 18,
        },
      ],
    },
    {
      code: 'import withPaths from "foo/bar";',
      options: [{ path: ['foo/bar'] }],
      errors: [
        {
          messageId: 'path',
          data: { importSource: 'foo/bar' },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'import type withPaths from "foo/bar";',
      options: [{ path: ['foo/bar'] }],
      errors: [
        {
          messageId: 'path',
          data: { importSource: 'foo/bar' },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 13,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'import withPatterns from "foo/bar";',
      options: [{ pattern: ['foo'] }],
      errors: [
        {
          messageId: 'path',
          data: { importSource: 'foo/bar' },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 20,
        },
      ],
    },
    {
      code: 'import withPatterns2 from "foo/bar";',
      options: [{ pattern: ['bar'] }],
      errors: [
        {
          messageId: 'path',
          data: { importSource: 'foo/bar' },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'import withPatterns3 from "foo/baz";',
      options: [
        {
          pattern: ['foo/*', '!foo/bar'],
          message: 'foo is forbidden, use foo/bar instead',
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          data: {
            importSource: 'foo/baz',
            customMessage: 'foo is forbidden, use foo/bar instead',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'import withPatterns4 from "foo/baz";',
      options: [
        {
          pattern: ['foo/bar', 'foo/baz'],
          message: 'some foo subimports are restricted',
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          data: {
            importSource: 'foo/baz',
            customMessage: 'some foo subimports are restricted',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'import withPatterns5 from "foo/bar";',
      options: [{ pattern: ['foo/bar'] }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'foo/bar',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'import withGitignores from "foo/bar";',
      options: [{ pattern: ['foo/*', '!foo/baz'] }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'foo/bar',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'export * from "fs";',
      options: [{ path: 'fs' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'fs',
          },
          type: AST_NODE_TYPES.ExportAllDeclaration,
          line: 1,
          column: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: 'export type * from "fs";',
      options: [{ path: 'fs' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'fs',
          },
          type: AST_NODE_TYPES.ExportAllDeclaration,
          line: 1,
          column: 1,
          endColumn: 25,
        },
      ],
    },
    {
      code: 'export * as ns from "fs";',
      options: [{ path: 'fs' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'fs',
          },
          type: AST_NODE_TYPES.ExportAllDeclaration,
          line: 1,
          column: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'export {a} from "fs";',
      options: [{ path: 'fs' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'fs',
          },
          type: AST_NODE_TYPES.ExportSpecifier,
          line: 1,
          column: 9,
          endColumn: 10,
        },
      ],
    },
    {
      code: 'export type {a} from "fs";',
      options: [{ path: 'fs' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'fs',
          },
          type: AST_NODE_TYPES.ExportSpecifier,
          line: 1,
          column: 14,
          endColumn: 15,
        },
      ],
    },
    {
      code: 'export {foo as b} from "fs";',
      options: [
        {
          path: 'fs',
          importNames: ['foo'],
          message: "Don't import 'foo'.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'fs',
            importName: 'foo',
            customMessage: "Don't import 'foo'.",
          },
          type: AST_NODE_TYPES.ExportSpecifier,
          line: 1,
          column: 9,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'export * as ns from "fs";',
      options: [
        {
          path: 'fs',
          importNames: ['foo'],
          message: "Don't import 'foo'.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'fs',
            importName: 'foo',
            customMessage: "Don't import 'foo'.",
          },
          type: AST_NODE_TYPES.ExportAllDeclaration,
          line: 1,
          column: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'import withGitignores from "foo";',
      options: [
        {
          path: 'foo',
          message: "Please import from 'bar' instead.",
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          data: {
            importSource: 'foo',
            customMessage: "Please import from 'bar' instead.",
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'import withGitignores from "bar";',
      options: [
        { path: 'foo' },
        {
          path: 'bar',
          message: "Please import from 'baz' instead.",
        },
        { path: 'baz' },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          data: {
            importSource: 'bar',
            customMessage: "Please import from 'baz' instead.",
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'import withGitignores from "foo";',
      options: [
        {
          path: 'foo',
          message: "Please import from 'bar' instead.",
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          data: {
            importSource: 'foo',
            customMessage: "Please import from 'bar' instead.",
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'import DisallowedObject from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['default'],
          allowNames: ['ok'],
          message:
            "Please import the default import of 'foo' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importName: 'default',
            customMessage:
              "Please import the default import of 'foo' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'import type DisallowedObject from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['default'],
          message:
            "Please import the default import of 'foo' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importName: 'default',
            customMessage:
              "Please import the default import of 'foo' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 13,
          endColumn: 29,
        },
      ],
    },
    {
      code: 'import * as All from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'everythingWithCustomMessage',
          data: {
            importSource: 'foo',
            importName: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          line: 1,
          column: 8,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'import type * as All from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'everythingWithCustomMessage',
          data: {
            importSource: 'foo',
            importName: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          line: 1,
          column: 13,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'export * from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ExportAllDeclaration,
          line: 1,
          column: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'export * from "bar";',
      options: [
        {
          path: 'bar',
          importNames: ['DisallowedObject1, DisallowedObject2'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'bar',
          },
          type: AST_NODE_TYPES.ExportAllDeclaration,
          line: 1,
          column: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: 'import { DisallowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 10,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'import { DisallowedObject as AllowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 10,
          endColumn: 43,
        },
      ],
    },
    {
      code: 'import { AllowedObject, DisallowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 25,
          endColumn: 41,
        },
      ],
    },
    {
      code: 'import { AllowedObject, DisallowedObject as AllowedObjectTwo } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 25,
          endColumn: 61,
        },
      ],
    },
    {
      code: 'import { AllowedObject, DisallowedObject as AllowedObjectTwo } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObjectTwo', 'DisallowedObject'],
          message:
            "Please import 'DisallowedObject' and 'DisallowedObjectTwo' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' and 'DisallowedObjectTwo' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 25,
          endColumn: 61,
        },
      ],
    },
    {
      code: 'import DisallowedObject, { AllowedObject as AllowedObjectTwo } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['default'],
          message:
            "Please import the default import of 'foo' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'default',
            customMessage:
              "Please import the default import of 'foo' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'import AllowedObject, { DisallowedObject as AllowedObjectTwo } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 25,
          endColumn: 61,
        },
      ],
    },
    {
      code: 'import AllowedObject, * as AllowedObjectTwo from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
          message: "Please import 'DisallowedObject' from /bar/ instead.",
        },
      ],
      errors: [
        {
          messageId: 'everythingWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObject',
            customMessage:
              "Please import 'DisallowedObject' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          line: 1,
          column: 23,
          endColumn: 44,
        },
      ],
    },
    {
      code: 'import AllowedObject2, * as AllowedObjectTwo from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject', 'DisallowedObjectTwo'],
          message:
            "Please import 'DisallowedObject' and 'DisallowedObjectTwo' from /bar/ instead.",
        },
      ],
      errors: [
        {
          // "* import is invalid because 'DisallowedObject,DisallowedObjectTwo' from 'foo' is restricted. Please import 'DisallowedObject' and 'DisallowedObjectTwo' from /bar/ instead.",
          messageId: 'everythingWithCustomMessage',
          data: {
            importSource: 'foo',
            importName: 'DisallowedObject,DisallowedObjectTwo',
            customMessage:
              "Please import 'DisallowedObject' and 'DisallowedObjectTwo' from /bar/ instead.",
          },
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          line: 1,
          column: 24,
          endColumn: 45,
        },
      ],
    },
    {
      code: 'import { DisallowedObjectOne, DisallowedObjectTwo, AllowedObject } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObjectOne', 'DisallowedObjectTwo'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'foo',
            importName: 'DisallowedObjectOne',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 10,
          endColumn: 29,
        },
        {
          messageId: 'specifier',
          data: {
            importSource: 'foo',
            importName: 'DisallowedObjectTwo',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 31,
          endColumn: 50,
        },
      ],
    },
    {
      code: 'import { DisallowedObjectOne, DisallowedObjectTwo, AllowedObject } from "bar";',
      options: [
        {
          path: 'bar',
          importNames: ['DisallowedObjectOne', 'DisallowedObjectTwo'],
          message: 'Please import this module from /bar/ instead.',
        },
      ],
      errors: [
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'bar',
            importNames: 'DisallowedObjectOne',
            customMessage: 'Please import this module from /bar/ instead.',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 10,
          endColumn: 29,
        },
        {
          messageId: 'specifierWithCustomMessage',
          data: {
            importSource: 'foo',
            importNames: 'DisallowedObjectTwo',
            customMessage: 'Please import this module from /bar/ instead.',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 31,
          endColumn: 50,
        },
      ],
    },
    {
      code: 'import { AllowedObject, DisallowedObject as Bar } from "foo";',
      options: [
        {
          path: 'foo',
          importNames: ['DisallowedObject'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'foo',
            importName: 'DisallowedObject',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 25,
          endColumn: 48,
        },
      ],
    },
    {
      code: "import foo, { bar } from 'mod';",
      options: [
        {
          path: 'mod',
          importNames: ['bar'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'bar',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 15,
          endColumn: 18,
        },
      ],
    },
    {
      code: "import foo, { bar } from 'mod2';",
      options: [
        {
          path: 'mod2',
          importNames: ['default'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod2',
            importName: 'default',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 11,
        },
      ],
    },
    {
      code: "import foo, * as bar from 'mod';",
      options: [
        {
          path: 'mod',
          importNames: ['default'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'default',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'everything',
          data: {
            importSource: 'mod',
            importName: 'default',
          },
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          line: 1,
          column: 13,
          endColumn: 21,
        },
      ],
    },
    {
      code: "import * as bar from 'foo';",
      options: [{ path: 'foo' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: 'foo',
          },
          type: AST_NODE_TYPES.ImportNamespaceSpecifier,
          line: 1,
          column: 8,
          endColumn: 16,
        },
      ],
    },
    {
      code: "import { a, a as b } from 'mod';",
      options: [
        {
          path: 'mod',
          importNames: ['a'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'a',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 10,
          endColumn: 11,
        },
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'a',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 13,
          endColumn: 19,
        },
      ],
    },
    {
      code: "export { x as y, x as z } from 'mod';",
      options: [
        {
          path: 'mod',
          importNames: ['x'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'x',
          },
          type: AST_NODE_TYPES.ExportSpecifier,
          line: 1,
          column: 10,
          endColumn: 16,
        },
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'x',
          },
          type: AST_NODE_TYPES.ExportSpecifier,
          line: 1,
          column: 18,
          endColumn: 24,
        },
      ],
    },
    {
      code: "import foo, { default as bar } from 'mod';",
      options: [
        {
          path: 'mod',
          importNames: ['default'],
        },
      ],
      errors: [
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'default',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'specifier',
          data: {
            importSource: 'mod',
            importName: 'default',
          },
          type: AST_NODE_TYPES.ImportSpecifier,
          line: 1,
          column: 15,
          endColumn: 29,
        },
      ],
    },
    {
      code: "import relativeWithPath from '../foo';",
      options: [{ path: '../foo' }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: '../foo',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 24,
        },
      ],
    },
    {
      code: "import relativeWithPatterns from '../foo';",
      options: [{ pattern: ['../foo'] }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: '../foo',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 28,
        },
      ],
    },
    {
      code: "import absoluteWithPaths from '/foo';",
      options: [{ path: ['/foo'] }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: '/foo',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 25,
        },
      ],
    },
    {
      code: "import absoluteWithPatterns from '/foo';",
      options: [{ pattern: ['foo'] }],
      errors: [
        {
          messageId: 'path',
          data: {
            importSource: '/foo',
          },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
          line: 1,
          column: 8,
          endColumn: 28,
        },
      ],
    },
  ],
});
