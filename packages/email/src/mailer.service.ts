import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { render } from '@react-email/render';
import { delay, many, type Many } from '@seedcompany/common';
import { promises as fs } from 'fs';
import { htmlToText } from 'html-to-text';
import type { Readable } from 'node:stream';
import openUrl from 'open';
import { type FunctionComponent as Component, createElement } from 'react';
import { temporaryFile as tempFile } from 'tempy';
import type { WritableDeep } from 'type-fest';
import { EMAIL_MODULE_OPTIONS, type EmailOptions } from './email.options.js';
import {
  asyncScope,
  type Body,
  EmailMessage,
  type MessageHeaders,
  SendableEmailMessage,
} from './message.js';
import * as renderOnly from './processRenderOnlyElements.js';
import { HeaderCollector } from './templates/headers.js';
import { ModuleRefWrapper } from './templates/module-ref.js';
import { Transporter } from './transporter.js';

let mjml2html: typeof import('mjml') | undefined;

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly transporter: Transporter,
    private readonly moduleRef: ModuleRef,
    @Inject(EMAIL_MODULE_OPTIONS) private readonly options: EmailOptions,
  ) {}

  withOptions(options: Partial<EmailOptions>) {
    return new MailerService(this.transporter, this.moduleRef, {
      ...this.options,
      ...options,
      wrappers: [...(this.options.wrappers ?? []), ...(options.wrappers ?? [])],
    });
  }

  compose<P extends object>(body: Body<P>): SendableEmailMessage<P>;
  compose<P extends object>(
    to: Many<string>,
    body: Body<P>,
  ): SendableEmailMessage<P>;
  compose<P extends object>(
    // eslint-disable-next-line @typescript-eslint/unified-signatures -- I want the specific param name
    headers: MessageHeaders,
    body: Body<P>,
  ): SendableEmailMessage<P>;
  compose(headers: MessageHeaders): SendableEmailMessage;
  compose(...args: any[]): SendableEmailMessage {
    // @ts-expect-error it is the same overload signatures
    const message = EmailMessage.from<any>(...args);
    return new SendableEmailMessage(this, message);
  }

  async send<P extends object>(msg: EmailMessage<P>) {
    const { send, open } = this.options;

    if (send) {
      const rendered = await this.render(msg);
      await this.sendMessage(rendered);
      return;
    }
    const recipients = msg.primaryRecipients.join(', ');
    this.logger.debug(
      `Would have sent ${msg.templateName ?? 'some'} email if enabled${
        // maybe be defined by render, which hasn't happened
        recipients ? ` to ${recipients}` : ''
      }`,
    );

    if (open) {
      const rendered = await this.render(msg);
      await this.openMessage(rendered);
    }
  }

  private async render(msg: EmailMessage<object | undefined>) {
    const headerCollector = new HeaderCollector();

    const renderedBody = msg.body
      ? await msg[asyncScope](async () => {
          const docEl = [
            ...(this.options.wrappers ?? []),
            ModuleRefWrapper(this.moduleRef),
            headerCollector.collect,
          ].reduceRight((prev, wrap) => wrap(prev), msg.body!);

          const generateText = !msg.headers.text;

          const rawHtml = await render(docEl);
          const htmlByOutput = this.transformSplitRenderOnly(
            rawHtml,
            generateText,
          );

          const html = await this.transformMjml(htmlByOutput.html);
          const text = generateText
            ? // It is possible the text transformation doesn't need MJML rendered.
              // However, that probably requires additional selector configuration targeting MJML elements.
              this.transformText(await this.transformMjml(htmlByOutput.text!))
            : msg.headers.text;

          const RenderedComp: Component<RenderedProps & {}> = () => {
            throw new Error('Cannot re-render a rendered email message');
          };
          RenderedComp.displayName = msg.templateName;
          return createElement(RenderedComp, { html, text });
        })
      : undefined;

    const { attachments, ...headersFromBody } = headerCollector.headers;

    return new EmailMessage<RenderedProps>(renderedBody, {
      ...this.options.defaultHeaders,
      ...headersFromBody,
      ...renderedBody?.props,
      ...msg.headers,
      attachments: [
        ...Object.values(attachments ?? {}),
        ...many(msg.headers.attachments ?? []),
      ],
    });
  }

  private transformSplitRenderOnly(rawHtml: string, includeText: boolean) {
    const domHtml = renderOnly.parse(rawHtml);
    const domText = includeText ? domHtml.cloneNode(true) : undefined;
    const html = renderOnly.serialize(renderOnly.process(domHtml, 'html'));
    const text = domText
      ? renderOnly.serialize(renderOnly.process(domText, 'text'))
      : undefined;
    return { html, text };
  }

  private async transformMjml(html: string) {
    if (!html.includes('<mjml')) {
      return html;
    }
    if (!mjml2html) {
      mjml2html = await import('mjml').then((m) => m.default);
    }
    const res = mjml2html!(html);
    return res.html;
  }

  private transformText(html: string) {
    const text = htmlToText(html, {
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      ],
      formatters: {
        // mjml uses `role="presentation"` for non-table tables, skip those.
        // actual tables get rendered as normal.
        table: (el, walk, builder, options) =>
          el.attribs.role === 'presentation'
            ? walk(el.children, builder)
            : builder.options.formatters.dataTable!(el, walk, builder, options),
      },
    });

    return text;
  }

  private async sendMessage(msg: EmailMessage<RenderedProps>) {
    await this.transporter.sendMail(
      // revert deep readonly
      msg.headers as WritableDeep<typeof msg.headers>,
    );
  }

  private async openMessage(msg: EmailMessage<RenderedProps>) {
    const temp = tempFile({
      extension: msg.body ? 'html' : msg.headers.text ? 'txt' : 'json',
    });
    await fs.writeFile(
      temp,
      msg.body?.props.html ??
        tryRenderText(msg.headers.text) ??
        JSON.stringify(msg.headers),
    );
    await openUrl(`file://${temp}`);
    // try to wait for chrome to open before deleting the temp file
    void delay(10_000)
      .then(() => fs.rm(temp, { recursive: true, force: true, maxRetries: 2 }))
      .catch();
  }
}

type RenderedProps =
  | { html: string; text: MessageHeaders['text'] & {} }
  | undefined;

function tryRenderText(text: MessageHeaders['text']) {
  if (!text) {
    return undefined;
  }
  if (typeof text === 'string') {
    return text;
  }
  return 'content' in text
    ? text.content
    : (text as string | Buffer | Readable);
}
