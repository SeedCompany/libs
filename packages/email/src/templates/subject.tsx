import { createContext, type ReactNode, useContext } from 'react';

interface SubjectContextType {
  subject?: string;
}

const SubjectContext = createContext<SubjectContextType>({});

export class SubjectCollector {
  private context?: SubjectContextType;

  collect = (children: ReactNode) => {
    this.context = {};
    return (
      <SubjectContext.Provider value={this.context}>
        {children}
      </SubjectContext.Provider>
    );
  };

  get subject(): string {
    if (!this.context?.subject) {
      throw new Error(
        '<Title> must be used to provide a subject for the email',
      );
    }
    return this.context.subject;
  }
}

export const Subject = ({ children }: { children: string }) => {
  const context = useContext(SubjectContext);
  context.subject = children;
  return null;
};
