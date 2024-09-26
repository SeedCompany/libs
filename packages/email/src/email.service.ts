import { SendEmailCommand, SESv2Client as SES } from '@aws-sdk/client-sesv2';
import { render } from '@faire/mjml-react/utils/render';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { htmlToText } from 'html-to-text';
import openUrl from 'open';
import { createElement, ReactElement } from 'react';
import { temporaryFile as tempFile } from 'tempy';
import {
  EMAIL_MODULE_OPTIONS,
  type EmailOptions,
  SES_TOKEN,
} from './email.options';
import { EmailMessage } from './message';
import { AttachmentCollector } from './templates/attachment';
import { RenderForText } from './templates/text-rendering';
import { SubjectCollector } from './templates/title';
import { Many, many, sleep } from './utils';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(SES_TOKEN) private readonly ses: SES,
    @Inject(EMAIL_MODULE_OPTIONS) private readonly options: EmailOptions,
  ) {}

  async send<P extends object>(
    to: Many<string>,
    template: (props: P) => ReactElement,
    props: P,
  ): Promise<void> {
    const { send, open } = this.options;

    const msg = await this.render(to, template, props);

    if (send) {
      await this.sendMessage(msg);
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

  async render<P extends object>(
    to: Many<string>,
    template: (props: P) => ReactElement,
    props: P,
  ) {
    const subjectRef = new SubjectCollector();
    const attachmentsRef = new AttachmentCollector();

    const docEl = [
      ...this.options.wrappers,
      subjectRef.collect,
      attachmentsRef.collect,
    ].reduceRight(
      (prev: ReactElement, wrap) => wrap(prev),
      createElement(template, props),
    );

    const html = this.renderHtml(docEl);
    const text = this.renderText(docEl);
    const message = new EmailMessage({
      templateName: template.name,
      to: to as string[],
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
    this.logger.debug(
      `Rendered ${message.templateName} email for ${message.to.join(', ')}`,
    );

    return message;
  }

  async sendMessage(msg: EmailMessage) {
    const encoded = await msg.readAsync();
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

  private renderHtml(templateEl: ReactElement) {
    const { html } = render(templateEl);
    return html;
  }

  private renderText(templateEl: ReactElement) {
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
            : builder.options.formatters.dataTable(el, walk, builder, options),
      },
    });

    return text;
  }

  private async openEmail(html: string) {
    const temp = tempFile({ extension: 'html' });
    await fs.writeFile(temp, html);
    await openUrl(`file://${temp}`);
    // try to wait for chrome to open before deleting the temp file
    void sleep(10_000)
      .then(() => fs.rm(temp, { recursive: true, force: true, maxRetries: 2 }))
      .catch();
  }
}
