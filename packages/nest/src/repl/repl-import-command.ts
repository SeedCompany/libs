import { clc } from '@nestjs/common/utils/cli-colors.util.js';
import { cmpBy, mapValues } from '@seedcompany/common';
import { readdirSync } from 'node:fs';
import fs from 'node:fs/promises';
import { builtinModules } from 'node:module';
import * as path from 'node:path';
import { cwd } from 'node:process';
import type { REPLServer } from 'node:repl';
import type { PackageJson } from 'type-fest';

type ImportFn = <R>(name: string, options?: ImportCallOptions) => Promise<R>;

type Dirs = Record<'project' | 'src' | 'dist', string>;

export interface ImportCommandOptions {
  import: ImportFn;
  dirs?: Partial<Dirs>;
}

export class ReplImportCommand {
  protected readonly importModule: ImportFn;
  protected readonly dirs: Dirs;

  protected relativeLocalDirs: RegExp;
  protected nodeBuiltinModules: readonly string[];
  protected libraryNames: readonly string[];

  static async create(opts: ImportCommandOptions) {
    return await new ReplImportCommand(opts).init();
  }

  constructor(opts: ImportCommandOptions) {
    this.importModule = opts.import;
    const projectDir = opts.dirs?.project ?? cwd();
    this.dirs = {
      project: projectDir,
      src: opts.dirs?.src ?? path.resolve(projectDir, 'src'),
      dist: opts.dirs?.dist ?? path.resolve(projectDir, 'dist'),
    };
  }

  async init() {
    const src = path.relative(this.dirs.project, this.dirs.src);
    const dist = path.relative(this.dirs.project, this.dirs.dist);
    this.relativeLocalDirs = new RegExp(
      `^(${[src, dist, `./${src}`, `./${dist}`].join('|')})`,
    );

    const packageJsonPath = path.resolve(this.dirs.project, './package.json');
    const packageJson = await fs
      .readFile(packageJsonPath, 'utf-8')
      .then((x): PackageJson => JSON.parse(x));
    this.libraryNames = Object.keys({
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    }).sort(cmpBy((name) => name));

    this.nodeBuiltinModules = builtinModules.flatMap((m) => {
      if (m.startsWith('_')) {
        return [];
      }
      return m.startsWith('node:') ? m : `node:${m}`;
    });

    return this;
  }

  install(server: REPLServer) {
    server.defineCommand('import', {
      help: 'Import a src file / module',
      action: (line) => {
        void this.execute(server, line);
      },
    });

    return this;
  }

  async execute(server: REPLServer, line: string) {
    const { alias, modulePath } = this.resolve(line);

    try {
      const module = await this.importModule<Record<string, unknown>>(
        modulePath,
      );

      let target = server.context;
      if (alias) {
        server.context[alias] ??= {};
        target = server.context[alias];
      }

      Object.defineProperties(
        target,
        mapValues(module, (key, _, { SKIP }) => {
          if (key in target) {
            return SKIP;
          }
          return Object.getOwnPropertyDescriptor(module, key);
        }).asRecord as Record<string, PropertyDescriptor>,
      );

      console.log(clc.green('Imported' + (alias ? ` as ${alias}` : '')));
    } catch (e) {
      console.error(clc.red((e as Error).message));
    }

    server.displayPrompt();
  }

  resolve(line: string) {
    line = line.trim();

    const isBuiltin = line.startsWith('node:');

    const aliasMatch = /([\w/.@~:-]+)(?:\s+[aA][sS]\s+(\w+))?/.exec(line);
    const moduleName = aliasMatch?.[1] ?? line;
    let alias = aliasMatch?.[2];
    if (!alias && isBuiltin) {
      alias = line.slice(5);
    } else if (alias === 'global') {
      alias = undefined;
    }

    const modulePath = this.normalizeLocalPath(moduleName);

    const location = modulePath.startsWith('node:')
      ? 'builtin'
      : modulePath.startsWith('.') || modulePath.startsWith('/') // only valid after normalization
      ? 'local'
      : 'library';

    return { modulePath, location, alias };
  }

  protected normalizeLocalPath(filePath: string) {
    return filePath
      .replace(this.dirs.src, this.dirs.dist)
      .replace(this.relativeLocalDirs, './')
      .replace(/^~\//, './')
      .replace(/:\d+(:\d+)?$/, '')
      .replace(/\.[tj]sx?$/, '.js');
  }

  completer(line: string) {
    if (!line.startsWith('.import ')) {
      return;
    }
    const input = line.slice(8);
    return this.doCompleter(input).map((e) => `.import ${e}`);
  }

  protected doCompleter(line: string) {
    return [
      ...this.completeLocalFile(line),
      ...this.completeBuiltin(line),
      ...this.completeLibrary(line),
    ];
  }

  protected completeBuiltin(line: string) {
    if (line.startsWith('node:')) {
      return this.nodeBuiltinModules.filter((m) => m.startsWith(line));
    }
    if (!line || 'node:'.startsWith(line)) {
      return ['node:'];
    }
    return [];
  }

  protected completeLibrary(line: string) {
    if (!line) {
      return ['@'];
    }
    if (line === '@') {
      return this.libraryNames;
    }
    return this.libraryNames.filter((name) => name.startsWith(line));
  }

  protected completeLocalFile(line: string): string[] {
    if (!line || line === '.') {
      return ['./'];
    }
    if (!this.isLocalFsPath(line)) {
      return [];
    }
    const isDir = line.endsWith('/');
    const currentParent = isDir ? line : path.dirname(line) + '/';
    const filePrefix = isDir ? '' : path.basename(line);

    const normalized = line.replace(/^~\//, './');
    const absInput = path.resolve(this.dirs.src, normalized);
    const dirToRead = isDir ? absInput : path.dirname(absInput);
    let entries;
    try {
      entries = readdirSync(dirToRead, { withFileTypes: true });
    } catch (e) {
      return [];
    }
    return entries.flatMap((entry) => {
      if (!entry.name.startsWith(filePrefix)) {
        return [];
      }
      return `${currentParent}${entry.name}${entry.isDirectory() ? '/' : ''}`;
    });
  }

  protected isLocalFsPath(filePath: string) {
    return (
      filePath.startsWith('.') ||
      filePath.startsWith(this.dirs.src) ||
      filePath.startsWith(this.dirs.dist) ||
      filePath.startsWith('~/')
    );
  }
}
