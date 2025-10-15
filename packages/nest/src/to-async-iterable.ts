import { Repeater } from '@repeaterjs/repeater';
import type { Subscribable } from 'rxjs';

export const toAsyncIterable = <T>(
  stream: Subscribable<T>,
): AsyncIterable<T> & AsyncIterator<T> => {
  return new Repeater<T>(async (push, stop) => {
    const subscription = stream.subscribe({
      next: (value) => void push(value),
      error: (err) => stop(err),
      complete: () => stop(),
    });
    await stop;
    subscription.unsubscribe();
  });
};
