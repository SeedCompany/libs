import type { Type } from '@nestjs/common';
import { createMetadataDecorator } from '../metadata-decorator.js';

/**
 * Declare this method (or class) to be a hook listener.
 *
 * @example
 * ```ts
 * @Injectable()
 * class FooListener {
 *   @OnHook(UserCreatedHook)
 *   async afterUserCreated(hook: UserCreatedHook) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @example
 * Classes can also be declared as hooks, and we will call a `handle()` method.
 * ```ts
 * @Injectable()
 * @OnHook(UserCreatedHook)
 * class FooListener {
 *   async handle(hook: UserCreatedHook) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @example
 * You can also declare a hook with a priority. Lower priority numbers go first.
 * ```ts
 * @Injectable()
 * class FooListener {
 *   @OnHook(UserCreatedHook, 10)
 *   async onUserCreatedLate(hook: UserCreatedHook) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @example
 * You can also declare multiple hooks at once.
 * ```ts
 * @Injectable()
 * class FooListener {
 *   @OnHook(UserCreatedHook)
 *   @OnHook(UserUpdatedHook)
 *   async onUserChange(hook: UserCreatedHook | UserUpdatedHook) {
 *     // ...
 *   }
 * }
 * ```
 */
export const OnHook = createMetadataDecorator({
  types: ['method', 'class'],
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  setter: (hook: Type, priority: number = 0) => [{ hook, priority }],
  merge: ({ previous, next }) => [...(previous ?? []), ...next],
});
