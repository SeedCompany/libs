import { ExecutionContext } from '@nestjs/common';
import type {
  GqlContextType,
  GqlExecutionContext as GqlExecutionContextType,
} from '@nestjs/graphql';

/**
 * Determines which object contained in the execution context should be used as the lifetime identity.
 * This is typically the request or the transport context object.
 */
export const lifetimeIdFromExecutionContext = (
  context: ExecutionContext,
): object => {
  const type = context.getType<GqlContextType>();
  if (type === 'graphql') {
    return GqlExecutionContext.create(context).getContext();
  }
  if (type === 'http') {
    return context.switchToHttp().getRequest();
  }
  if (type === 'rpc') {
    return context.switchToRpc().getContext();
  }

  // Guess that the first arg is an object representing the appropriate lifetime
  const firstArg = context.getArgByIndex(0);
  if (firstArg && typeof firstArg === 'object') {
    return firstArg;
  }
  throw new Error('Unable to determine lifetime object from execution context');
};

/**
 * Going through the trouble of not specifically requiring the @nestjs/graphql library.
 */
let GqlExecutionContext: {
  create: (exe: ExecutionContext) => GqlExecutionContextType;
} = {
  create: () => {
    throw new Error(
      '@nestjs/graphql library is not listed in package.json dependencies',
    );
  },
};
export const loadingGqlExecutionContext = (async () => {
  const mod = await import('@nestjs/graphql');
  GqlExecutionContext = mod.GqlExecutionContext;
})();
