import type { Type } from '@nestjs/common';
import { cached } from '@seedcompany/common';
import { PrioritySet, ReadonlyPrioritySet } from '../prioritySet.js';

export type HookListener<Hook extends object = object> = (
  hook: Hook,
) => Promise<void> | void;
export interface HookRegistration<Hook extends object> {
  hook: Type<Hook>;
  listener: HookListener<NoInfer<Hook>>;
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

  *get<Hook extends object>(hook: Type<Hook>): Iterable<HookListener<Hook>> {
    yield* this.listeners.get(hook) ?? [];
  }

  add<Hook extends object>(
    hook: Type<Hook>,
    listener: HookListener<NoInfer<Hook>>,
    priority?: number,
  ) {
    this.upsert(hook).add(listener as HookListener<Hook>, priority);
  }

  addAll(registrations: Iterable<HookRegistration<any>>) {
    for (const { hook, listener, priority } of registrations) {
      this.upsert(hook).add(listener, priority);
    }
  }

  remove<Hook extends object>(
    hook: Type<Hook>,
    listener: HookListener<NoInfer<Hook>>,
  ) {
    this.listeners.get(hook)?.delete(listener as HookListener);
  }

  private upsert<Hook extends object>(hook: Type<Hook>) {
    return cached(
      this.listeners,
      hook,
      () => new PrioritySet<HookListener<Hook>>(),
    );
  }
}
