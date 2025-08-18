/* eslint-disable @typescript-eslint/unbound-method */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OnHook } from './hooks.decorator.js';
import { HooksModule } from './hooks.module.js';
import { HooksRegistry } from './hooks.registry.js';
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
  let app: INestApplication;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HooksModule],
      providers: [TestClassListener, TestMethodListener],
    }).compile();
    app = module.createNestApplication();
    await app.init();
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
    await app.get(Hooks).run(testHook);
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
    const registry = app.get(HooksRegistry);
    registry.add(TestHook, last, 10);
    registry.add(TestHook, first, -10);

    registry.add(TestHook, nope);
    registry.remove(TestHook, nope);

    await app.get(Hooks).run(testHook);
    expect(testHook.called).toHaveBeenCalledTimes(4);
    expect(testHook.called).not.toHaveBeenCalledWith('nope');
    expect(testHook.called).nthCalledWith(1, 'first');
    expect(testHook.called).nthCalledWith(2, 'class');
    expect(testHook.called).nthCalledWith(3, 'method');
    expect(testHook.called).nthCalledWith(4, 'last');
  });
});
