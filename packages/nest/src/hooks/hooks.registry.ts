import type { Type } from '@nestjs/common';
import { cached } from '@seedcompany/common';
import { PrioritySet, ReadonlyPrioritySet } from '../prioritySet.js';

export type HookListener = (hook: object) => Promise<void> | void;
export interface HookRegistration {
  hook: Type;
  listener: HookListener;
  priority?: number;
}

/**
 * Holds hook listeners with their priorities.
 *
 * Listeners can be manually added or removed here whenever.
 */
export class HooksRegistry {
  private readonly listeners = new Map<Type, PrioritySet<HookListener>>();

  getAll(): ReadonlyMap<Type, ReadonlyPrioritySet<HookListener>> {
    return this.listeners;
  }

  *get(hook: Type): Iterable<HookListener> {
    yield* this.listeners.get(hook) ?? [];
  }

  add(hook: Type, listener: HookListener, priority?: number) {
    this.upsert(hook).add(listener, priority);
  }

  addAll(registrations: Iterable<HookRegistration>) {
    for (const { hook, listener, priority } of registrations) {
      this.upsert(hook).add(listener, priority);
    }
  }

  remove(hook: Type, listener: HookListener) {
    this.listeners.get(hook)?.delete(listener);
  }

  private upsert(hook: Type) {
    return cached(this.listeners, hook, () => new PrioritySet());
  }
}
