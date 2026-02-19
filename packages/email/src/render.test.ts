import { Test } from '@nestjs/testing';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { SendMailOptions } from 'nodemailer';
import { createElement } from 'react';
import { firstValueFrom, Subject, take } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';
import { EmailModule } from './email.module.js';
import { MailerService } from './mailer.service.js';
import type { Body } from './message.js';
import { Transporter } from './transporter.js';

class MyTransporter extends Transporter {
  transport = new Subject<SendMailOptions>();

  sendMail(msg: SendMailOptions): Promise<unknown> {
    this.transport.next(msg);
    return Promise.resolve(undefined);
  }
}

describe('renderToHtml', () => {
  let mailer: MailerService;
  let transporter: MyTransporter;

  beforeAll(async () => {
    transporter = new MyTransporter();
    const app = await Test.createTestingModule({
      imports: [
        EmailModule.register({
          transporter: { useValue: transporter },
          send: true,
        }),
      ],
    }).compile();
    await app.init();
    mailer = app.get(MailerService);
  });
  async function sendMail(element: Body) {
    const x = firstValueFrom(transporter.transport.pipe(take(1)));
    await mailer.compose(element).send();
    return await x;
  }

  it('should render a sync component', async () => {
    const SyncTemplate = () => createElement('div', null, 'Hello sync world');
    const { html } = await sendMail(createElement(SyncTemplate));
    expect(html).toContain('Hello sync world');
  });

  it('should render an async component (React 19)', async () => {
    const AsyncTemplate = async () => {
      const data = await Promise.resolve('Hello async world');
      return createElement('div', null, data);
    };
    const { html } = await sendMail(createElement(AsyncTemplate));
    expect(html).toContain('Hello async world');
  });

  it('should render an async component that awaits a delayed promise', async () => {
    const DelayedTemplate = async () => {
      const data = await new Promise<string>((resolve) =>
        setTimeout(() => resolve('Delayed content'), 50),
      );
      return createElement('div', null, data);
    };
    const { html } = await sendMail(createElement(DelayedTemplate));
    expect(html).toContain('Delayed content');
  });

  it('should render nested async components', async () => {
    const Inner = async () => {
      const text = await Promise.resolve('inner async');
      return createElement('span', null, text);
    };
    const Outer = async () => {
      const text = await Promise.resolve('outer async');
      return createElement('div', null, text, ' ', createElement(Inner));
    };
    const { html } = await sendMail(createElement(Outer));
    expect(html).toContain('outer async');
    expect(html).toContain('inner async');
  });

  it('should render maintaining async context', async () => {
    const als = new AsyncLocalStorage<string>();
    const AsyncAwareTemplate = async () => {
      await Promise.resolve();
      const text = als.getStore();
      return createElement('div', null, text ?? null);
    };
    const { html } = await als.run('Carson', () =>
      sendMail(createElement(AsyncAwareTemplate)),
    );
    expect(html).toContain('Carson');
  });

  it('should propagate errors from sync components', async () => {
    const ErrorTemplate = () => {
      throw new Error('render error');
    };
    await expect(sendMail(createElement(ErrorTemplate))).rejects.toThrow(
      'render error',
    );
  });

  it('should propagate errors from async components', async () => {
    const ErrorTemplate = async () => {
      await Promise.resolve();
      throw new Error('async render error');
    };
    await expect(sendMail(createElement(ErrorTemplate))).rejects.toThrow(
      'async render error',
    );
  });
});
