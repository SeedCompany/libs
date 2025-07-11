import { many } from '@seedcompany/common';
import { type FunctionComponent as Component } from 'react';
import type { MessageHeaders } from './headers.type.js';

export class EmailMessage<Props extends object = object> {
  /** @internal */
  constructor(
    readonly template: Component<Props>,
    readonly props: Props,
    readonly headers: Partial<MessageHeaders> = {},
  ) {}

  get templateName() {
    return this.template.displayName ?? this.template.name;
  }

  get to() {
    return this.headers.to ? many(this.headers.to) : [];
  }

  with(headers: Partial<MessageHeaders>) {
    return new EmailMessage(this.template, this.props, {
      ...this.headers,
      ...headers,
    });
  }
}

export class SendableEmailMessage<
  Props extends object = object,
> extends EmailMessage<Props> {
  /** @internal */
  constructor(
    private readonly sender: {
      send: (msg: EmailMessage<any>) => Promise<void>;
    },
    msg: EmailMessage<Props>,
  ) {
    super(msg.template, msg.props, msg.headers);
  }

  with(headers: Partial<MessageHeaders>) {
    return new SendableEmailMessage(this.sender, super.with(headers));
  }

  async send() {
    await this.sender.send(this);
  }
}
