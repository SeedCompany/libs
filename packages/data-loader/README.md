# Yet another DataLoader for NestJS

As most were, this is inspired by [TreeMan360/nestjs-graphql-dataloader](https://github.com/TreeMan360/nestjs-graphql-dataloader)

This one offers several differences over that and other forks:

- It works with any `ExecutionContext`, not just GraphQL
- It supports access inside _guards_ not just _interceptors & resolvers_
- DataLoader instances are created separately from the strategy logic.
  Others handle this abstraction via extending a library provided class.
- Default configuration options can be given when the module is registered.
  Such as customizing error messages or setting a default max batch size.
- Like others, this library handles sorting the results to match the order of the keys.
  How the key is derived from the item is configurable via `propertyKey`.
- Errors can be returned from `loadMany` batch calls, but in a different shape compared to other libraries and raw dataloaders.
  ```ts
  { key: Key, error: Error }
  ```
  This allows us to match the error to the appropriate key without enforcing errors to contain them.
- Type aliases are provided to prevent having to duplicate _Item & Key_ types at call site.
  Since parameter types have no enforceable correlation to their decorators, it's easy to mess up
  the item/key types when explicitly providing them.
  With this library the usage just references the loader strategy which declares the item/key types.
  ```ts
  @Loader(UsersById) users: LoaderOf<UsersById>
  ```
- The `@Loader()` decorator is durable against referencing a strategy that nodejs hasn't loaded yet.
  Helpful errors are thrown in this case and we provide an alternative syntax to defer the reference
  (just like `@nestjs/graphql`)
  ```ts
  @Loader(() => UsersById)
  ```

# Usage

Import the module in your app.
```ts
DataLoaderModule.register({
  // Any default options for all loaders
})
```

Create a strategy class that implements `DataLoaderStrategy<Item, Key>`
```ts
@Injectable({ scope: Scope.REQUEST })
class UsersById implements DataLoaderStrategy<User, string> {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async loadMany(ids: string[]) {
    return this.usersService.findByIds(ids);
  }
}
```
Be sure to register the strategy as a provider in your module.

Inject the loader in your resolver and use it.
```ts
class Resolver {
  @Query()
  user(
    @Args('id') id: string,
    @Loader(UsersById) users: LoaderOf<UsersById>,
  ) {
    return users.load(id);
  }
}
```

# Advanced Usage

It's possible to grab a loader instance outside a resolver, but an `ExecutionContext` is needed.

```ts
@Injectable()
class Thing {
  constructor(private dataLoaderContext: DataLoaderContext) {}

  something(context: ExecutionContext) {
    const users = this.dataLoaderContext.attachToExecutionContext(context).getLoader(UsersById);
    const user = users.load('id');
  }
}
```
