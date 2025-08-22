/* eslint @typescript-eslint/ban-ts-comment: ["error", minimumDescriptionLength: 0] */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OnHook } from './hooks.decorator.js';
import { HooksModule } from './hooks.module.js';
import { Hooks } from './hooks.service.js';

class TestHook {
  called(_from: string) {
    // noop
  }
}

class NotCalledHook {
  called() {
    // noop
  }
}

@OnHook(TestHook)
class TestClassListener {
  handle(hook: TestHook) {
    hook.called('class');
  }
}

class TestMethodListener {
  @OnHook(TestHook)
  @OnHook(NotCalledHook) // multiple allowed
  asdf(hook: TestHook) {
    hook.called('method');
  }

  @OnHook(NotCalledHook)
  notCalled(hook: NotCalledHook) {
    hook.called();
  }
}

describe('HooksModule', () => {
  let app: TestingModule;
  let hooks: Hooks;
  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [HooksModule],
      providers: [TestClassListener, TestMethodListener],
    }).compile();
    await app.init();
    hooks = app.get(Hooks);
    expect(
      vi.spyOn(app.get(TestMethodListener), 'notCalled'),
    ).not.toHaveBeenCalled();
  });
  afterEach(async () => {
    await app.close();
  });

  it('should work with decorators', async () => {
    const testHook = new TestHook();
    testHook.called = vi.fn();
    await hooks.run(testHook);
    expect(testHook.called).toHaveBeenCalledTimes(2);
    expect(testHook.called).toHaveBeenCalledWith('class');
    expect(testHook.called).toHaveBeenCalledWith('method');
  });

  it('should work with priorities & manual registration', async () => {
    const testHook = new TestHook();
    testHook.called = vi.fn();

    const first = vi
      .fn()
      .mockImplementation((hook: TestHook) => hook.called('first'));
    const last = vi
      .fn()
      .mockImplementation((hook: TestHook) => hook.called('last'));
    const nope = vi
      .fn()
      .mockImplementation((hook: TestHook) => hook.called('nope'));
    hooks.registry.add(TestHook, last, 10);
    hooks.registry.add(TestHook, first, -10);

    hooks.registry.add(TestHook, nope);
    hooks.registry.remove(TestHook, nope);

    await hooks.run(testHook);
    expect(testHook.called).toHaveBeenCalledTimes(4);
    expect(testHook.called).not.toHaveBeenCalledWith('nope');
    expect(testHook.called).nthCalledWith(1, 'first');
    expect(testHook.called).nthCalledWith(2, 'class');
    expect(testHook.called).nthCalledWith(3, 'method');
    expect(testHook.called).nthCalledWith(4, 'last');
  });

  /* eslint-disable @seedcompany/no-unused-vars, @typescript-eslint/no-empty-function */
  async function typeAssertions() {
    hooks.registry.add(TestHook, (hook: TestHook) => {});
    hooks.registry.add(
      TestHook,
      // @ts-expect-error wrong function type
      (hook: Date) => {},
    );

    // Unfortunately, we have to use `any` here since each item in the list is a different hook.
    // There's no way to say for each item in the list, the hook & listener need to match, but
    // each item can be a different hook.
    hooks.registry.addAll([
      { hook: TestHook, listener: (hook: TestHook) => {} },
    ]);

    hooks.registry.remove(TestHook, (hook: TestHook) => {});
    hooks.registry.remove(
      TestHook,
      // @ts-expect-error wrong function type
      (hook: Date) => {},
    );

    // run returns hook instance
    const x: TestHook = await hooks.run(new TestHook());
    // @ts-expect-error wrong return type
    const y: Date = await hooks.run(new TestHook());
  }
  /* eslint-enable @seedcompany/no-unused-vars */
});
