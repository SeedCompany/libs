import type { MessageAttachment } from 'emailjs';
import { createContext, type ReactNode, useContext } from 'react';

export interface AttachmentProps
  extends Partial<Pick<MessageAttachment, 'charset' | 'method'>> {
  /** The file data */
  data: string;
  /** The file's content-type */
  type: string;
  /** The file's name */
  name: string;
}

const AttachmentContext = createContext<AttachmentProps[]>([]);

export class AttachmentCollector {
  private context?: AttachmentProps[];

  collect = (children?: ReactNode) => {
    this.context = [];
    return (
      <AttachmentContext.Provider value={this.context}>
        {children}
      </AttachmentContext.Provider>
    );
  };

  get attachments() {
    return this.context ?? [];
  }
}

export const Attachment = (props: AttachmentProps) => {
  const context = useContext(AttachmentContext);
  context.push(props);
  return null;
};
