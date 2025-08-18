import { Injectable, type OnModuleInit } from '@nestjs/common';
import { MetadataDiscovery } from '../discovery/index.js';
import { OnHook } from './hooks.decorator.js';
import { type HookListener, HooksRegistry } from './hooks.registry.js';

@Injectable()
export class HooksDiscovery implements OnModuleInit {
  constructor(
    private readonly registry: HooksRegistry,
    private readonly discovery: MetadataDiscovery,
  ) {}

  async onModuleInit() {
    const discovery = this.discovery.discover(OnHook);

    this.registry.addAll([
      ...discovery
        .classes<{ handle: HookListener }>()
        .flatMap(({ meta, instance }) =>
          meta.map((registration) => ({
            ...registration,
            listener: instance.handle.bind(instance),
          })),
        ),
      ...discovery.methods().flatMap(({ meta, method }) =>
        meta.map((registration) => ({
          ...registration,
          listener: method,
        })),
      ),
    ]);
  }
}
