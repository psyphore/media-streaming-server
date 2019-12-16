import { join } from 'path';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import { ClientManagement } from '../services/client';
import { ClientStateLog, ClientStateLogs } from '../models/client-state-log.model';
import { Command } from '../models/command.model';
import { ClientState } from '../models/client-state.model';
import { Settings } from '../config/settings';
import { FileService } from './file';
import { Logging } from './debug.logging';

export class ReportService {
  private _cm: ClientManagement;
  private _fileService: FileService;
  private _log: Logging;

  constructor() {
    this._cm = new ClientManagement();
    this._fileService = new FileService();
    this._log = new Logging();
  }

  getClientStateLogs(from: string, to: string, exclude: string = 'none', unique: boolean = true): Observable<any> {
    return new Observable(observer => {
      this._cm.getMediaLogsByDateTimeRange(from, to)
        .subscribe(data => {
          this._log.message(`results.report.getClientStateLogs: ${from} - ${to} = ${data.length}`);
          if (!data || data.length === 0) {
            // bail out, nothing to process here
            observer.next(data);
            return;
          }

          let _logItems: Array<ClientStateLog> = data.map((item: ClientState, indx: number) => {
            let logItem = new ClientStateLog(indx + 1,
              moment(item.pointInTime).format(Settings.formats.date),
              moment(item.pointInTime).format(Settings.formats.time),
              item.currentPlaylistItem);
            return logItem;
          });

          _logItems = _.filter(_logItems, (i) => i.filename.toLowerCase() !== exclude.toLowerCase());

          if (unique)
            _logItems = _.uniqBy(_logItems, (i) => i.filename);

          let path = join(Settings.dir.root, Settings.dir.logs.path);
          let name = this.getName();
          let clientLogs: ClientStateLogs = new ClientStateLogs(_logItems);
          this._fileService.saveToFile(JSON.stringify(clientLogs), path, name)
            .subscribe(result => observer.next(result), err => observer.error(err));
        }, err => observer.error(err));
    });
  }

  getName(filename: string = null, append: boolean = false): string {
    if (filename && append) {
      return `${Settings.out.clientStateLog}${(append && filename) ? '-' + filename : ''}${Settings.out.ext}`;
    }

    if (filename && !append) {
      return `${filename}${Settings.out.ext}`;
    }

    return `${Settings.out.clientStateLog}${Settings.out.ext}`;
  }

  getServerMediaList(extensions?: Array<string>): Observable<any> {
    return new Observable(observer => {
      this._cm.getCurrentMediaItems(extensions)
        .subscribe(list => {
          let path = join(Settings.dir.root, Settings.dir.logs.path);
          let name = `${Settings.out.mediaList}${Settings.out.ext}`;
          this._fileService.saveToFile(JSON.stringify(list), path, name)
            .subscribe(result => observer.next(result), err => observer.error(err));
        }, err => observer.error(err));
    });
  }
}
