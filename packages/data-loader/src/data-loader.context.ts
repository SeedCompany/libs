import { ExecutionContext, Injectable, Type } from '@nestjs/common';
import { ContextId, ContextIdFactory } from '@nestjs/core';
import { cacheable, cached } from '@seedcompany/common';
import { DataLoaderFactory } from './data-loader.factory';
import { DataLoaderStrategy } from './data-loader.strategy';
import { DataLoader } from './data-loader.type';
import { lifetimeIdFromExecutionContext } from './lifetime-id-from-execution-context';

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
  constructor(private readonly factory: DataLoaderFactory) {}

  /**
   * Returns (and creates if needed) a loader context for this execution context.
   */
  attachToExecutionContext(context: ExecutionContext) {
    return cached(loaderContexts, lifetimeIdFromExecutionContext(context), () =>
      this.createContext(),
    );
  }

  createContext(): LoaderContextType {
    const contextId = ContextIdFactory.create();
    const loaders: LoaderContextType['loaders'] = new Map();
    return {
      contextId,
      loaders,
      getLoader: cacheable(loaders, (strategyType) =>
        this.factory.create(strategyType, contextId),
      ),
    };
  }
}

export const getLoaderContextFromExecutionContext = (
  context: ExecutionContext,
) => getLoaderContextFromLifetimeId(lifetimeIdFromExecutionContext(context));

export const getLoaderContextFromLifetimeId = (lifetimeId: object) => {
  const context = loaderContexts.get(lifetimeId);
  if (!context) {
    throw new Error(
      'Loader context not found. Maybe this execution is called too early?',
    );
  }
  return context;
};

/**
 * A global variable isn't my favorite, but it needs to be separate from a service
 * so that the loader decorator can access it.
 * We could mutate the lifetime object and store the loader context on a symbol there.
 * But this is better because it doesn't modify that object.
 */
const loaderContexts = new WeakMap<object, LoaderContextType>();
