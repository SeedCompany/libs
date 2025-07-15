import { type ReactElement } from 'react';
import type { MessageHeaders } from './headers.type.js';

export const SES_TOKEN = Symbol('SES');

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export interface EmailOptions {
  readonly open?: boolean;
  readonly send?: boolean;
  readonly defaultHeaders?: Partial<MessageHeaders>;
  readonly wrappers?: ReadonlyArray<(el: ReactElement) => ReactElement>;
}
