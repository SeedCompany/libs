import { many } from '@seedcompany/common';
import type { MessageHeaders } from './headers.type.js';

export class EmailMessage {
  readonly templateName: string;
  readonly to: readonly string[];
  readonly html: string;
  readonly headers: Partial<MessageHeaders>;

  constructor({
    templateName,
    html,
    ...headers
  }: Partial<MessageHeaders> & { templateName: string; html: string }) {
    this.templateName = templateName;
    this.to = headers.to ? many(headers.to) : [];
    this.html = html;
    this.headers = headers;
  }

  with(headers: Partial<MessageHeaders>) {
    return new EmailMessage({
      ...this.headers,
      ...headers,
      templateName: this.templateName,
      html: this.html,
    });
  }
}

export class SendableEmailMessage extends EmailMessage {
  constructor(
    private readonly sender: {
      send: (msg: EmailMessage) => Promise<void>;
    },
    msg: EmailMessage,
  ) {
    super({
      templateName: msg.templateName,
      html: msg.html,
      ...msg.headers,
    });
  }

  with(headers: Parameters<EmailMessage['with']>[0]) {
    return new SendableEmailMessage(this.sender, super.with(headers));
  }

  async send() {
    await this.sender.send(this);
  }
}
