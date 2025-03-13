import { type ExecutionContext, Injectable, type Type } from '@nestjs/common';
import { type ContextId, ContextIdFactory } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { cacheable, cached } from '@seedcompany/common';
import { DataLoaderFactory } from './data-loader.factory.js';
import type { DataLoaderStrategy } from './data-loader.strategy.js';
import type { DataLoader } from './data-loader.type.js';
import { lifetimeIdFromExecutionContext } from './lifetime-id-from-execution-context.js';

export interface LoaderContextType {
  contextId: ContextId;
  loaders: Map<
    Type<DataLoaderStrategy<any, any>>,
    Promise<DataLoader<any, any>>
  >;
  getLoader: <T, Key, CachedKey = Key>(
    type: Type<DataLoaderStrategy<T, Key, CachedKey>>,
  ) => Promise<DataLoader<T, Key, CachedKey>>;
}

@Injectable()
export class DataLoaderContext {
  private readonly loaderContexts = new WeakMap<object, LoaderContextType>();

  constructor(private readonly factory: DataLoaderFactory) {}

  /**
   * Grab a data loader instance for the given type and context.
   */
  async getLoader<T, Key, CachedKey = Key>(
    type: Type<DataLoaderStrategy<T, Key, CachedKey>>,
    context: ExecutionContext | object,
  ) {
    const lifetimeId =
      context instanceof ExecutionContextHost
        ? lifetimeIdFromExecutionContext(context)
        : context;
    return await this.forLifetime(lifetimeId).getLoader(type);
  }

  /**
   * Returns (and creates if needed) a loader context for this execution context.
   */
  attachToExecutionContext(context: ExecutionContext): LoaderContextType {
    return this.forLifetime(lifetimeIdFromExecutionContext(context));
  }

  /**
   * Returns (and creates if needed) a loader context for this object.
   */
  forLifetime(
    lifetimeId: object,
    notFoundAction: 'throw' | 'create' = 'create',
  ): LoaderContextType {
    return cached(this.loaderContexts, lifetimeId, () => {
      if (notFoundAction === 'create') {
        return this.createContext();
      }
      throw new Error('Loader context not found.');
    });
  }

  private createContext() {
    const contextId = ContextIdFactory.create();
    const loaders: LoaderContextType['loaders'] = new Map();
    const loaderContext: LoaderContextType = {
      contextId,
      loaders,
      getLoader: cacheable(loaders, (strategyType) =>
        this.factory.create(strategyType, contextId, loaderContext),
      ),
    };
    return loaderContext;
  }
}
