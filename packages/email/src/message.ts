import { many } from '@seedcompany/common';
import type { PathLike } from 'node:fs';
import type { Readable } from 'node:stream';

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
}

// Below is inlined from the `emailjs` library to avoid using their loose source files

interface MessageHeaders {
  [index: string]:
    | boolean
    | string
    | string[]
    | null
    | undefined
    | MessageAttachment
    | MessageAttachment[];
  'content-type'?: string;
  'message-id'?: string;
  'return-path'?: string | null;
  date?: string;
  from: string | string[];
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text: string | null;
  attachment?: MessageAttachment | MessageAttachment[];
}

interface MessageAttachment {
  [index: string]:
    | string
    | boolean
    | MessageAttachment
    | MessageAttachment[]
    | MessageAttachmentHeaders
    | Readable
    | PathLike
    | undefined;
  name?: string;
  headers?: MessageAttachmentHeaders;
  inline?: boolean;
  alternative?: MessageAttachment | boolean;
  related?: MessageAttachment[];
  data?: string;
  encoded?: boolean;
  stream?: Readable;
  path?: PathLike;
  type?: string;
  charset?: string;
  method?: string;
}

interface MessageAttachmentHeaders {
  [index: string]: string | undefined;
  'content-type'?: string;
  'content-transfer-encoding'?: BufferEncoding | '7bit' | '8bit';
  'content-disposition'?: string;
}
