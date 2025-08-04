import { ModuleRef } from '@nestjs/core';
import { createContext, type ReactElement, useContext } from 'react';

const ModuleRefContext = createContext<ModuleRef>(undefined!);

// eslint-disable-next-line react/display-name
export const ModuleRefWrapper = (moduleRef: ModuleRef) => (el: ReactElement) =>
  <ModuleRefContext.Provider value={moduleRef}>{el}</ModuleRefContext.Provider>;

/**
 * @experimental
 */
export const useModuleRef = () => useContext(ModuleRefContext);
