import { createContext, type ReactNode, useContext } from 'react';

export interface AttachmentProps {
  /** The file data */
  data: string;
  /** The file's content-type */
  type: string;
  /** The file's name */
  name: string;
  charset?: string;
  method?: string;
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
