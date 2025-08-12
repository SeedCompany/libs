import {
  ConfigurableModuleBuilder,
  Module,
  ValidationPipe as NestValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { Validator } from 'class-validator';
import { ValidationPipe, VALIDATOR_OPTIONS_TOKEN } from './validation.pipe.js';

const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<ValidationPipeOptions>({
    optionsInjectionToken: VALIDATOR_OPTIONS_TOKEN,
  }).build();

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
