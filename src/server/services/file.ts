import { join } from 'path';
import { Settings } from '../config/settings';
import {
  existsSync,
  mkdirSync,
  rename,
  unlink,
  createReadStream,
  createWriteStream,
  writeFile,
  writeFileSync,
  ReadStream,
  statSync,
  readdir,
  Stats
 } from 'fs';
import { Observable } from 'rxjs/Rx';
import { CryptographyService } from './cryptography';
import { Logging } from './debug.logging';
import { Utils } from '../util';
import { Readable } from 'stream';

export class FileService {
  private _log: Logging;
  private _timer: NodeJS.Timer;
  private _cryptography: CryptographyService;

  constructor() {
    this._log = new Logging();
    this._cryptography = new CryptographyService();
  }

  processFile(path: string, dirType: string, enc: boolean = false): void {
    let source: string = join(Settings.dir.root, dirType);
    let destination: string = join(Settings.dir.local, dirType);

    if (!existsSync(destination)) {
      mkdirSync(destination);
    }

    let src = path;
    let dest = path.replace(source, destination);
    this.moveFile(src, dest, (err: any) => {
      if (err && err !== 'success') {
        this._log.error(`an error occured while processing file ${JSON.stringify(err)}`);
        return;
      }
      if (Settings.enc.enabled) {
        this._cryptography.Encrypt(dest)
        .subscribe(r => {
          this.cleanup(dirType, dest, true);
        });
      }
    });
  }

  cleanup(dirType: string, dest: string, deleteMedia: boolean = true): void {
    if (dirType === Settings.dir.commands && !Settings.saveMeta.commands) {
      this._timer = setTimeout(() => {
        this.resetTimer();
        if (existsSync(dest)) {
          this.deleteFile(dest);
        }
      }, Settings.dir.processTimeout);
      return;
    }

    if (dirType === Settings.dir.playlists && !Settings.saveMeta.playlists) {
      this._timer = setTimeout(() => {
        this.resetTimer();
        if (existsSync(dest)) {
          this.deleteFile(dest);
        }
      }, Settings.dir.processTimeout);
      return;
    }

    if (deleteMedia) {
      this._timer = setTimeout(() => {
        this.resetTimer();
        if (existsSync(dest)) {
          this.deleteFile(dest);
        }
      }, Settings.dir.processTimeout);
      return;
    }
  }

  copyFile(source: string, target: string, cb?: (err?: any) => void): void {
    let rd = createReadStream(source);
    rd.on('error', (err: any) => this.processCompleteCallback(err, cb));
    rd.on('close', (ex: any) => {
      this.processCompleteCallback(ex, cb);
      this.deleteFile(source);
    });

    let wr = createWriteStream(target);
    wr.on('error', (err: any) => this.processCompleteCallback(err, cb));
    wr.on('close', (ex: any) => {
      this.processCompleteCallback(ex, cb);
    });

    rd.pipe(wr);
  }

  moveFile(source: string, target: string, cb?: (msg: any) => void): void {
    this._timer = setTimeout(() => {
      this.resetTimer();
      rename(source, target, (err: any) => {
        if (err && err.code === 'EXDEV') {
          this.copyFile(source, target, cb);
          return;
        }
        this.processCompleteCallback('success', cb);
      });
    }, Settings.dir.processTimeout);
  }

  deleteFile(target: string, cb?: (msg: any) => void): void {
    this._timer = setTimeout(() => {
      this.resetTimer();
      if (!existsSync(target)) {
        return;
      }

      unlink(target, (err: any) => {
        if (err) {
          this._log.error(err);
          this.processCompleteCallback(err, cb);
          return;
        }
        this.processCompleteCallback('success', cb);
      });
    }, Settings.dir.processTimeout);
  }

  processCompleteCallback(msg: any, cb?: (msg: string) => void): void {
    if (cb) {
      cb(msg);
    }
  }

  saveToFile(value: any, path: string, name: string): Observable<any> {
    return new Observable(observer => {
      if (!Settings.dir.logs.enabled) {
        console.log('log reporting is disabled');
        observer.complete();
        return;
      }
      if (!value) {
        observer.error('no value to save.');
        observer.complete();
        return;
      }

      if (!path) {
        observer.error('no path provided.');
        observer.complete();
        return;
      }

      if (!name) {
        observer.error('no file name provided.');
        observer.complete();
        return;
      }

      path = path.toLocaleLowerCase();

      if (!existsSync(path)) {
        this._log.info(`creating path: ${path}`);
        mkdirSync(path);
      }

      let finalDestination = join(path, name);

      writeFile(finalDestination, value, { encoding: 'utf-8' }, (err: NodeJS.ErrnoException) => {
        if (err) {
          observer.error(err);
          observer.complete();
          return;
        }
        observer.next(`${name} saved successfully.`);
        observer.complete();
      });
    });
  }

