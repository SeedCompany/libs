import { Module } from '@nestjs/common';
import { DiscoveryModule } from '../discovery/index.js';
import { HooksDiscovery } from './hooks.discovery.js';
import { HooksRegistry } from './hooks.registry.js';
import { Hooks } from './hooks.service.js';

@Module({
  imports: [DiscoveryModule],
  providers: [HooksDiscovery, HooksRegistry, Hooks],
  exports: [Hooks, HooksRegistry],
})
export class HooksModule {}
