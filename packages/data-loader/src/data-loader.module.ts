import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataLoaderContext } from './data-loader.context.js';
import { DataLoaderFactory } from './data-loader.factory.js';
import { DataLoaderGuard } from './data-loader.guard.js';
import { ConfigurableModuleClass } from './data-loader.module-builder.js';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: DataLoaderGuard },
    DataLoaderFactory,
    DataLoaderContext,
  ],
  exports: [DataLoaderContext],
})
export class DataLoaderModule extends ConfigurableModuleClass {}
