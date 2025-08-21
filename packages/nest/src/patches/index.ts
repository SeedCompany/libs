import { patchDiscoverableMetaHostCollectionToAllowMultipleKeys } from '../discovery/discovery-store.patch.js';
import { patchDoNotRetransformClassInstances } from './class-transformer.patch.js';

patchDoNotRetransformClassInstances();
patchDiscoverableMetaHostCollectionToAllowMultipleKeys();
