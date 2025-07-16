import { SendEmailCommand, SESv2Client as SES } from '@aws-sdk/client-sesv2';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import { delay, many, type Many } from '@seedcompany/common';
import { promises as fs } from 'fs';
import { htmlToText } from 'html-to-text';
import openUrl from 'open';
import {
  type FunctionComponent as Component,
  createElement,
  type ReactElement as Element,
} from 'react';
import { temporaryFile as tempFile } from 'tempy';
import {
  EMAIL_MODULE_OPTIONS,
  type EmailOptions,
  SES_TOKEN,
} from './email.options.js';
import type { MessageHeaders } from './headers.type.js';
import {
  asyncScope,
  type Body,
  EmailMessage,
  SendableEmailMessage,
} from './message.js';
import { HeaderCollector } from './templates/headers.js';
import { RenderForText } from './templates/text-rendering.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(SES_TOKEN) private readonly ses: SES,
    @Inject(EMAIL_MODULE_OPTIONS) private readonly options: EmailOptions,
  ) {}

  withOptions(options: Partial<EmailOptions>) {
    return new EmailService(this.ses, {
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
    headers: Partial<MessageHeaders>,
    body: Body<P>,
  ): SendableEmailMessage<P>;
  compose(...args: any[]): SendableEmailMessage {
    // @ts-expect-error it is the same overload signatures
    const message = EmailMessage.from(...args);
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
      `Would have sent ${msg.templateName} email if enabled${
        // maybe be defined by render, which hasn't happened
        recipients ? ` to ${recipients}` : ''
      }`,
    );

    if (open) {
      const rendered = await this.render(msg);
      await this.openMessage(rendered);
    }
  }

  private async render<P extends object>(msg: EmailMessage<P>) {
    const headerCollector = new HeaderCollector();

    const docEl = [
      ...(this.options.wrappers ?? []),
      headerCollector.collect,
    ].reduceRight((prev, wrap) => wrap(prev), msg.body);

    const { html, text } = await msg[asyncScope](async () => {
      const html = await this.renderHtml(docEl);
      const text = await this.renderText(docEl);
      return { html, text };
    });

    const RenderedComp: Component<{ html: string }> = () => {
      throw new Error('Cannot re-render a rendered email message');
    };
    RenderedComp.displayName = msg.templateName;
    const rendered = createElement(RenderedComp, { html });

    const { attachment: attachments = {}, ...headersFromBody } =
      headerCollector.headers;

    return new EmailMessage(rendered, {
      ...this.options.defaultHeaders,
      ...headersFromBody,
      text,
      ...msg.headers,
      attachment: [
        { data: html, alternative: true },
        ...Object.values(attachments).map((file) => ({ ...file })),
        ...many(msg.headers.attachment ?? []),
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

  private async sendMessage(msg: EmailMessage<{ html: string }>) {
    // "dynamic" import to hide library source usage
    const EmailJS = await import(String('emailjs'));
    const message = new EmailJS.Message(msg.headers);
    const { validationError } = message.checkValidity();
    if (validationError) {
      throw new Error(validationError);
    }

    const encoded: string = await message.readAsync();

    const command = new SendEmailCommand({
      Content: {
        Raw: {
          Data: Buffer.from(encoded),
        },
      },
    });
    try {
      await this.ses.send(command);
      this.logger.debug(
        `Sent ${msg.templateName} email to ${msg.primaryRecipients.join(', ')}`,
      );
    } catch (e) {
      this.logger.error(
        'Failed to send email',
        e instanceof Error ? e.stack : e,
      );
      throw e;
    }
  }

  private async openMessage(msg: EmailMessage<{ html: string }>) {
    const temp = tempFile({ extension: 'html' });
    await fs.writeFile(temp, msg.body.props.html);
    await openUrl(`file://${temp}`);
    // try to wait for chrome to open before deleting the temp file
    void delay(10_000)
      .then(() => fs.rm(temp, { recursive: true, force: true, maxRetries: 2 }))
      .catch();
  }
}
