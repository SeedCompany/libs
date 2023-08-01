import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataLoaderContext } from './data-loader.context';
import { DataLoaderFactory } from './data-loader.factory';
import { DataLoaderGuard } from './data-loader.guard';
import { ConfigurableModuleClass } from './data-loader.module-builder';
import { loadGqlExecutionContext } from './lifetime-id-from-execution-context';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: DataLoaderGuard },
    DataLoaderFactory,
    DataLoaderContext,
  ],
  exports: [DataLoaderContext],
})
export class DataLoaderModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  async onModuleInit() {
    await loadGqlExecutionContext();
  }
}
