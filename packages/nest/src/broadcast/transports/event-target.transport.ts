import type {
  TypedEvent as Event,
  TypedEventTarget as TEventTarget,
} from '@graphql-yoga/typed-event-target';
import { CustomEvent } from '@whatwg-node/events';
import { fromEvent, map } from 'rxjs';
import type { BroadcastChannel as Channel } from '../broadcaster.js';
import { type BroadcasterTransport as Transport } from './transport.js';

export class EventTargetTransport implements Transport {
  constructor(
    protected readonly eventTarget: TEventTarget<Event> = new EventTarget(),
  ) {}

  publish({ name }: Channel, data: unknown) {
    this.eventTarget.dispatchEvent(new CustomEvent(name, { detail: data }));
  }

  observe({ name }: Channel) {
    return fromEvent(this.eventTarget, name).pipe(map((event) => event.detail));
  }
}
