import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CacheStore } from './stores';

export interface CacheModuleOptions {
  store: CacheStore;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CacheModuleOptions>({
    moduleName: 'Cache',
  })
    .setExtras({ global: false }, (definition, extras) => ({
      ...definition,
      global: extras.global,
    }))
    .build();
