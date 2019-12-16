import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';
import { Repository } from './repository';

import { Command } from '../models/command.model';
import { Logging } from '../services/debug.logging';
import { IPouchDBAllDocsResult } from '../models/pouch-document.model';

export class CommandRepository {
  private repo: Repository;
  private _log: Logging;
  private collectionName: string;

  constructor() {
    this.collectionName = 'command';
    this._log = new Logging();
    this.repo = new Repository(this.collectionName);
    // this.initializeCollection();
  }

  initializeCollection(): void {
    this.repo.getCollection<Command>()
    .subscribe(
      (doc: IPouchDBAllDocsResult<Command>) => this._log.info(`${this.collectionName} collection exists.`),
      (err: any) => this._log.error([`${this.collectionName} collection is missing`, err])
    );
  }

  addItem(document: Command): Observable<Command> {
    return new Observable(observer => {
      this.repo.addItem<Command>(document)
        .subscribe(col => observer.next(document), err => observer.error(err));
    });
  }
}