  getDirectoryContent(path: string): Observable<Array<string>> {
    return new Observable(o => {
      readdir(path, (err, items) => {
        if(err) {
          o.error(err);
        }
        o.next(items.map((i) => {
          let lpos = i.lastIndexOf(Settings.dir.nav);
          return i.substring(lpos, i.length - lpos);
        }));
      });
    });
  }

  directoryExists(path: string): boolean {
    return existsSync(path);
  }

  getFileStatistics(file: string): Stats {
    return statSync(file);
  }

  getFileStream(file: string, data: ReadStream, decrypt: boolean = true): ReadStream {
    if (decrypt) {
      this._cryptography.DecryptToStreamSync(file, data);
      return data;
    }

    return createReadStream(file);
  }

  getReadStream(): ReadStream {
    return createReadStream('output');
  }

  getKnownSubDirectories(): string[] {
    return [
      join(Settings.dir.local, Settings.dir.media.root, Settings.dir.media.music),
      join(Settings.dir.local, Settings.dir.media.root, Settings.dir.media.radioAdvert),
      join(Settings.dir.local, Settings.dir.media.root, Settings.dir.media.radioDj),
      join(Settings.dir.local, Settings.dir.media.root, Settings.dir.media.stationImaging),
      join(Settings.dir.local, Settings.dir.media.root, Settings.dir.media.stillAdvert),
      join(Settings.dir.local, Settings.dir.media.root, Settings.dir.media.tvAdvert)
    ];
  }

  getFilePath(name: string): string {
    // find get collection with file name
    // loop through the known directories
    // return when a match is made
    let knownSubDirs: string[] = this.getKnownSubDirectories();
    let path: string = join(Settings.dir.local);
    for(let i = 0; i < knownSubDirs.length; i += 1) {
      path = knownSubDirs[i] + Settings.dir.nav + name;
      if(existsSync(path)) {
        break;
      }
    }
    return path;
  }

  getFullRelativeFilePath(relativePath: string): string {
    // find get collection with file name
    // loop through the known directories
    // return when a match is made
    let knownSubDirs: string[] = this.getKnownSubDirectories();
    let path: string = '';
    let arrRelPath: string[] = relativePath.split(Settings.dir.nav);
    for(let i = 0; i < knownSubDirs.length; i += 1) {
      if (knownSubDirs[i].toUpperCase().indexOf(arrRelPath[0].toUpperCase()) !== -1) {
        path = knownSubDirs[i] + Settings.dir.nav + arrRelPath[arrRelPath.length - 1];
        if(existsSync(path)) {
          break;
        }
        path = '';
      }
    }
    return path;
  }

  getFullRelativeEncryptedFilePath(relativePath: string): string {
    // find get collection with file name
    // loop through the known directories
    // return when a match is made
    // exclude encryption file extension
    let knownSubDirs: string[] = this.getKnownSubDirectories();
    let path: string = '';
    let arrRelPath: string[] = relativePath.split(Settings.dir.nav);
    for(let i = 0; i < knownSubDirs.length; i += 1) {
      if (knownSubDirs[i].toUpperCase().indexOf(arrRelPath[0].toUpperCase()) !== -1) {
        let filenamewithext =  arrRelPath[arrRelPath.length - 1];
        let filename = filenamewithext.split('.')[0];
        let ext = Utils.simpleFileExtensions(filenamewithext.split('.')[1]);
        path = `${knownSubDirs[i]}${Settings.dir.nav}${filename}.${ext}`;
        if (existsSync(path)) {
          break;
        }
        path = '';
      }
    }
    return path;
  }

  getDecryptedFileStream(file: string): Observable<Readable> {
    return this._cryptography.DecryptToStreamAsync(file);
  }

  getKnownExtensions(): string[] {
    return [
      ...Settings.media.mediaType_audio,
      ...Settings.media.mediaType_video,
      ...Settings.media.mediaType_image
    ];
  }

  getDestSubDir(path: string): string {
    let subDir = Settings.dir.media.root;
    if (Utils.pathExists(path, Settings.dir.media.music)) {
      subDir = join(subDir, Settings.dir.media.music);
      return subDir;
    }

    if (Utils.pathExists(path, Settings.dir.media.radioAdvert)) {
      subDir = join(subDir, Settings.dir.media.radioAdvert);
      return subDir;
    }

    if (Utils.pathExists(path, Settings.dir.media.radioDj)) {
      subDir = join(subDir, Settings.dir.media.radioDj);
      return subDir;
    }

    if (Utils.pathExists(path, Settings.dir.media.stationImaging)) {
      subDir = join(subDir, Settings.dir.media.stationImaging);
      return subDir;
    }

    if (Utils.pathExists(path, Settings.dir.media.stillAdvert)) {
      subDir = join(subDir, Settings.dir.media.stillAdvert);
      return subDir;
    }

    if (Utils.pathExists(path, Settings.dir.media.tvAdvert)) {
      subDir = join(subDir, Settings.dir.media.tvAdvert);
      return subDir;
    }

    return subDir;
  }

  private resetTimer() {
    clearTimeout(this._timer);
  }
}
