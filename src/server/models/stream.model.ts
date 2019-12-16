
import { ReadStream } from 'fs';

export class Stream {
  size: number;
  mime: string;
  stream: ReadStream;
}
