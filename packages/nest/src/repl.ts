import { type INestApplicationContext } from '@nestjs/common';
import type { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface.js';
import { clc } from '@nestjs/common/utils/cli-colors.util.js';
import { NestFactory } from '@nestjs/core';
import { assignToObject } from '@nestjs/core/repl/assign-to-object.util.js';
import { ReplContext } from '@nestjs/core/repl/repl-context.js';
import { ReplLogger } from '@nestjs/core/repl/repl-logger.js';
import { bufferFromStream } from '@seedcompany/common';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { promisify } from 'node:util';
import { createContext, runInContext } from 'node:vm';

// Nestjs doesn't export this type, so we have to do this.
type IEntryNestModule = Parameters<
  (typeof NestFactory)['createApplicationContext']
>[0];

export const runRepl = ({
  module,
  options,
  extraContext,
  historyFile = '.cache/repl_history',
}: {
  module: () => Promise<IEntryNestModule>;
  options?: () => Promise<NestApplicationContextOptions>;
  extraContext?: (
    app: INestApplicationContext,
  ) => Promise<Record<string, unknown>>;
  historyFile?: string | false;
}) => {
  (async () => {
    // @ts-expect-error I'm not sure what this is on about.
    const entry: IEntryNestModule = await module();

    const app = await NestFactory.createApplicationContext(entry, {
      abortOnError: false,
      logger: new ReplLogger(),
      ...(options ? await options() : {}),
    });

    await app.init();

    const replContext = assignToObject(
      new ReplContext(app).globalScope,
      extraContext ? await extraContext(app) : {},
    );

    if (!process.stdin.isTTY) {
      const input = await bufferFromStream(process.stdin);
      runInContext(input.toString(), createContext(replContext));
      await app.close();
      return;
    }

    const _repl = await Promise.resolve().then(() => import('repl'));
    const replServer = _repl.start({
      prompt: clc.green('> '),
      ignoreUndefined: true,
    });
    replServer.on('exit', () => void app.close());

    assignToObject(replServer.context, replContext);

    if (historyFile) {
      await mkdir(dirname(historyFile), { recursive: true });
      await promisify(replServer.setupHistory.bind(replServer))(historyFile);
    }
  })().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
};
