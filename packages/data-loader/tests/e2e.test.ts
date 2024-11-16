import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { ApolloDriver } from '@nestjs/apollo';
import { type INestApplication, Injectable, Scope } from '@nestjs/common';
import { Args, GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  DataLoaderModule,
  type DataLoaderStrategy,
  Loader,
  type LoaderOf,
} from '../src/index.js';

describe('data-loader', () => {
  let app: INestApplication;
  let execute: (op: { query: string; variables?: unknown }) => request.Test;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DataLoaderModule.register({}),
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [E2eTestLoader, E2eTestResolver],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    execute = (op) =>
      request(app.getHttpServer()).post('/graphql').send(op).expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should work', async () => {
    await execute({
      query: `query {
        str1: str(id: "1")
        str2: str(id: "2")
      }`,
    }).expect(({ body }) => {
      expect(body.data).toEqual({
        // All calls to loader were batched and then cached, so loadMany was only called once.
        str1: ['1', '1'],
        str2: ['1', '1'],
      });
    });
  });
});

@Injectable({ scope: Scope.REQUEST })
class E2eTestLoader
  implements DataLoaderStrategy<{ id: string; loadManyCalls: number }, string>
{
  private loadManyCalls = 0;
  async loadMany(keys: string[]) {
    this.loadManyCalls++;
    return keys.map((id) => ({ id, loadManyCalls: this.loadManyCalls }));
  }
}

@Resolver()
class E2eTestResolver {
  @Query(() => [String])
  async str(
    @Args('id') id: string,
    @Loader(E2eTestLoader) loader: LoaderOf<E2eTestLoader>,
  ) {
    const first = await loader.load(id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const second = await loader.load(id);
    return [first.loadManyCalls, second.loadManyCalls];
  }
}
