import { SendEmailCommand, SESv2Client as SES } from '@aws-sdk/client-sesv2';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import { delay, many, type Many } from '@seedcompany/common';
import { promises as fs } from 'fs';
import { htmlToText } from 'html-to-text';
import mjml2html from 'mjml';
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
import { EmailMessage, SendableEmailMessage } from './message.js';
import { AttachmentCollector } from './templates/attachment.js';
import { SubjectCollector } from './templates/subject.js';
import { RenderForText } from './templates/text-rendering.js';

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

  compose<P extends object>(
    template: Component<P>,
    props: P,
  ): SendableEmailMessage<P> {
    const message = new EmailMessage(template, props, {
      from: this.options.from,
      ...(!(!this.options.replyTo || this.options.replyTo.length === 0) && {
        'reply-to': many(this.options.replyTo).join(', '),
      }),
    });
    return new SendableEmailMessage(this, message);
  }

  async send<P extends object>(message: EmailMessage<P>): Promise<void>;
  async send<P extends object>(
    to: Many<string>,
    template: Component<P>,
    props: P,
  ): Promise<void>;
  async send<P extends object>(
    to: Many<string> | EmailMessage<P>,
    template?: Component<P>,
    props?: P,
  ): Promise<void> {
    const { send, open } = this.options;

    const msg =
      to instanceof EmailMessage
        ? to
        : this.compose(template!, props!).with({ to });

    if (send) {
      const rendered = await this.render(msg);
      await this.sendMessage(rendered);
      return;
    }
    this.logger.debug(
      `Would have sent ${msg.templateName} email if enabled to ${msg.to.join(
        ', ',
      )}`,
    );

    if (open) {
      const rendered = await this.render(msg);
      await this.openMessage(rendered);
    }
  }

  private async render<P extends object>(msg: EmailMessage<P>) {
    const subjectRef = new SubjectCollector();
    const attachmentsRef = new AttachmentCollector();

    const docEl = [
      ...this.options.wrappers,
      subjectRef.collect,
      attachmentsRef.collect,
    ].reduceRight(
      (prev: Element, wrap) => wrap(prev),
      createElement(msg.template, msg.props),
    );

    const html = await this.renderHtml(docEl);
    const text = await this.renderText(docEl);

    const renderedTemplate: Component<{ html: string }> = () => {
      throw new Error('Cannot re-render a rendered email message');
    };
    renderedTemplate.displayName = msg.templateName;
    return new EmailMessage(
      renderedTemplate,
      { html },
      {
        subject: subjectRef.subject,
        text,
        ...msg.headers,
        attachment: [
          { data: html, alternative: true },
          ...attachmentsRef.attachments.map((file) => ({ ...file })),
          ...many(msg.headers.attachment ?? []),
        ],
      },
    );
  }

  private async renderHtml(templateEl: Element) {
    let html = await render(templateEl);
    if (html.includes('<mjml')) {
      const res = mjml2html(html);
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

  private async openMessage(msg: EmailMessage<{ html: string }>) {
    const temp = tempFile({ extension: 'html' });
    await fs.writeFile(temp, msg.props.html);
    await openUrl(`file://${temp}`);
    // try to wait for chrome to open before deleting the temp file
    void delay(10_000)
      .then(() => fs.rm(temp, { recursive: true, force: true, maxRetries: 2 }))
      .catch();
  }
}
