import { Module } from '@nestjs/common';
import { DiscoveryModule as NestDiscoveryModule } from '@nestjs/core';
import { MetadataDiscovery } from './discovery.service.js';

@Module({
  imports: [NestDiscoveryModule],
  providers: [MetadataDiscovery],
  exports: [MetadataDiscovery],
})
export class DiscoveryModule {}
