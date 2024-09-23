import { Injectable } from '@nestjs/common';
import type { DurationIn } from '@seedcompany/common/temporal/luxon';
import { Duration } from 'luxon';
import { Promisable } from 'type-fest';
import { CacheAdapters } from './adapters/adapters.facade';
import { resolveOptions } from './resolve-options';
import { NamespaceStore } from './stores/namespace';
import {
  CacheStore,
  CacheStoreItemOptions as StoreItemOptions,
} from './stores/store.interface';
import '@seedcompany/common/temporal/luxon';

@Injectable()
export class CacheService {
  constructor(
    private readonly store: CacheStore,
    private readonly defaultOptions?: StoreItemOptions,
  ) {}

  get adaptTo() {
    return new CacheAdapters(this);
  }

  withDefaultOptions(options: ItemOptions) {
    return new CacheService(this.store, resolveOptions(options));
  }

  namespace(subSpace: string, defaultOptions?: ItemOptions) {
    if (!subSpace) {
      return this;
    }
    return new CacheService(
      new NamespaceStore(this.store, subSpace),
      defaultOptions ? resolveOptions(defaultOptions) : undefined,
    );
  }

  item<T>(key: string, options?: ItemOptions): CacheItem<T> {
    return new CacheItem<T>(key, this, options ? resolveOptions(options) : {});
  }

  async get<T>(key: string, options: ItemOptions = {}): Promise<T | undefined> {
    return await this.store.get<T>(key, this.resolveOptions(options));
  }

  async set(key: string, value: unknown, options: ItemOptions = {}) {
    await this.store.set(key, value, this.resolveOptions(options));
  }

  private resolveOptions(options: ItemOptions) {
    const opts = resolveOptions(options);
    return this.defaultOptions ? { ...this.defaultOptions, ...opts } : opts;
  }

  async delete(key: string) {
    await this.store.delete(key);
  }

  async remainingTtl(key: string) {
    const milliseconds = await this.store.remainingTtl(key);
    return Duration.from(milliseconds);
  }

  async getOrCalculate<T>(options: CacheableCalculationOptions<T>): Promise<T> {
    const { key, calculate, ...cacheOptions } = options;
    const prev = await this.get<T>(key);
    if (prev) {
      return prev;
    }
    const now = await calculate();
    await this.set(key, now, cacheOptions);
    return now;
  }
}

export interface ItemOptions extends Pick<StoreItemOptions, 'refreshTtlOnGet'> {
  /**
   * Time to live - duration that an item is cached before it is deleted.
   */
  ttl?: DurationIn;
}

export interface CacheableCalculationOptions<T> extends ItemOptions {
  key: string;

  calculate: () => Promisable<T>;
}

export class CacheItem<T> {
  /**
   * @internal
   */
  constructor(
    readonly key: string,
    private readonly service: CacheService,
    private readonly options: ItemOptions = {},
  ) {}

  async get(optionsOverride?: Partial<ItemOptions>): Promise<T | undefined> {
    return await this.service.get<T>(this.key, {
      ...this.options,
      ...optionsOverride,
    });
  }

  async set(value: T, optionsOverride?: Partial<ItemOptions>) {
    await this.service.set(this.key, value, {
      ...this.options,
      ...optionsOverride,
    });
  }

  async delete() {
    await this.service.delete(this.key);
  }

  async getOrCalculate(
    options:
      | Omit<CacheableCalculationOptions<T>, 'key'>
      | (() => Promisable<T>),
  ): Promise<T> {
    return await this.service.getOrCalculate({
      ...this.options,
      ...(typeof options === 'function' ? { calculate: options } : options),
      key: this.key,
    });
  }
}
