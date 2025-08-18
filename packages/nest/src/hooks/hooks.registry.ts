import type { Type } from '@nestjs/common';
import { cached, cmpBy } from '@seedcompany/common';

export type HookListener = (hook: object) => Promise<void> | void;
export interface HookRegistration {
  hook: Type;
  listener: HookListener;
  priority: number;
}

/**
 * Holds hook listeners with their priorities.
 *
 * Listeners can be manually added or removed here whenever.
 *
 * It is up to you to ensure that the listeners aren't registered multiple times.
 */
export class HooksRegistry {
  private listeners: HookRegistration[] = [];
  private readonly orderedCache = new Map<Type, HookListener[]>();

  get(hook: Type): readonly HookListener[] {
    return cached(this.orderedCache, hook, () =>
      this.listeners
        .filter((registration) => registration.hook === hook)
        .sort(cmpBy((registration) => registration.priority))
        .map((registration) => registration.listener),
    );
  }

  add(hook: Type, listener: HookListener, priority = 0) {
    this.addAll([{ hook, listener, priority }]);
  }

  addAll(registrations: readonly HookRegistration[]) {
    this.listeners.push(...registrations);
    this.orderedCache.clear();
  }

  remove(hook: Type, listener: HookListener) {
    this.listeners = this.listeners.filter(
      (registration) =>
        !(registration.hook === hook && registration.listener === listener),
    );
  }
}
