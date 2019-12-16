import * as d from 'domain';
import { Server } from './server/index';

d.create().once('error', (err: any) => {
  console.log(err);
}).run(() => {
  Server.bootstrap();
});

d.Domain.defaultMaxListeners = 0;

process.once('uncaughtException', (err: any) => {
  console.log(err);
});
