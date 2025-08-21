import {
  createParamDecorator,
  type ExecutionContext,
  Injectable,
  type PipeTransform,
  type Type,
} from '@nestjs/common';
import type { ValOrFn } from '@seedcompany/common';
import { DataLoaderContext } from './data-loader.context.js';
import type { DataLoaderStrategy } from './data-loader.strategy.js';

type LoaderType = Type<DataLoaderStrategy<any, any>>;

/**
 * The decorator to be used within a Controller/Resolver.
 */
export const Loader =
  (type: ValOrFn<LoaderType>): ParameterDecorator =>
  (target, key, index) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is a runtime check
    if (!type) {
      const source = `${target.constructor.name}.${String(key)}[${index}]`;
      throw new Error(
        `@Loader for ${source} failed to reference loader class. Try wrapping the loader class in \`() => Type\`.`,
      );
    }

    LoaderInner(type, InjectLoaderPipe)(target, key, index);
  };

const LoaderInner = createParamDecorator(
  (
    type: ValOrFn<LoaderType>,
    context: ExecutionContext,
  ): IntermediateLoaderObject => {
    const resolvedType = type.prototype
      ? (type as LoaderType)
      : (type as () => LoaderType)();
    return { context, type: resolvedType };
  },
);

interface IntermediateLoaderObject {
  type: LoaderType;
  context: ExecutionContext;
}

@Injectable()
export class InjectLoaderPipe implements PipeTransform {
  constructor(private readonly dataLoaderContext: DataLoaderContext) {}

  async transform({ type, context }: IntermediateLoaderObject) {
    return await this.dataLoaderContext.getLoader(type, context);
  }
}
