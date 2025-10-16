import {
  Injectable,
  Logger,
  type LoggerService,
  type OnModuleDestroy,
  Optional,
  type Type,
} from '@nestjs/common';
import { CachedByArg, setInspectOnClass } from '@seedcompany/common';
import { from, Observable, share, type Subscriber } from 'rxjs';
import { withAsyncContext } from '../with-async-context.js';
import {
  Broadcaster as IBroadcaster,
  BroadcastChannel as IChannel,
} from './broadcaster.js';
import { BroadcasterTransport as Transport } from './transports/transport.js';

/**
 * This class handles creating/serving channels.
 * It only manages the channel/observable lifetimes.
 * It leaves the actual publishing/observing to the given transport.
 *
 * Honestly, I'm not sure if any of this is necessary.
 * Except for the automatic subscription cleanup on module destruction.
 * I do like the Broadcaster interface, though.
 * Allowing for RxJS is more NestJS friendly.
 * Allowing for async iterables goes right into GQL subscriptions.
 * Also, having our own interface decouples from underlying transport/library.
 */
@Injectable()
export class DurableBroadcaster
  extends IBroadcaster
  implements OnModuleDestroy
{
  constructor(
    private readonly transport: Transport,
    @Optional()
    private readonly logger: LoggerService | null = new Logger(
      IBroadcaster.name,
    ),
  ) {
    super();
  }

  private readonly channels = new Map<string, WeakRef<IChannel>>();
  private readonly cleanup = new FinalizationRegistry<string>((channel) => {
    this.logger?.debug?.(`Destroying channel ${channel}`);
    this.channels.delete(channel);
  });
  /**
   * A map to hold strong refs to channels that have subscribers.
   * This way the subscriptions won't get garbage collected even
   * if there is no other reference to the channel.
   * @example
   * ```ts
   * void Broadcaster.channel('foo').subscribe(() => { ... });
   * ```
   * Since there is no reference to the channel, it would be garbage collected.
   * This map prevents that.
   */
  private readonly subscribedChannels = new Map<
    Subscriber<unknown>,
    IChannel
  >();

  channel(nameIn: string | Type | IChannel, id?: string | number) {
    if (nameIn instanceof IChannel) {
      return nameIn;
    }
    const name =
      typeof nameIn === 'string'
        ? nameIn
        : nameIn.name + (id != null ? `:${id}` : '');
    const prev = this.channels.get(name)?.deref();
    if (prev) {
      return prev;
    }
    this.logger?.debug?.(`Creating channel ${name}`);

    const channel: IChannel<any> = new BroadcastChannel(this, name);
    this.channels.set(name, new WeakRef(channel));
    this.cleanup.register(channel, name);
    return channel;
  }

  doPublish(channel: BroadcastChannel, data: unknown) {
    this.transport.publish(channel, data);
  }

  doObserve(channel: BroadcastChannel & {}): Observable<unknown> {
    // Ensure that each subscriber gets their current async context.
    // The underlying transport can still be context-unaware/shared for the entire process.
    return this.observeTransport(channel).pipe(withAsyncContext());
  }

  @CachedByArg({ weak: true })
  observeTransport(channel: BroadcastChannel & {}): Observable<unknown> {
    return from(this.transport.observe(channel)).pipe(
      (source) =>
        new Observable((subscriber) => {
          this.subscribedChannels.set(subscriber, channel);
          const sub = source.subscribe(subscriber);
          return () => {
            this.subscribedChannels.delete(subscriber);
            sub.unsubscribe();
          };
        }),
      share(),
    );
  }

  async onModuleDestroy() {
    for (const [sub, _channel] of this.subscribedChannels) {
      sub.complete();
    }
  }
}

setInspectOnClass(DurableBroadcaster, () => ({
  include: ['transport', 'channels'],
}));

/**
 * Implementation just forwards back to the broadcaster,
 * allowing inheritance to customize logic without having to deal with this class.
 * This class also serves as a lifetime identifier.
 */
class BroadcastChannel extends IChannel {
  constructor(readonly broadcaster: DurableBroadcaster, readonly name: string) {
    super();
  }

  publish(data: unknown) {
    this.broadcaster.doPublish(this, data);
  }

  observe() {
    return this.broadcaster.doObserve(this);
  }
}
