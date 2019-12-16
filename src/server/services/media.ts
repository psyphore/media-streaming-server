const mime = require('mime-types');
import {
  createReadStream,
  ReadStream,
  statSync,
  existsSync,
  readdir
} from 'fs';
import { join, extname } from 'path';
import { MediaRepository } from '../repositories/media';
import { Settings } from '../config/settings';
import { Stream } from '../models/stream.model';
import { PlaylistSchedule } from '../models/playlist-schedule.model';
import { MediaContentType } from '../enums/media-content-type.enum';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import { FileService } from './file';


export class MediaManager {
  private _fileService: FileService;
  private _mediaRepo: MediaRepository;
  constructor() {
    this._mediaRepo = new MediaRepository();
    this._fileService = new FileService();
  }

  getLast(): Observable<PlaylistSchedule> {
    return new Observable(observer => {
      this._mediaRepo.getRecentImportedMedia()
        .subscribe(data => {
          observer.next(data);
        }, err => {
          observer.error(err);
        });
    });
  }

  saveSchedule(content: PlaylistSchedule, save: boolean = true): Observable<PlaylistSchedule> {
    return new Observable(observer => {
      if (save) {
        this._mediaRepo.addItem(content)
            .subscribe(
              data => observer.next(data),
              err => observer.error(err)
            );
      } else {
        observer.next(content);
      }
    });
  }

  getFilePath(name: string): string {
    // find get collection with file name
    // loop through the known directories
    // return when a match is made
    let knownSubDirs: string[] = this._fileService.getKnownSubDirectories();
    let path: string = join(Settings.dir.local);
    for(let i = 0; i < knownSubDirs.length; i += 1) {
      path = knownSubDirs[i] + Settings.dir.nav + name;
      if(this._fileService.directoryExists(path)) {
        break;
      }
    }
    return path;
  }

  streamAudioMedia(name: string): Stream {
    let data = this.calculateFileForStreaming(name);
    if (!data) {
      return null;
    }

    // create stream
    let rs = this._fileService.getReadStream();
    this._fileService.getFileStream(data.file, rs);
    rs.on('data', (chunk) => {
      return <Stream>{
        size: data.size,
        mime: data.mime,
        stream: rs
      };
    });
  }

  streamVideoMedia(name: string): Stream {
    let data = this.calculateFileForStreaming(name);
    if (!data) {
      return null;
    }

    // create stream
    let rs = this._fileService.getReadStream();
    this._fileService.getFileStream(data.file, rs);
    rs.on('data', (chunk) => {
      return <Stream>{
        size: data.size,
        mime: data.mime,
        stream: rs
      };
    });
  }

  streamMedia(relativePath: string): Stream {
    // find file
    let file = this._fileService.getFullRelativeFilePath(relativePath);
    if (file === '') {
      return null;
    }
    // calculate file stat
    let stt = statSync(file);

    // create stream
    let rs = createReadStream(file);
    return <Stream>{
      size: stt.size,
      mime: mime.lookup(file),
      stream: rs
    };
  }

  streamEncryptedMedia(relativePath: string):Observable<Stream> {
    return this.calculateEncryptedFileForStreaming(relativePath);
  }

  streamArtwork(name: string): Stream {
    let data = this.calculateFileForStreaming(name);
    if (!data) {
      return null;
    }
    // create stream
    let rs = this._fileService.getReadStream();
    this._fileService.getFileStream(data.file, rs);
    rs.on('data', (chunk) => {
      return <Stream>{
        size: data.size,
        mime: data.mime,
        stream: rs
      };
    });
  }

  listMediaFiles(): Observable<Array<string>> {
    return new Observable(observer => {
      let knownSubDirs: string[] = this._fileService.getKnownSubDirectories();
      let path: string = join(Settings.dir.local);
      for(let i = 0; i < knownSubDirs.length; i += 1) {
        path = join(path, Settings.dir.media.root, knownSubDirs[i]);
        this._fileService.getDirectoryContent(path).subscribe(arr => observer.next(arr), err=> observer.error(err));
      }
    });
  }

  getAllStillAdverts(): Observable<Array<string>> {
    return new Observable(o => {
      let sa: string[] = [];
      let path: string = join(Settings.dir.local);
      path = join(path, Settings.dir.media.root, Settings.dir.media.stillAdvert);
      this._fileService.getDirectoryContent(path).subscribe(arr => o.next(arr), err => o.error(err));
    });
  }

  private calculateFileForStreaming(name: string): any {
    // append with encryption extention for locating the file
    let tmpfile = `${name}${Settings.enc.ext}`;

     // find file
    let file = this.getFilePath(tmpfile);
    if (!this._fileService.directoryExists(file)) {
      return null;
    }

    // calculate file stat
    let stt = this._fileService.getFileStatistics(file);
    return {
      file: file,
      mime: mime.lookup(name),
      size: stt.size
    };
  }

  private calculateEncryptedFileForStreaming(relativePath: string): Observable<Stream> {
    return new Observable(observer => {
      let file = this._fileService.getFullRelativeEncryptedFilePath(relativePath);
      this._fileService.getDecryptedFileStream(file)
      .subscribe((rs) => {
        let stt = this._fileService.getFileStatistics(file);
        let resp = <Stream>{
          size: stt.size,
          mime: mime.lookup(file),
          stream: rs
        };
        observer.next(resp);
      }, (err) => {
        observer.error(err);
      });
    });
  }
}
