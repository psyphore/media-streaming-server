import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';
import * as cors from 'cors';
import * as bp from 'body-parser';
import { join } from 'path';
var cache = require('cache-control');

import { Route } from './http-handlers/routes';
import { Settings } from './config/settings';
import { Commands } from './services/command';
import { SocketRouter } from './socket-handlers/router';
import { Logging } from './services/debug.logging';

export class Server {
  public app: any;
  private server: http.Server;
  private io: any;
  private port: number;
  private _cmds: Commands;
  private _socketHandler: SocketRouter;
  private _log: Logging;

  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    this._log = new Logging();
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.startWatch();
    this.listen();
  }

  private createApp(): void {
    this.app = express();
    this.app.use(bp.urlencoded({ extended: true }));
    this.app.use(bp.json());
    let corsOptions = <cors.CorsOptions>{
      origin: (origin: any, callback: (p: any, b: boolean) => any) => {
        let isWhitelisted = Settings.allowedOrigins.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
      },
      methods: Settings.allowedMethods,
      optionsSuccessStatus: 200,
      credentials: true
    };
    this.app.use(cors(corsOptions));
    let cacheAge: number = (1000 * 60 * 60);
    this.app.use(cache({
      '/*.jpg': cacheAge,
      '/*.jpeg': cacheAge,
      '/*.png': cacheAge
    }));
    this.app.use('/api', new Route(express.Router())._route);
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private config(): void {
    this.port = +process.env.PORT || Settings.port;
  }

  private sockets(): void {
    this.io = socketIo(this.server);
  }

  private startWatch(): void {
    let _watchDirs: string[] = [
      join(Settings.dir.root, Settings.dir.media.root),
      join(Settings.dir.root, Settings.dir.commands),
      join(Settings.dir.root, Settings.dir.playlists)
    ];

    this._cmds = new Commands();
    this._cmds.socketPrep(this.io);
    this._cmds.init(_watchDirs);
  }

  private listen(): void {
    this.io.on('connection', (socket: any) => {
      this._log.info(`${socket.conn.id} has connected.`);
      this._socketHandler = new SocketRouter(socket);
    });

    this.server.listen(this.port, () => {
      console.info(`> listening on 'http://localhost:${this.port}/'`);
    });
  }

}
