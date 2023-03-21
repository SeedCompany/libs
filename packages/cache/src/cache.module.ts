import { Module } from '@nestjs/common';
import {
  CacheModuleOptions,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './cache.module-builder';
import { CacheService } from './cache.service';
import { CacheStore } from './stores';

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
