import { Inject } from '@nestjs/common';

/**
 * A helper to inject a dependency into a target dynamically.
 * Mainly to allow decorators access to services.
 *
 * The target needs to be an instance of a class decorated with Injectable().
 * The `inject` token has to also be available to inject, obviously.
 *
 * This adds a property injection, dynamically, and facilitates typed retrieval.
 *
 * Since this is a property injection, it has to be applied at instance creation,
 * before NestJS injects properties.
 * And it can't be retrieved until after this as happened, like with a method call.
 */
export const depInjector = <Service>(
  inject: (abstract new (...args: any) => Service) | symbol | string,
  target?: unknown,
) => {
  const key =
    typeof inject === 'symbol'
      ? inject
      : Symbol.for(
          typeof inject === 'string' ? inject : inject.constructor.name,
        );

  const injector = {
    key,
    inject: (target: any) => {
      if (target[key] === undefined) {
        Inject(inject)(target, key);
        // Ensure prop injection is only done once, by having
        // subsequent methods in this class will skip this if statement.
        target[key] = null;
      }
    },
    getFor: (instance: unknown) => {
      // @ts-expect-error problem with the symbol key. I think bc it's dynamic.
      const service: Service = instance[key];
      return service;
    },
  };

  if (target) {
    injector.inject(target);
  }

  return injector;
};
