import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DataLoaderOptions } from './data-loader-options.type';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<DataLoaderOptions<any, any>>({
    moduleName: 'DataLoader',
  })
    .setExtras({ global: false }, (definition, extras) => ({
      ...definition,
      global: extras.global,
    }))
    .build();
