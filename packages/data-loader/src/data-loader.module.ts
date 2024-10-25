import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataLoaderContext } from './data-loader.context';
import { DataLoaderFactory } from './data-loader.factory';
import { DataLoaderGuard } from './data-loader.guard';
import { ConfigurableModuleClass } from './data-loader.module-builder';
import { InjectLoaderPipe } from './loader.decorator';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: DataLoaderGuard },
    DataLoaderFactory,
    DataLoaderContext,
    InjectLoaderPipe,
  ],
  exports: [DataLoaderContext],
})
export class DataLoaderModule extends ConfigurableModuleClass {}
