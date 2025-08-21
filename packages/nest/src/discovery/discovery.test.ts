import { type Provider, SetMetadata, type Type } from '@nestjs/common';
import { DiscoveryService as NestDiscovery } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMetadataDecorator } from '../metadata-decorator.js';
import { patchDiscoverableMetaHostCollectionToAllowMultipleKeys } from './discovery-store.patch.js';
import { DiscoveryModule } from './discovery.module.js';
import {
  type DiscoveredClass,
  type DiscoveredMethod,
  MetadataDiscovery,
} from './discovery.service.js';

patchDiscoverableMetaHostCollectionToAllowMultipleKeys();

const Marked = createMetadataDecorator();

@Marked()
@SetMetadata('foo', 'bar')
class MarkedClass {}

@Marked()
class AnotherMarkedClass {}

class UnmarkedClass {}

class Methods {
  @Marked()
  marked() {
    return this;
  }

  @Marked()
  anotherMarked() {
    return this;
  }

  notMarked() {
    return this;
  }
}

const NestMarked = NestDiscovery.createDecorator();
@NestMarked()
class NestMarkedClass {}

const setup = async (providers: Provider[]) => {
  const app = await Test.createTestingModule({
    imports: [DiscoveryModule],
    providers,
  }).compile();
  await app.init();
  return app.get(MetadataDiscovery);
};

describe('MetadataDiscovery', () => {
  describe('Provider discovery', () => {
    class DerivedMarkedClass extends MarkedClass {}

    let classes: readonly DiscoveredClass[];

    beforeAll(async () => {
      const discovery = await setup([
        MarkedClass,
        UnmarkedClass,
        Methods,
        { provide: 'Existing', useExisting: MarkedClass },
        { provide: 'Class', useClass: MarkedClass },
        { provide: 'Value', useValue: new MarkedClass() },
        { provide: 'Factory', useFactory: () => new MarkedClass() },
        DerivedMarkedClass,
      ]);
      classes = discovery.discover(Marked).classes();
    });

    it('Type provider', () => {
      expect(
        classes.find(
          ({ classRef, wrapper }) =>
            classRef === MarkedClass && wrapper.token === MarkedClass,
        ),
      ).toBeTruthy();
    });

    it('Class provider', () => {
      expect(
        classes.find(
          ({ classRef, wrapper }) =>
            classRef === MarkedClass && wrapper.token === 'Class',
        ),
      ).toBeTruthy();
    });

    it('Not Existing provider', () => {
      expect(
        classes.find(({ wrapper }) => wrapper.token === 'Existing'),
      ).toBeUndefined();
    });

    it('Not Value provider', () => {
      expect(
        classes.find(({ wrapper }) => wrapper.token === 'Value'),
      ).toBeUndefined();
    });

    it('Not Factory provider', () => {
      expect(
        classes.find(({ wrapper }) => wrapper.token === 'Factory'),
      ).toBeUndefined();
    });

    it('No Inheritance', () => {
      expect(
        classes.find(({ classRef }) => classRef === DerivedMarkedClass),
      ).toBeUndefined();
    });
  });

  it('classes', async () => {
    const discovery = await setup([
      MarkedClass,
      AnotherMarkedClass,
      UnmarkedClass,
      Methods,
    ]);
    const classes = discovery.discover(Marked).classes();
    const expectedDiscovery = (cls: Type): DiscoveredClass => ({
      meta: true,
      instance: expect.any(cls),
      classRef: cls,
      wrapper: expect.anything(),
    });
    expect(classes).toContainEqual(expectedDiscovery(MarkedClass));
    expect(classes).toContainEqual(expectedDiscovery(AnotherMarkedClass));
    expect(classes).not.toContainEqual(expectedDiscovery(UnmarkedClass));
    expect(classes).not.toContainEqual(expectedDiscovery(Methods));
  });

  it('Nest decorator works', async () => {
    const discovery = await setup([NestMarkedClass, UnmarkedClass]);
    const classes = discovery.discover(NestMarked).classes();
    expect(classes).toHaveLength(1);
    expect(classes).toContainEqual({
      meta: {},
      instance: expect.any(NestMarkedClass),
      classRef: NestMarkedClass,
      wrapper: expect.anything(),
    });
    expect(classes).not.toContainEqual({
      meta: {},
      instance: expect.any(UnmarkedClass),
      classRef: UnmarkedClass,
      wrapper: expect.anything(),
    });
  });

  it('Patch to allow multiple metadata works', async () => {
    const Marked2 = createMetadataDecorator();

    @Marked()
    @Marked2()
    @NestMarked()
    class MultipleMetadata {}

    const discovery = await setup([MultipleMetadata]);

    expect(discovery.discover(Marked).classes()).toHaveLength(1);
    expect(discovery.discover(Marked2).classes()).toHaveLength(1);
    expect(discovery.discover(NestMarked).classes()).toHaveLength(1);
  });

  it('methods', async () => {
    const discovery = await setup([Methods]);
    const methods = discovery.discover(Marked).methods();
    const expectedDiscovery = (methodName: string): DiscoveredMethod => ({
      meta: true,
      instance: expect.any(Methods),
      classRef: Methods,
      wrapper: expect.anything(),
      methodName,
      method: expect.anything(),
    });
    expect(methods).toContainEqual(expectedDiscovery('marked'));
    expect(methods).toContainEqual(expectedDiscovery('anotherMarked'));
    expect(methods).not.toContainEqual(expectedDiscovery('notMarked'));

    const marked = methods.find((m) => m.methodName === 'marked')!;
    // Method is callable and bound to the current instance.
    expect(marked.method()).toBe(marked.instance);
  });
});
