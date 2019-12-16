import { join } from 'path';
import { exec } from 'child_process';

import { FileService } from './file';
import { Settings } from '../config/settings';
import { ReportService } from './report';
import { CommandRepository } from '../repositories/commands';

import { CommandType } from '../enums/command-type.enum';
import { Command } from '../models/command.model';
import { CommandQueue } from '../models/command-queue.model';
import { CommandState } from '../enums/command-state.enum';
import { Message } from '../models/simple-socket-message.model';
import { Logging } from './debug.logging';

export class CommandQueueService {
  private _log: Logging;
  private newCommandQueue: CommandQueue;
  private processedCommandQueue: CommandQueue;
  private _fileService: FileService;
  private _reportService: ReportService;
  private _cmdRepo: CommandRepository;
  private _socket: any;

  constructor() {
    this._fileService = new FileService();
    this._reportService = new ReportService();
    this._cmdRepo = new CommandRepository();
    this._log = new Logging();
  }

  reset(): void {
    this.newCommandQueue = new CommandQueue();
    this.processedCommandQueue = new CommandQueue();
  }

  processQueue(content: string, path: string): void {
    this.reset();
    // read content into a variable
    try {
      this.newCommandQueue = <CommandQueue>JSON.parse(content);
    } catch (error) {
      throw error;
    }

    this.newCommandQueue.commands.forEach((cmd, indx, arr) => {
      // log processed command
      this.logProcessedCommand(cmd, CommandState.Started);

      switch (cmd.commandType) {
        /** Reports */
        case CommandType.ReportClientStateLog:
          this.processClientStateReport(cmd, 'hibernating', false);
          break;
        case CommandType.ListMediaFiles:
          this.listCurrentMediaFiles(cmd);
          break;
        case CommandType.ReportActivityLog:
          this.processClientStateReport(cmd);
          break;

        /** Server side */
        case CommandType.RestartClient:
          this.restartServer(cmd);
          break;

        /** Client side */
        case CommandType.ReloadPlaylists:
          this.refreshClient(cmd);
          break;

        case CommandType.Debug:
          this.toggleDebugging(cmd);
          break;

        default:
          this._log.message(`${cmd.commandType} command is not supported.`);
          break;
      }
    });

    // move command file to processed
    this._fileService.processFile(path, Settings.dir.commands);
  }

  processClientStateReport(cmd: Command, exclude: string = 'none', unique: boolean = true): void {
    // dump client state log to logs dir
    let name = `${cmd.commandID}`;
    this._log.message(['processing: ', name]);
    this._reportService.getClientStateLogs(cmd.commandParameter[0], cmd.commandParameter[1], exclude, unique)
      .subscribe(success => {
        this._log.info(success);
        this.logProcessedCommand(cmd, CommandState.Completed);
      }, err => {
        this._log.error(err);
        this.logProcessedCommand(cmd, CommandState.Failed);
      });
  }

  logProcessedCommand(cmd: Command, state: CommandState): void {
    this.processedCommandQueue.commands = this.newCommandQueue.commands.map(c => {
      if (c.commandID === cmd.commandID) {
        c.commandState = state;
        cmd.commandState = state;
      }
      return c;
    });
    let path = join(Settings.dir.root, Settings.dir.logs.path);
    let name = `${Settings.out.commands}${Settings.out.ext}`;
    this._fileService.saveToFile(JSON.stringify(cmd), path, name)
      .subscribe(result => this._log.info(`${result}`), err => this._log.error(err));
  }

  restartServer(cmd: Command): void {
    let pm2Reload = `pm2 reload ecosystem.config.js --env production`;
    let startCommand = `node ${join(process.cwd())}${Settings.dir.nav}${Settings.appName}`;
    let pid = process.pid;
    setTimeout(() => {
      this.logProcessedCommand(cmd, CommandState.Completed);
      exec(pm2Reload, () => {
        process.kill(pid);
      });
    }, Settings.dir.processTimeout * 2);
  }

  refreshClient(cmd: Command): void {
    this.broadcast({ subject: 'refresh', body: 'go' });
    this.logProcessedCommand(cmd, CommandState.Completed);
  }

  listCurrentMediaFiles(cmd: Command): void {
    this._reportService.getServerMediaList(cmd.commandParameter)
      .subscribe(success => {
        this._log.info(success);
        this.logProcessedCommand(cmd, CommandState.Completed);
      }, err => {
        this._log.error(err);
        this.logProcessedCommand(cmd, CommandState.Failed);
      });
  }

  toggleDebugging(cmd: Command): void {
    Settings.debugging = !Settings.debugging;
    this.broadcast({ subject: 'debug', body: !Settings.debugging });
  }

  socketHandler(socket: any): void {
    this._socket = socket;
  }

  broadcast(message: Message): void {
    if (this._socket) {
      this._socket.emit(message.subject, message);
    }
  }

}
