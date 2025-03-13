import { Module } from '@nestjs/common';
import { DataLoaderContext } from './data-loader.context.js';
import { DataLoaderFactory } from './data-loader.factory.js';
import { ConfigurableModuleClass } from './data-loader.module-builder.js';
import { InjectLoaderPipe } from './loader.decorator.js';

@Module({
  providers: [DataLoaderFactory, DataLoaderContext, InjectLoaderPipe],
  exports: [DataLoaderContext],
})
export class DataLoaderModule extends ConfigurableModuleClass {}
