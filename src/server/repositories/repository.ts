const PouchDB = require('pouchdb');
const R = require('ramda');
import { Settings } from '../config/settings';
import { Observable } from 'rxjs/Rx';

import {
  IPouchDBPutResult,
  IPouchDBAllDocsResult,
  IPouchDBGetResult,
  IPouchDBRemoveResult,
  IPouchDBRow,
  IPouchDBInfo
} from '../models/pouch-document.model';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Logging } from '../services/debug.logging';
import { Timestamp } from 'rxjs/operators/timestamp';

// Using Ramda to create a Lens to access/manipulate the date
// property of an object
const dateLens = R.lensProp('date');

export class Repository {
  private _db: any;
  private _collectionName: string;
  private _dbpath: string;
  private _dboptions: any;
  private _log: Logging;

  constructor(name: string) {
    this._log = new Logging();
    this._collectionName = name;
    this._dbpath = join(Settings.db.path, this._collectionName);
    this.initDb();
  }

  initDb(): void {
    this.setDbOptions();
    this._db = new PouchDB(this._dbpath, this._dboptions);
    // this.dbReplication();
    // PouchDB.debug.enable('*');
  }

  get db(): any {
    return this._db;
  }

  setDbOptions(): void {
    this._dboptions = {
      adapter: 'leveldb',
      auto_compaction: true
    };
  }

  dbReplication(): void {
    if (!Settings.db.replication.enabled) return;
    if (!existsSync(Settings.db.replication.remoteDb)) {
      mkdirSync(Settings.db.replication.remoteDb);
    }
    let options = {
      live: Settings.db.replication.enabled,
      retry: Settings.db.replication.retry
    };
    let dbRep = this._db.sync(Settings.db.replication.remoteDb, options);
  }

  getCollection<T>(descending: boolean = false): Observable<IPouchDBAllDocsResult<T>> {
    let docOpts = {
      descending: descending,
      include_docs: true
    };
    return Observable.fromPromise<IPouchDBAllDocsResult<T>>(this.db.allDocs(docOpts));
  }

  addItem<T>(document: T): Observable<boolean> {
    let results = this._ProcessTx$([document])
                      .map((res: IPouchDBPutResult) => res.ok)
                      .filter((mr: boolean) => mr)
                      .first();
    return Observable.from(results);
  }

  // Create an RxJS timestamp, and uses lenses to update the
  // transaction object with the proper time the transaction
  // is processed
  // Function that writes a transaction to document store
  private _writeTx$<T>(tx: T, context: any = null): Observable<any> {
    return Observable.of(tx)
      .timestamp()
      .map((obj: any) => R.set(dateLens, obj.timestamp, obj.value))
      .do((tx: any) => context._log.info(`Processing transaction for: ${tx.date}`))
      .mergeMap((datedTx: any) => Observable.fromPromise(context._db.post(datedTx)));
  }

  private _ProcessTx$<T>(txs: Array<T>): Observable<any> {
    let context = this;
    // Run through all transactions in the array
    return Observable.from(txs)
      .concatMap((tx: any) => this._writeTx$(tx, context)); // Map the writeTx$ to each transaction object
  }
}
