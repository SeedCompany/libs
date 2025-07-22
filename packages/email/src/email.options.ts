import { type ReactElement } from 'react';
import type { MessageHeaders } from './message.js';

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export interface EmailOptions {
  /**
   * Whether to open the email's HTML in browser. Useful for dev previews.
   * Doesn't apply if send is true
   */
  readonly open?: boolean;
  /** Whether to actually send the email */
  readonly send?: boolean;
  /** Default headers to send. Probably pass a `from` address here. */
  readonly defaultHeaders?: MessageHeaders;
  /** Useful to inject services or custom context into template JSX */
  readonly wrappers?: ReadonlyArray<(el: ReactElement) => ReactElement>;
}
