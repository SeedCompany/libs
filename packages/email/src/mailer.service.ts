import { Inject, Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import { delay, many, type Many } from '@seedcompany/common';
import { promises as fs } from 'fs';
import { htmlToText } from 'html-to-text';
import type { Readable } from 'node:stream';
import openUrl from 'open';
import {
  type FunctionComponent as Component,
  createElement,
  type ReactElement as Element,
} from 'react';
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
import { HeaderCollector } from './templates/headers.js';
import { RenderForText } from './templates/text-rendering.js';
import { Transporter } from './transporter.js';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly transporter: Transporter,
    @Inject(EMAIL_MODULE_OPTIONS) private readonly options: EmailOptions,
  ) {}

  withOptions(options: Partial<EmailOptions>) {
    return new MailerService(this.transporter, {
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
            headerCollector.collect,
          ].reduceRight((prev, wrap) => wrap(prev), msg.body!);

          const html = await this.renderHtml(docEl);
          const text = msg.headers.text ?? (await this.renderText(docEl));

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

  private async renderHtml(templateEl: Element) {
    let html = await render(templateEl);
    if (html.includes('<mjml')) {
      const mjml2html = await import('mjml');
      const res = mjml2html.default(html);
      html = res.html;
    }
    return html;
  }

  private async renderText(templateEl: Element) {
    const htmlForText = await this.renderHtml(
      createElement(RenderForText, null, templateEl),
    );

    const text = htmlToText(htmlForText, {
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
