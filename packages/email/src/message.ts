import { type Many, many } from '@seedcompany/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { SendMailOptions } from 'nodemailer';
import {
  type FunctionComponent as Component,
  createElement,
  type ReactElement as Element,
  isValidElement,
} from 'react';
import type { HasRequiredKeys, ReadonlyDeep } from 'type-fest';

export type MessageHeaders = ReadonlyDeep<SendMailOptions>;

export const asyncScope = Symbol('asyncScope');
type WithAsyncScope = ReturnType<typeof AsyncLocalStorage.snapshot>;

export class EmailMessage<Props extends object = object> {
  /** @internal */
  [asyncScope]: WithAsyncScope;

  /** @internal */
  constructor(
    readonly body: Element<Props, Component<Props>> | undefined,
    readonly headers: MessageHeaders,
    scope?: WithAsyncScope,
  ) {
    this[asyncScope] = scope ?? AsyncLocalStorage.snapshot();
  }

  static from<P extends object>(body: Body<P>): EmailMessage<P>;
  static from<P extends object>(
    to: Many<string>,
    body: Body<P>,
  ): EmailMessage<P>;
  static from<P extends object>(
    // eslint-disable-next-line @typescript-eslint/unified-signatures -- I want the specific param name
    headers: MessageHeaders,
    body?: Body<P>,
  ): EmailMessage<P>;
  static from(
    headersOrBody: Many<string> | MessageHeaders | Body,
    bodyMaybe?: Body,
  ): EmailMessage {
    const firstArgIsBody =
      isValidElement(headersOrBody) ||
      typeof headersOrBody === 'function' ||
      (Array.isArray(headersOrBody) && typeof headersOrBody[0] === 'function');
    const body =
      bodyMaybe ?? (firstArgIsBody ? (headersOrBody as Body) : undefined);
    const headersRaw = firstArgIsBody
      ? undefined
      : (headersOrBody as Many<string> | MessageHeaders);
    const headers =
      typeof headersRaw === 'string' || Array.isArray(headersRaw)
        ? { to: headersRaw }
        : ((headersRaw ?? {}) as MessageHeaders);

    return new EmailMessage(body ? bodyToElement(body) : undefined, headers);
  }

  get templateName() {
    return this.body?.type.displayName ?? this.body?.type.name;
  }

  get primaryRecipients() {
    const best = this.headers.to ?? this.headers.cc ?? this.headers.bcc;
    return best ? many(best) : [];
  }

  withHeaders(headers: MessageHeaders) {
    return new EmailMessage(
      this.body,
      {
        ...this.headers,
        ...headers,
      },
      this[asyncScope],
    );
  }

  withBody<PP extends object>(body: Body<PP>) {
    return EmailMessage.from<PP>(this.headers, body);
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
    super(msg.body, msg.headers, msg[asyncScope]);
  }

  withHeaders(headers: MessageHeaders) {
    return new SendableEmailMessage(this.sender, super.withHeaders(headers));
  }

  withBody<PP extends object>(body: Body<PP>) {
    return new SendableEmailMessage(
      this.sender,
      EmailMessage.from(this.headers, body),
    );
  }

  async send() {
    await this.sender.send(this);
  }
}

export type Body<P extends object = object> =
  | Element<P, Component<P>>
  | ComponentWithProps<P>;

export type ComponentWithProps<Props extends object> = Props extends Record<
  any,
  never
>
  ? Component<Props> | [component: Component<Props>]
  : HasRequiredKeys<Props> extends true
  ? [component: Component<Props>, props: Props]
  : Component<Props> | [component: Component<Props>, props?: Props];

function bodyToElement<P extends object>(
  body: Body<P>,
): Element<P, Component<P>> {
  if (isValidElement(body)) {
    if (typeof body.type !== 'function') {
      throw new Error(
        'Body must be a React element of a user defined component, not intrinsic elements',
      );
    }
    return body as Element<P, Component<P>>;
  }
  const [comp, props] = many(body) as [Component<P>, P?];
  return createElement(comp, props ?? ({} as unknown as P));
}
