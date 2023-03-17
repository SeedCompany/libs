import type { Readable } from 'stream';
import { asyncIteratorToArray } from './iterator';

export const bufferFromStream = async (stream: Readable): Promise<Buffer> =>
  Buffer.concat(await asyncIteratorToArray(stream));
