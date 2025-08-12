import {
  ConfigurableModuleBuilder,
  Module,
  ValidationPipe as NestValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { Validator } from 'class-validator';
import { ValidationPipe } from './validation.pipe.js';

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ValidationPipeOptions>().build();

export { MODULE_OPTIONS_TOKEN };

/**
 * The missing module to register the class-validator as a global pipe.
 * This also allows for injectable constraints.
 */
@Module({
  providers: [
    Validator,
    ValidationPipe,
    { provide: NestValidationPipe, useExisting: ValidationPipe },
    { provide: APP_PIPE, useExisting: ValidationPipe },
  ],
  exports: [ValidationPipe],
})
export class ValidatorModule extends ConfigurableModuleClass {}
