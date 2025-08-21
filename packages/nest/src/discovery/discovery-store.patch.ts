import { type Type } from '@nestjs/common';
import type { ModulesContainer } from '@nestjs/core';
import { DiscoverableMetaHostCollection } from '@nestjs/core/discovery/discoverable-meta-host-collection.js';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import { cached, type FnLike } from '@seedcompany/common';

let patched = false;

/**
 * Patch NestJS to allow storing multiple discoverable metadata keys per class.
 */
export const patchDiscoverableMetaHostCollectionToAllowMultipleKeys = () => {
  if (patched) {
    return;
  }
  patched = true;

  const metaKeysByTarget = new Map<FnLike | Type, Set<string>>();

  DiscoverableMetaHostCollection.addClassMetaHostLink = (
    target,
    metadataKey,
  ) => {
    cached(metaKeysByTarget, target, () => new Set()).add(metadataKey);
    // Keep pushing the latest key to the original map, in case others use it.
    DiscoverableMetaHostCollection.metaHostLinks.set(target, metadataKey);
  };

  (DiscoverableMetaHostCollection as any).inspectInstanceWrapper = (
    hostContainerRef: ModulesContainer,
    instanceWrapper: InstanceWrapper,
    wrapperByMetaKeyMap: WeakMap<
      ModulesContainer,
      Map<string, Set<InstanceWrapper>>
    >,
  ) => {
    /** Same as upstream: {@link DiscoverableMetaHostCollection.getMetaKeyByInstanceWrapper} */
    const target =
      instanceWrapper.metatype || instanceWrapper.inject
        ? instanceWrapper.instance?.constructor ?? instanceWrapper.metatype
        : instanceWrapper.metatype;

    /**
     * Below is the patch to call {@link DiscoverableMetaHostCollection.insertByMetaKey} multiple times
     * for each metadata key.
     */

    const upstreamKey =
      DiscoverableMetaHostCollection.metaHostLinks.get(target);

    // If no upstream key, then we know we don't have _any_ metadata keys.
    // Bail out for performance. This is called for every provider.
    if (!upstreamKey) {
      return;
    }

    const metaKeys = new Set([
      ...(metaKeysByTarget.get(target) ?? []),
      // Pull upstream key in case something else has modified it out from under us.
      // This should allow upstream to logic to continue to work regardless of our patch.
      ...(upstreamKey ? [upstreamKey] : []),
    ]);

    const collection = cached(
      wrapperByMetaKeyMap,
      hostContainerRef,
      () => new Map<string, Set<InstanceWrapper>>(),
    );
    for (const metaKey of metaKeys) {
      DiscoverableMetaHostCollection.insertByMetaKey(
        metaKey,
        instanceWrapper,
        collection,
      );
    }
  };
};
