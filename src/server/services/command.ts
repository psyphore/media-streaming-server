import { join, extname } from 'path';
import { readFile } from 'fs';
import * as chokidar from 'chokidar';

import { Settings } from '../config/settings';

import { CommandQueueService } from './command.queue';
import { PlaylistQueueService } from './playlist.queue';
import { FileService } from './file';
import { Logging } from './debug.logging';
import { Utils } from '../util';

export class Commands {
  private _log: Logging;
  private _commandQueueService: CommandQueueService;
  private _playlistQueueService: PlaylistQueueService;
  private _fileService: FileService;
  private _io: any;

  constructor() {
    this._commandQueueService = new CommandQueueService();
    this._playlistQueueService = new PlaylistQueueService();
    this._fileService = new FileService();
    this._log = new Logging();
  }

  socketPrep(io: any): void {
    this._io = io;
  }

  init(dir: string | string[]): void {
    if (!dir) {
      throw new Error('Please provide folder to watch for');
    }

    if (this._io) {
      this._io.on('connection', (socket: any) =>
        this._commandQueueService.socketHandler(socket)
      );
    }

    this.watchDirectory(dir);
  }

  watchDirectory(dir: string | string[]): void {
    let watcher = chokidar.watch(dir, {
      ignored: Settings.dir.watchIgnoreRegex,
      persistent: true,
      usePolling: true
    });

    watcher
      .on('add', (path: string) => this.handleFileAdd(path))
      .on('unlink', (path: string) => this.handleFileRemove(path))
      .on('error', (error: any) => this.handleFileWatchError(error))
      .on('ready', () => this.handleFileWatcherReady(watcher));
  }

  handleFileAdd(path: string): void {
    this._log.message(['File ', path, ' has been added']);

    // only process for specified watched files
    if (
      Settings.dir.watchedFiles.some((f: string) => {
        return extname(path) === f;
      })
    ) {
      this.handleWatchedCommands(path);
      this.handleWatchedMedia(path);
    } else {
      this._log.message(
        'File not processed. It does not match allowed extensions.'
      );
      this._fileService.deleteFile(path);
    }
  }

  handleWatchedCommands(path: string): void {
    if (
      Settings.command.ext.some((f: string) => {
        return extname(path) === f;
      })
    ) {
      // commands - .json
      setTimeout(() => {
        this.readCommands(path);
      }, Settings.dir.processTimeout);
    }
  }

  handleWatchedMedia(path: string): void {

    if (
      this._fileService.getKnownExtensions().some((f: string) => {
        return extname(path) === f;
      })
    ) {
      // media - .mp3, .mp4, .png, .jpg
      setTimeout(() => {
        // check for each directory
        let subDir = this._fileService.getDestSubDir(path);
        this._fileService.processFile(path, subDir);
      }, Settings.dir.processTimeout);
    }
  }

  readCommands(path: string): void {
    // reading json files i.e. commands or playlist
    readFile(path, 'utf8', (err: any, content: string) => {
      if (
        Settings.command.ext.some((f: string) => {
          return extname(path) === f;
        })
      ) {
        // commands or playlist - .json
        this.handleFileRead(err, content, path);
      }
    });
  }

  handleFileRead(err: any, content: string, path: string): void {
    if (err) {
      throw err;
    }

    let cmd = `${Settings.in.commands}${Settings.in.ext}`;
    if (Utils.pathExists(path, join(Settings.dir.root, Settings.dir.commands, cmd))) {
      this._commandQueueService.processQueue(content, path);
      return;
    }

    if (Utils.pathExists(path, join(Settings.dir.root, Settings.dir.playlists))) {
      this._playlistQueueService.processPlaylist(content, path);
      return;
    }

    if (Utils.pathExists(path, join(Settings.dir.root, Settings.dir.commands))) {
      this._log.message([
        path,
        ' is an invalid command file name. Expected name ',
        cmd
      ]);
    }
  }

  handleFileRemove(path: string): void {
    this._log.info(['File ', path, ' has been removed.']);
  }

  handleFileWatchError(error: any): void {
    this._log.error(['An error occured ', error]);
  }

  handleFileWatcherReady(watcher: any): void {
    let files = watcher.getWatched();
    this._log.info('Initial scan complete. Ready for changes.');
  }

}
