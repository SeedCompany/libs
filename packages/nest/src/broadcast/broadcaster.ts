/* eslint-disable @typescript-eslint/unified-signatures,@typescript-eslint/no-empty-interface */
import { type Type } from '@nestjs/common';
import {
  firstValueFrom,
  type InteropObservable,
  type Observable,
  type Observer,
  type Subscribable,
} from 'rxjs';
import type { DistributedPick, ValueOf } from 'type-fest';
import { toAsyncIterable } from '../to-async-iterable.js';

/**
 * Declare event names and their event shape with this interface via declaring merging.
 */
export interface BroadcastEvents {}

// eslint-disable-next-line @typescript-eslint/no-namespace -- its fine for types
export namespace Broadcaster {
  export type KnownName = keyof BroadcastEvents & string;
  export type EventOf<K extends KnownName> = ValueOf<
    DistributedPick<BroadcastEvents, K>
  >;
}

/**
 * A service to broadcast events to subscribers.
 *
 * This scales horizontally (probably by using Redis pub/sub),
 * so every process shares the events.
 *
 * Data is serialized to JSON (probably).
 */
export abstract class Broadcaster {
  /**
   * Grab a channel for the given name.
   *
   * This returns the same channel instance for the same name,
   * as long as the previous instance has not been garbage collected.
   */
  abstract channel<const Name extends Broadcaster.KnownName>(
    name: Name,
    id?: string | number,
  ): BroadcastChannel<Name extends never ? unknown : Broadcaster.EventOf<Name>>;
  abstract channel<Data>(
    classType: Type<Data> | string,
    id?: string | number,
  ): BroadcastChannel<Data>;
  abstract channel<Data>(
    channel: BroadcastChannel<Data>,
  ): BroadcastChannel<Data>;
}

/**
 * A specific broadcast channel.
 *
 * Data can be sent via {@link publish}.
 * Data can be received with observables or async iteration.
 */
export abstract class BroadcastChannel<Data = unknown>
  implements InteropObservable<Data>, Subscribable<Data>, AsyncIterable<Data>
{
  /** The name of the channel */
  readonly name: string;

  /** Publish an event to the channel */
  abstract publish(data: Data): void;

  /**
   * Observe events published on this channel.
   * This is a cold observable, so it still needs to be subscribed to.
   *
   * Because of the nature of this pub/sub, potentially multiple processes,
   * all subscriptions need to be manually unsubscribed, they will not be
   * automatically garbage collected.
   * The streams will, however, be completed when the NestJS module is destroyed,
   * allowing subscriptions to be garbage collected.
   */
  abstract observe(): Observable<Data>;

  /**
   * A shortcut for `observe().subscribe(...)`.
   */
  subscribe(observer?: Partial<Observer<Data>> | ((value: Data) => void)) {
    return this.observe().subscribe(observer);
  }

  /**
   * A shortcut for `observe().pipe(...)`.
   */
  get pipe() {
    const obs = this.observe();
    return obs.pipe.bind(obs);
  }

  /**
   * Wait for the next event to be published on this channel.
   */
  wait() {
    return firstValueFrom(this.observe());
  }

  /**
   * Interop allowing this to work directly with any observable-input.
   * @example
   * rx.from(Broadcaster.channel('foo'))
   */
  [Symbol.observable]() {
    return this;
  }

  /**
   * @example
   * ```ts
   * const channel: BroadcastChannel<string>;
   * for await (const message of channel) {
   *   console.log(message);
   *   // break to unsubscribe, and exit the block, otherwise this will loop forever
   *   break;
   * }
   * ```
   * If manually iterating, then be sure to call `done()`,
   * otherwise the stream is not unsubscribed.
   *
   * @example
   * ```ts
   * const it = channel[Symbol.asyncIterator]();
   * const {value: packet} = await it.next() // will wait for event to be emitted
   * await it.done(); // will unsubscribe from the stream and return immediately-ish
   * ```
   */
  [Symbol.asyncIterator](): AsyncIterator<Data> {
    return toAsyncIterable(this.observe());
  }
}
