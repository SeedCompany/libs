import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import type { LoadOnceStorage } from './load-once.js';

export interface FileHandleCodec<T> {
  serializer: (data: T) => string;
  deserializer: (data: string) => T;
}

export abstract class AbstractFileHandle<T> implements LoadOnceStorage<T> {
  protected constructor(
    readonly path: string,
    protected options: FileHandleCodec<T>,
  ) {}

  async read() {
    try {
      const raw = await fs.readFile(this.path, 'utf8');
      return this.options.deserializer(raw);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined;
      }
      throw e;
    }
  }

  async write(data: T) {
    const dir = dirname(this.path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.path, this.options.serializer(data));
  }

  async delete() {
    await fs.unlink(this.path);
  }

  async exists() {
    try {
      await fs.access(this.path);
      return true;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw e;
    }
  }

  async stats() {
    try {
      return await fs.stat(this.path);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined;
      }
      throw e;
    }
  }
}

export class JsonFileHandle<T> extends AbstractFileHandle<T> {
  constructor(path: string, options?: Partial<FileHandleCodec<T>>) {
    if (!path.endsWith('.json')) {
      path += '.json';
    }
    super(path, {
      serializer:
        options?.serializer ?? ((data) => JSON.stringify(data, null, 2)),
      deserializer: options?.deserializer ?? ((data) => JSON.parse(data)),
    });
  }

  /**
   * A helper to define a function that returns a JsonFileHandle at the specified path.
   * This allows the data type `T` to be inferred by the call site.
   */
  static at(path: string) {
    return <R>(options?: Partial<FileHandleCodec<R>>) =>
      new JsonFileHandle<R>(path, options);
  }
}

export class FileHandle extends AbstractFileHandle<string> {
  constructor(path: string) {
    super(path, {
      serializer: (data) => data,
      deserializer: (data) => data,
    });
  }

  static Json = JsonFileHandle;
}
