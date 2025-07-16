import { many } from '@seedcompany/common';
import { createContext, type ReactNode, useContext, useId } from 'react';
import type { Merge, Writable } from 'type-fest';
import type { MessageHeaders } from '../headers.type.js';

type HeaderContextType = Merge<
  Writable<Partial<MessageHeaders>>,
  {
    attachment?: Record<string, MessageHeaders['attachment']>;
  }
>;

const HeaderContext = createContext<HeaderContextType>({});

export class HeaderCollector {
  private context: HeaderContextType = {};

  collect = (children: ReactNode) => {
    this.context = {};
    return (
      <HeaderContext.Provider value={this.context}>
        {children}
      </HeaderContext.Provider>
    );
  };

  get headers() {
    return this.context;
  }
}

/**
 * Define some headers for the email message.
 * These take precedence over the {@link EmailOptions.defaultHeaders} in the module options.
 * Headers given to {@link EmailService.compose}/{@link EmailMessage.from}/{@link EmailService.withHeaders} take precedence over these.
 *
 * Defining the same header multiple times is an undefined behavior, and only one value will apply.
 * Except for attachments which can be defined multiple times, for multiple attachments.
 */
export const Headers = (props: Partial<MessageHeaders>) => {
  const context = useContext(HeaderContext);
  const id = useId();
  const { attachment: attachments, ...simple } = props;
  Object.assign(context, simple);
  if (attachments) {
    for (const [i, attachment] of many(attachments).entries()) {
      context.attachment ??= {};
      context.attachment[id + (attachment.name ?? String(i))] = attachment;
    }
  }
  return null;
};
