import {
  SESv2Client as SES,
  type SESv2ClientConfig,
} from '@aws-sdk/client-sesv2';
import { type ReactElement } from 'react';
import type { Many } from './utils.js';

export const SES_TOKEN = Symbol('SES');

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export interface EmailModuleOptions {
  from: string;
  open?: boolean;
  send?: boolean;
  replyTo?: Many<string>;
  wrappers?: ReadonlyArray<(el: ReactElement) => ReactElement>;
  ses?: SES | SESv2ClientConfig;
}

export type EmailOptions = Required<Readonly<Omit<EmailModuleOptions, 'ses'>>>;
