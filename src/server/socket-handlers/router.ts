import * as sio from 'socket.io';
import { Message } from '../models/simple-socket-message.model';
import { PlaylistQueueService } from '../services/playlist.queue';
import { CommandQueueService } from '../services/command.queue';
import { ClientManagement } from '../services/client';
import { Logging } from '../services/debug.logging';

export class SocketRouter {
  private _socket: any;
  private _playlistQueueingService: PlaylistQueueService;
  private _commandQueueingService: CommandQueueService;
  private _clientManager: ClientManagement;
  private _log: Logging;

  constructor(socket: any) {
    this._log = new Logging();
    this._socket = socket;
    this._commandQueueingService = new CommandQueueService();
    this._playlistQueueingService = new PlaylistQueueService();
    this._clientManager = new ClientManagement();
    this.handle(this._socket);
  }

  handle(socket: any): void {
    this._playlistQueueingService.socketHandler(socket);
    // this._commandQueueingService.socketHandler(socket);
    this._clientManager.socketHandler(socket);

    socket.on('message', (m: Message) => this.messageHandler(m));
    socket.on('disconnect', () => this.disconnect());

    this._socket = socket;
  }

  private messageHandler(m: Message): void {
    this._log.message(['[server](message):', JSON.stringify(m)]);
    this._socket.emit(m.subject, m.body);
  }

  private disconnect(): void {
    this._log.info(`${this._socket.conn.id} has left`);
  }
}
