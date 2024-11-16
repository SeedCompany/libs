import {
  createParamDecorator,
  type ExecutionContext,
  type Type,
} from '@nestjs/common';
import { getLoaderContextFromExecutionContext } from './data-loader.context.js';
import type { DataLoaderStrategy } from './data-loader.strategy.js';

type LoaderType = Type<DataLoaderStrategy<any, any>>;
type LoaderTypeOrFn = LoaderType | (() => LoaderType);

/**
 * The decorator to be used within a Controller/Resolver.
 */
export const Loader =
  (type: LoaderTypeOrFn): ParameterDecorator =>
  (target, key, index) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is a runtime check
    if (!type) {
      const source = `${target.constructor.name}.${String(key)}[${index}]`;
      throw new Error(
        `@Loader for ${source} failed to reference loader class. Try wrapping the loader class in \`() => Type\`.`,
      );
    }

    LoaderInner(type)(target, key, index);
  };

const LoaderInner = createParamDecorator(
  (type: LoaderTypeOrFn, context: ExecutionContext) => {
    const resolvedType = type.prototype
      ? (type as LoaderType)
      : (type as () => LoaderType)();

    const loaderContext = getLoaderContextFromExecutionContext(context);
    return loaderContext.getLoader(resolvedType);
  },
);
