# Broadcast (Pub/Sub) Module

A lightweight, type-safe pub/sub abstraction for NestJS services that plays
nicely with both Observables/RxJS and Async Iteration (GraphQL Subscriptions).

It declares a simple `Broadcaster`/`BroadcastChannel` interface pair
for publishing and consuming events over named channels.

It's backed by pluggable transports with out-of-the-box support for 
the standard `EventTarget` API:
- In-memory `EventTarget` for local/dev use
- Redis-backed `EventTarget` for horizontal scaling (via `@graphql-yoga/redis-event-target`)

The API is designed to be ergonomic in NestJS codebases,
encouraging strong typing without a lot of boilerplate
and supporting multiple consumption styles (observables and async iterables).

Contents
- [Setup](#setup)
- [Typed Channels](#typed-channels)
- [Consuming events](#consuming-events) (RxJS, async iterables, one-shot)

## Setup

No module is provided here.
It is left to the user to do so in a way that works best for their setup.  
It could be as simple as this:
```ts
import {
  Broadcaster,
  EventTargetBroadcaster,
  DurableBroadcaster,
} from '@seedcompany/nest/broadcast';

@Module({
  providers: [
    {
      provide: Broadcaster,
      useFactory: () =>
        new DurableBroadcaster(
          new EventTargetBroadcaster()
        ),
    },
  ],
})
export class AppModule {}
```

## Typed Channels

Channels have a name and have a specific data type.
There are three ways to declare channels:

### One-off channels (ad hoc)

Use a string name and provide the data type where you declare the channel.
```ts
const refresh = broadcaster.channel<void>('refresh');
refresh.publish();
refresh.subscribe(() => { /* ... */ });
```
Tip: You can wrap channel access in a lazy getter to keep types inferred
across the single class service usage.

### Event classes

Use a class as the channel key for types and reuse across modules without central registration.

```ts
export class ProjectNameChanged {
  id: string;
  name: string;
}

// Publish
broadcaster.channel(ProjectNameChanged).publish({ id: '1', name: 'Alpha' });

// Subscribe elsewhere
broadcaster
  .channel(ProjectNameChanged)
  .subscribe(({ id, name }) => { /* ... */ });
```

You can also pass an optional `id` to `channel()` which scopes the channel to that id.
```ts
const channel = broadcaster.channel(ProjectNameChanged, '123');
channel.name //=> "ProjectUpdated:123"
```

### Global registration via TS declaration merging
Declare your broadcast events in module augmentation to get autocomplete and type safety
without importing runtime references everywhere.
```ts
declare module '@seedcompany/nest/broadcast' {
  interface BroadcastEvents {
    'object-created': {
      typename: string;
      id: string;
    };
  }
}

// Fully typed usage
broadcaster.channel('object-created').publish({ typename: 'project', id: '1' });
```

## Consuming events

You can consume events using RxJS or async iterables.

### RxJS (recommended for general use)
```ts
const onCreate = broadcaster.channel('object-created');

// Subscribe
const sub = onCreate.subscribe(({ id, typename }) => {
  // ...
});
// Remember to unsubscribe when appropriate
sub.unsubscribe();

// Pipe through operators
onCreate.pipe(/* operators */);

// Combine with other observables
import * as rx from 'rxjs';
const onAnyChange = rx.merge(
  broadcaster.channel('object-created'),
  broadcaster.channel('object-deleted'),
);
```

### Async iterables
```ts
for await (const { id, typename } of onCreate) {
  // ...
  // Be sure to break to avoid leaking the subscription when done
  break;
}
```
GraphQL example: return the channel directly from a subscription resolver
```ts
@Subscription(/* ... */)
onObjectCreate() {
  return this.broadcaster.channel('object-created');
}
```

### One-shot wait
Sometimes you only need the next event once (e.g., coordinating a distributed task).

```
const refreshDone = broadcaster.channel<void>('refresh');
await refreshDone.wait(); // waits for next event
// elsewhere
refreshDone.publish();
```
