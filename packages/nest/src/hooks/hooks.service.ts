import { Injectable, type Type } from '@nestjs/common';
import { HooksRegistry } from './hooks.registry.js';

/**
 * Use this service to run hooks.
 *
 * @example
 * ```ts
 * @Injectable()
 * class UserService {
 *   constructor(private readonly hooks: Hooks) {}
 *
 *   async create() {
 *     ...
 *     await this.hooks.run(new UserCreatedHook(user));
 *     ...
 *   }
 * }
 * ```
 */
@Injectable()
export class Hooks {
  constructor(readonly registry: HooksRegistry) {}

  async run<Hook extends object>(hook: Hook): Promise<Hook> {
    const hookType = hook.constructor as Type;
    for (const listeners of this.registry.get(hookType)) {
      await listeners(hook);
    }
    return hook;
  }
}
