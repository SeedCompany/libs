import { Injectable, type Type } from '@nestjs/common';
import {
  type DiscoverableDecorator,
  DiscoveryService as NestDiscovery,
  MetadataScanner as PrototypeScanner,
} from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import { type FnLike } from '@seedcompany/common';
import {
  createMetadataDecorator,
  type DecoratorTypes,
  type MetadataDecorator,
} from '../metadata-decorator.js';
// eslint-disable-next-line @seedcompany/no-unused-vars -- used in jsdoc
import type { patchDiscoverableMetaHostCollectionToAllowMultipleKeys as patch } from './discovery-store.patch.js';

export interface DiscoveredClass<Meta = unknown, T = object> {
  meta: Meta;
  instance: T;
  classRef: Type<T>;
  wrapper: InstanceWrapper<T>;
}

export interface DiscoveredMethod<
  Meta = unknown,
  Fn extends FnLike = FnLike,
  T = object,
> extends DiscoveredClass<Meta, T> {
  method: Fn;
  methodName: string;
}

/**
 * A service to discover NestJS providers across the application that have been decorated with certain metadata.
 *
 * The metadata decoration must come from our {@link createMetadataDecorator} function or Nest's {@link NestDiscovery.createDecorator}.
 *
 * Constraints:
 * - The metadata decorator needs to be discoverable (option, defaults to true).
 * - Nest has to construct the provider (type or class; not value, factory, or existing).
 *
 * If not using our {@link patch}, then only one metadata can be used per class (including methods).
 *
 * ## Other Art - Nest's built-in functionality ({@link NestDiscovery}).
 * Its decorator is not as robust as our {@link createMetadataDecorator}.
 * Its service makes you do more work to narrow down to providers with their given metadata.
 * And even more work to identify methods within that provider that have been decorated.
 *
 * This class is a wrapper around that service to provide a simpler, better-typed interface.
 *
 * ## Other Art - [@golevelup/nestjs-discovery](https://github.com/golevelup/nestjs/tree/master/packages/discovery).
 * In general, this is a lite version of that package. It is more robust in its discovery.
 * It can discover dynamic (async/factory) providers, and it has no constraints on how the metadata is declared.
 * In contrast, this package requires that the metadata be declared with the aforementioned functions. These functions add mark used classes
 * in a special way so that NestJS can discover them easily.
 * We also can only discover providers that NestJS constructs - `useValue` & `useFactory` do not work.
 * IMO the functionality within these constraints is sufficient and provides a performant implementation.
 *
 * Also, I skipped all controller discovery, as we don't use controllers nor do I understand the use-case to need to discover them.
 *
 * @example
 * ```ts
 * const Foo = createMetadataDecorator();
 *
 * @Foo()
 * class SomeService {}
 *
 * @Module({
 *   imports: [DiscoveryModule],
 *   providers: [SomeService],
 * })
 * export class AppModule {
 *   constructor(private discovery: MetadataDiscovery) {}
 *
 *   onModuleInit() {
 *     const fooServices = this.discovery.discover(Foo).classes();
 *   }
 * }
 * ```
 */
@Injectable()
export class MetadataDiscovery {
  constructor(
    private readonly discovery: NestDiscovery,
    private readonly prototypeScanner: PrototypeScanner,
  ) {}

  discover<Meta, Types extends DecoratorTypes = DecoratorTypes>(
    decorator:
      | MetadataDecorator<Meta, Types, any>
      | DiscoverableDecorator<Meta>
      | string,
  ) {
    const resolved: MetadataDecorator<Meta> =
      typeof decorator !== 'string' && 'get' in decorator
        ? (decorator as MetadataDecorator<Meta>)
        : createMetadataDecorator({
            key: typeof decorator !== 'string' ? decorator.KEY : decorator,
          });
    return new MetadataDiscoverer<Meta>(
      resolved,
      this.discovery,
      this.prototypeScanner,
    );
  }
}

class MetadataDiscoverer<Meta> {
  constructor(
    private readonly decorator: MetadataDecorator<Meta>,
    private readonly discovery: NestDiscovery,
    private readonly prototypeScanner: PrototypeScanner,
  ) {}

  classes<T = object>(): ReadonlyArray<DiscoveredClass<Meta, T>> {
    return this.providers<T>().flatMap((provider) => {
      const meta = this.decorator.get(provider.classRef);
      return meta ? { meta, ...provider } : [];
    });
  }

  methods<Fn extends FnLike, T = object>(): ReadonlyArray<
    DiscoveredMethod<Meta, Fn, T>
  > {
    return this.providers<T>().flatMap((provider) =>
      this.prototypeScanner
        .getAllMethodNames(provider.classRef.prototype)
        .flatMap((methodName) => {
          const meta = this.decorator.get(provider.classRef, methodName);
          if (!meta) {
            return [];
          }
          return {
            ...provider,
            meta,
            methodName,
            method: ((provider.instance as any)[methodName] as Fn).bind(
              provider.instance,
            ) as Fn,
          };
        }),
    );
  }

  private providers<T>(): ReadonlyArray<
    Omit<DiscoveredClass<unknown, T>, 'meta'>
  > {
    const providers = this.discovery.getProviders({
      // symbols work fine here, even though they're not typed.
      metadataKey: this.decorator.KEY as string,
    });
    return providers.flatMap((wrapper) => {
      const { instance, metatype } = wrapper;
      // It is safe to assume metatype is the class ref, as that is the only way Nest discovers it.
      const cls: Type | undefined = instance?.constructor ?? metatype;
      return cls ? { wrapper, instance, classRef: cls } : [];
    });
  }
}
