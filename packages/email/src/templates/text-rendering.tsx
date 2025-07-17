import { type ReactNode } from 'react';

interface ChildrenProp {
  children?: ReactNode;
}

/**
 * Only show the children of this element when in HTML.
 */
export const InHtml = ({ children }: ChildrenProp) => (
  <div data-render-only="html" data-render-inline>
    {children}
  </div>
);

/**
 * Only show the children of this element when converting to text.
 */
export const InText = ({ children }: ChildrenProp) => (
  <div data-render-only="text" data-render-inline>
    {children}
  </div>
);
