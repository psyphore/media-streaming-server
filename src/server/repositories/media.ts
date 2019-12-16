import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import { Repository } from './repository';

import { PlaylistSchedule } from '../models/playlist-schedule.model';
import { Logging } from '../services/debug.logging';
import { IPouchDBAllDocsResult, IPouchDBRow } from '../models/pouch-document.model';
import { Playlist } from '../models/playlist.model';
import { Utils } from '../util';

export class MediaRepository {
  private repo: Repository;
  private _log: Logging;
  private collectionName: string;

  constructor() {
    this.collectionName = 'media';
    this._log = new Logging();
    this.repo = new Repository(this.collectionName);
    // this.initializeCollection();
  }

  initializeCollection(): void {
    this.repo.getCollection<PlaylistSchedule>()
      .subscribe(
        (doc: IPouchDBAllDocsResult<PlaylistSchedule>) => this._log.info(`${this.collectionName} collection exists.`),
        (err: any) => this._log.error([`${this.collectionName} collection is missing`, err])
      );
  }

  addItem(document: PlaylistSchedule): Observable<PlaylistSchedule> {
    return new Observable(observer => {
      this.repo.addItem<PlaylistSchedule>(document)
        .subscribe(res => {
          if(res) {
            observer.next(document);
          } else {
            observer.error(res);
          }
        }, err => observer.error(err));
    });
  }

  getRecentImportedMedia(): Observable<PlaylistSchedule> {
    return new Observable(observer => {
      this.repo.getCollection<PlaylistSchedule>(true)
        .subscribe((res: IPouchDBAllDocsResult<PlaylistSchedule>) => {
          let final: PlaylistSchedule[];
          if (res && res.total_rows === 0) {
            final = new Array<PlaylistSchedule>();
            observer.next(final[0]);
          }
          let rowItems = res.rows;
          let valid = _.filter(rowItems, (c: IPouchDBRow<PlaylistSchedule>) =>
                      (c.doc && (<PlaylistSchedule>c.doc).version !== undefined))
                      .map((f: IPouchDBRow<PlaylistSchedule>) => f.doc)
                      .map((m: PlaylistSchedule) => <PlaylistSchedule>Utils.stripPouchDbFields(m));

          if (valid.length !== 0) {
            final = _.take(valid, 1);
          } else {
            final = valid;
          }
          observer.next(final[0]);
        }, err => {
          observer.error(err);
        });
    });
  }
}
