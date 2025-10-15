import { type Type } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import {
  Broadcaster,
  type BroadcastChannel as Channel,
} from './broadcaster.js';

/**
 * ProxyBroadcaster allows pointing to another broadcaster dynamically.
 *
 * It can be swapped out all together by mutating the `current` property.
 * It also allows running a function with a different broadcaster in that scope.
 */
export class ProxyBroadcaster extends Broadcaster {
  private readonly als = new AsyncLocalStorage<Broadcaster>();
  constructor(public current: Broadcaster) {
    super();
  }

  runUsing<R>(broadcaster: Broadcaster, fn: () => R): R {
    return this.als.run(broadcaster, fn);
  }

  channel<const Name extends Broadcaster.KnownName>(
    name: Name,
    id?: string | number,
  ): Channel<Name extends never ? unknown : Broadcaster.EventOf<Name>>;
  channel<Data>(
    classType: Type<Data> | string,
    id?: string | number,
  ): Channel<Data>;
  channel<Data>(channel: Channel<Data>): Channel<Data>;
  channel(nameIn: string | Type | Channel, id?: string | number) {
    const broadcaster = this.als.getStore() ?? this.current;
    return broadcaster.channel(nameIn as string, id);
  }
}
