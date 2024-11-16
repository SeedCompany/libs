import { Module } from '@nestjs/common';
import {
  type CacheModuleOptions,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './cache.module-builder.js';
import { CacheService } from './cache.service.js';
import { CacheStore } from './stores/index.js';

@Module({
  providers: [
    CacheService,
    {
      provide: CacheStore,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: CacheModuleOptions) => options.store,
    },
  ],
  exports: [CacheService],
})
export class CacheModule extends ConfigurableModuleClass {}
