import { SendEmailCommand, SESv2Client as SES } from '@aws-sdk/client-sesv2';
import { render } from '@faire/mjml-react/utils/render.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { EmailMessage } from './message.js';
import { AttachmentCollector } from './templates/attachment.js';
import { RenderForText } from './templates/text-rendering.js';
import { SubjectCollector } from './templates/title.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(SES_TOKEN) private readonly ses: SES,
    @Inject(EMAIL_MODULE_OPTIONS) private readonly options: EmailOptions,
  ) {}

  withOptions(options: Omit<Partial<EmailOptions>, 'ses'>) {
    return new EmailService(this.ses, {
      ...this.options,
      ...options,
      wrappers: [...this.options.wrappers, ...(options.wrappers ?? [])],
    });
  }

  async send<P extends object>(
    to: Many<string>,
    template: Component<P>,
    props: P,
  ): Promise<void> {
    const { send, open } = this.options;

    const msg = this.render(template, props).with({ to });

    if (send) {
      await this.transportMessage(msg);
      return;
    }
    this.logger.debug(
      `Would have sent ${msg.templateName} email if enabled to ${msg.to.join(
        ', ',
      )}`,
    );

    if (open) {
      await this.openEmail(msg.html);
    }
  }

  render<P extends object>(template: Component<P>, props: P): EmailMessage;
  /**
   * @deprecated use render(...).with({ to }) instead
   */
  render<P extends object>(
    to: Many<string>,
    template: Component<P>,
    props: P,
  ): Promise<EmailMessage>;
  render<P extends object>(
    _toOrTemplate: Many<string> | Component<P>,
    _templateOrProps: P | Component<P>,
    _propsMaybe?: P,
  ) {
    const to = _propsMaybe ? many(_toOrTemplate as Many<string>) : undefined;
    const template = (
      _propsMaybe ? _templateOrProps : _toOrTemplate
    ) as Component<P>;
    const props = _propsMaybe ?? (_templateOrProps as P);

    const subjectRef = new SubjectCollector();
    const attachmentsRef = new AttachmentCollector();

    const docEl = [
      ...this.options.wrappers,
      subjectRef.collect,
      attachmentsRef.collect,
    ].reduceRight(
      (prev: Element, wrap) => wrap(prev),
      createElement(template, props),
    );

    const html = this.renderHtml(docEl);
    const text = this.renderText(docEl);
    const message = new EmailMessage({
      templateName: template.name,
      to,
      from: this.options.from,
      ...(!this.options.replyTo || this.options.replyTo.length === 0
        ? {}
        : {
            'reply-to': many(this.options.replyTo).join(', '),
          }),
      subject: subjectRef.subject,
      text,
      html,
      attachment: [
        { data: html, alternative: true },
        ...attachmentsRef.attachments.map((file) => ({ ...file })),
      ],
    });

    if (!to) {
      return message;
    }

    return Promise.resolve(message);
  }

  /**
   * @deprecated
   */
  async sendMessage(msg: EmailMessage) {
    await this.transportMessage(msg);
  }

  private async transportMessage(msg: EmailMessage) {
    // "dynamic" import to hide library source usage
    const EmailJS = await import(String('emailjs'));
    const encoded: string = await new EmailJS.Message(msg.headers).readAsync();

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
        `Sent ${msg.templateName} email to ${msg.to.join(', ')}`,
      );
    } catch (e) {
      this.logger.error(
        'Failed to send email',
        e instanceof Error ? e.stack : e,
      );
      throw e;
    }
  }

  private renderHtml(templateEl: Element) {
    const { html } = render(templateEl);
    return html;
  }

  private renderText(templateEl: Element) {
    const { html: htmlForText } = render(
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

  private async openEmail(html: string) {
    const temp = tempFile({ extension: 'html' });
    await fs.writeFile(temp, html);
    await openUrl(`file://${temp}`);
    // try to wait for chrome to open before deleting the temp file
    void delay(10_000)
      .then(() => fs.rm(temp, { recursive: true, force: true, maxRetries: 2 }))
      .catch();
  }
}
