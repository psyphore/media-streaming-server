import { FileService } from './file';
import { MediaManager } from './media';
import { Settings } from '../config/settings';
import { PlaylistSchedule } from '../models/playlist-schedule.model';
import { Message } from '../models/simple-socket-message.model';
import { Logging } from './debug.logging';
import { CommandType } from '../enums/command-type.enum';
import { resolve } from 'url';

export class PlaylistQueueService {
  private _fileService: FileService;
  private _mediaMgr: MediaManager;
  private _socket: any;
  private _log: Logging;

  constructor() {
    this._fileService = new FileService();
    this._mediaMgr = new MediaManager();
    this._log = new Logging();
  }

  processPlaylist(content: string, path: string): void {
    // store playlist
    this._mediaMgr.saveSchedule(<PlaylistSchedule>JSON.parse(content))
      .subscribe(results => {
        this._fileService.processFile(path, Settings.dir.playlists);
        this._log.info('content saved');
      },
       err => this._log.error(err));
  }

  socketHandler(socket: any): void {
    this._socket = socket;
  }
}
