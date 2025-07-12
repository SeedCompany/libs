import { many } from '@seedcompany/common';
import {
  type ComponentType as Component,
  type ReactElement as Element,
} from 'react';
import type { MessageHeaders } from './headers.type.js';

export class EmailMessage<Props extends object = object> {
  /** @internal */
  constructor(
    readonly body: Element<Props, Component<Props>>,
    readonly headers: Partial<MessageHeaders> = {},
  ) {}

  get templateName(): string {
    return this.body.type.displayName ?? this.body.type.name;
  }

  get to() {
    return this.headers.to ? many(this.headers.to) : [];
  }

  with(headers: Partial<MessageHeaders>) {
    return new EmailMessage(this.body, {
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
    super(msg.body, msg.headers);
  }

  with(headers: Partial<MessageHeaders>) {
    return new SendableEmailMessage(this.sender, super.with(headers));
  }

  async send() {
    await this.sender.send(this);
  }
}
