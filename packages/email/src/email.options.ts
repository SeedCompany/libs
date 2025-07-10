import type { Many } from '@seedcompany/common';
import { type ReactElement } from 'react';

export const SES_TOKEN = Symbol('SES');

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export interface EmailOptions {
  readonly from: string;
  readonly open?: boolean;
  readonly send?: boolean;
  readonly replyTo?: Many<string>;
  readonly wrappers?: ReadonlyArray<(el: ReactElement) => ReactElement>;
}
