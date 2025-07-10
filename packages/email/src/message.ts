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
