import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DataLoaderContext } from './data-loader.context';

/**
 * This is how the DataLoaderContext is created for each execution context / request.
 * It's implemented as a guard so that other guards can use it.
 */
@Injectable()
export class DataLoaderGuard implements CanActivate {
  constructor(private readonly context: DataLoaderContext) {}

  canActivate(context: ExecutionContext) {
    this.context.attachToExecutionContext(context);
    return true;
  }
}
