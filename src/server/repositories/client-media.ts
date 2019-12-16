import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';
import { Repository } from './repository';

import { ClientState } from '../models/client-state.model';
import { Logging } from '../services/debug.logging';
import { IPouchDBAllDocsResult, IPouchDBRow } from '../models/pouch-document.model';
import { Utils } from '../util';

export class ClientMediaRepository {
  private repo: Repository;
  private _log: Logging;
  private collectionName: string;

  constructor() {
    this.collectionName = 'client-media';
    this._log = new Logging();
    this.repo = new Repository(this.collectionName);
    // this.initializeCollection();
  }

  initializeCollection(): void {
    this.repo.getCollection<ClientState>()
    .subscribe((doc: IPouchDBAllDocsResult<ClientState>) => this._log.info(`${this.collectionName} collection exists.`),
    err => this._log.error([`${this.collectionName} collection is missing`, err]));
  }

  addItem(document: ClientState): Observable<ClientState> {
    return new Observable(observer => {
      this.repo.addItem<ClientState>(document)
        .subscribe(res => observer.next(document), err => observer.error(err));
    });
  }

  getRecentPlayedMedia(size: number = 10, desc: boolean = false): Observable<Array<ClientState>> {
    return new Observable(observer => {
      this.repo.getCollection<ClientState>(true)
        .subscribe((doc: IPouchDBAllDocsResult<ClientState>) => {
          let mapped = doc.rows
                          .map((c: IPouchDBRow<ClientState>) => c.doc)
                          .map((m: ClientState) => <ClientState>Utils.stripPouchDbFields(m));
          let final = this.getValidCollection(mapped, size, desc);
          observer.next(final);
        }, (err: any) => observer.error(err));
    });
  }

  getMediaLogsByDateRange(from: string, to: string): Observable<Array<ClientState>> {
    return new Observable(observer => {
      this.repo.getCollection<ClientState>()
      .subscribe((doc: IPouchDBAllDocsResult<ClientState>) => {
        let dv = doc.rows
                    .map((c: IPouchDBRow<ClientState>) => c.doc)
                    .map((m: ClientState) => <ClientState>Utils.stripPouchDbFields(m))
                    .filter((r: ClientState) => moment(r.pointInTime).isBetween(moment(from), moment(to)));
        observer.next(dv);
      }, (err: any) => observer.error(err));
    });
  }

  private getValidCollection(mapped:ClientState[], size: number, desc: boolean) : ClientState[] {
    let col: ClientState[] = [];
    let final: ClientState[];
    if (mapped && mapped.length !== 0) {
      col = mapped.sort((prev, nxt): number => {
        if (!prev || !nxt) return 0;

        let p = moment(prev.pointInTime);
        let n = moment(nxt.pointInTime);
        if (desc) {
          if (p.isBefore(n)) return 1;
          if (p.isAfter(n)) return -1;
        } else {
          if (p.isBefore(n)) return -1;
          if (p.isAfter(n)) return 1;
        }
        return 0;
      });
    }

    if (col.length !== 0 && col.length >= size) {
      final = col.slice(0, size);
    } else {
      final = col;
    }

    return final;
  }
}
