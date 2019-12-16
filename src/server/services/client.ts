import { join } from 'path';
import { Observable } from 'rxjs/Rx';
import { ClientMediaRepository } from '../repositories/client-media';
import { ClientState } from '../models/client-state.model';
import { PlaylistSchedule } from '../models/playlist-schedule.model';
import { Settings } from '../config/settings';
import { CommandType } from '../enums/command-type.enum';
import { FileService } from './file';
import { MediaManager } from './media';
import { Message } from '../models/simple-socket-message.model';
import { Logging } from './debug.logging';
import * as _ from 'lodash';

export class ClientManagement {
  private _clientMediaRepo: ClientMediaRepository;
  private _mm: MediaManager;
  private _fileService: FileService;
  private _socket: any;
  private _log: Logging;

  constructor() {
    this._clientMediaRepo = new ClientMediaRepository();
    this._mm = new MediaManager();
    this._fileService = new FileService();
    this._log = new Logging();
  }

  logCurrentMedia(body: ClientState): Observable<any> {
    return new Observable(observer => {
      this._clientMediaRepo.addItem(body)
        .subscribe(results => {
          let path = join(Settings.dir.root, Settings.dir.logs.path);
          let name = `${Settings.out.clientState}${Settings.out.ext}`;
          // save file to dropbox
          let entityMdl = (results || body);
          let entityStr = JSON.stringify(entityMdl);
          this._fileService.saveToFile(entityStr, path, name)
            .subscribe(result => this._log.info(`${result}`), err => this._log.error(err));

          // check for new playlist upload
          let clientAction = { action: CommandType.ReloadPlaylists, name: '' };
          this._mm.getLast()
            .subscribe(schedule => {
              if (this.isValidUpdatedSchedule(schedule, body)) {
                clientAction.name = `${schedule.name}-${schedule.version}`;
                observer.next(clientAction);
                return;
              }
              clientAction.action = CommandType.NotSet;
              observer.next(clientAction);
            }, err => observer.error(err));
        }, (err: any) => observer.error(err)
      , () => observer.complete());
    });
  }

  isValidUpdatedSchedule(schedule: PlaylistSchedule, body: ClientState): boolean {
    return (schedule
      && (schedule.name !== body.currentPlaylistScheduleName
      || schedule.version !== body.currentPlaylistScheduleVersion)
    );
  }

  getCurrentMediaLog(): Observable<ClientState> {
    return new Observable(observer => {
      this._clientMediaRepo.getRecentPlayedMedia(1, true)
        .subscribe(results => observer.next(results[0]), err => observer.error(err));
    });
  }

  getMediaLogs(size: number): Observable<Array<ClientState>> {
    return new Observable(observer => {
      this._clientMediaRepo.getRecentPlayedMedia(size, true)
        .subscribe(results => observer.next(results), err => observer.error(err));
    });
  }

  getMediaLogsByDateTimeRange(from: string, to: string): Observable<Array<ClientState>> {
    return new Observable(observer => {
      this._clientMediaRepo.getMediaLogsByDateRange(from, to)
        .subscribe(results => observer.next(results), err => observer.error(err));
    });
  }

  getCurrentMediaItems(extensions?: Array<string>): Observable<Array<string>> {
    return new Observable(observer => {
      this._mm.listMediaFiles()
        .subscribe(files => {
          if (extensions && extensions.length !== 0) {
            var filteredFiles = _.filter(files, (f:string) => {
              return _.some(extensions, (e:string) => {
                return f.includes(e);
              });
            });
            observer.next(filteredFiles);
            return;
          }
          observer.next(files);
        }, err => observer.error(err));
    });
  }

  socketHandler(socket: any): void {
    socket.on('current play', (m: any) => {
      this.logCurrentMedia(m.body)
        .subscribe(res => {
          this.broadcast({ subject: 'playlist', body: res });
        });
    });
    this._socket = socket;
  }

  broadcast(message: Message): void {
    if (this._socket) {
      this._socket.emit(message.subject, message);
    }
  }
}
