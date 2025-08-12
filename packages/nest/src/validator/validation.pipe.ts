import {
  ValidationPipe as BaseValidationPipe,
  Inject,
  Injectable,
  type ValidationPipeOptions,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { useContainer, type ValidatorOptions } from 'class-validator';
import { MODULE_OPTIONS_TOKEN } from './validator.module.js';

/**
 * Wraps Nest's ValidationPipe to support injectable constraints.
 */
@Injectable()
export class ValidationPipe extends BaseValidationPipe {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) options: ValidationPipeOptions,
    private readonly moduleRef: ModuleRef,
  ) {
    super(options);
  }

  private readonly iocContainer = {
    get: (type: any) => {
      if (type.name === 'CustomConstraint') {
        // A prototype-less constraint.
        // Return null to fall back to default logic, which just calls constructor once.
        return null;
      }
      return this.moduleRef.get(type);
    },
  };

  protected async validate(
    object: object,
    validatorOptions?: ValidatorOptions,
  ) {
    useContainer(this.iocContainer, { fallback: true });
    return await super.validate(object, validatorOptions);
  }
}
