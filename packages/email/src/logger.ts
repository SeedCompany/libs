import type { Logger as NestLogger } from '@nestjs/common';
import { format } from 'node:util';
import type { Logger as NodeMailerLogger } from 'nodemailer/lib/shared/index.js';

export class NodeMailerLoggerAdapter implements NodeMailerLogger {
  constructor(
    private readonly logger: NestLogger,
    private readonly includeCtx = false,
  ) {}

  level() {
    // the level can't be set.
  }

  trace(...params: any[]) {
    this.logger.verbose(...this.format(...params));
  }
  debug(...params: any[]) {
    this.logger.debug(...this.format(...params));
  }
  info(...params: any[]) {
    this.logger.log(...this.format(...params));
  }
  warn(...params: any[]) {
    this.logger.warn(...this.format(...params));
  }
  error(...params: any[]) {
    const [{ err, ...ctx }, ...rest] = params;
    const [msg, extra] = this.format(ctx, ...rest);
    this.logger.error(msg, err.stack, ...(extra ? [extra] : []));
  }
  fatal(...params: any[]) {
    this.logger.fatal(...this.format(...params));
  }

  private format(...args: any[]): readonly [string, any?] {
    const [ctx, msg, ...params] = args;
    const formatted = format(msg, ...params);
    return this.includeCtx ? [formatted, ctx] : [formatted];
  }
}
