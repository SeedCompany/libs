import type { ObservableInput } from 'rxjs';
import type { BroadcastChannel as Channel } from '../broadcaster.js';

export abstract class BroadcasterTransport {
  abstract publish(channel: Channel, data: unknown): void;

  abstract observe(channel: Channel): ObservableInput<unknown>;
}
