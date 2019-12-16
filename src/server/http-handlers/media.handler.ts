import { Router, Request, Response, NextFunction } from 'express';
import { MediaManager } from '../services/media';
import { PlaylistSchedule } from '../models/playlist-schedule.model';
import { Stream } from '../models/stream.model';
import { Utils } from '../util';

export class MediaHandler {
  private _route: Router;
  private _pm: MediaManager;

  constructor(route: Router) {
    this._route = route;
    this._pm = new MediaManager();
    this.handleMediaRequests();
  }

  handleMediaRequests(): void {
    this._route.post('/playlist/generate/test', (req: Request, res: Response, next: NextFunction) => {
      this._pm.saveSchedule(<PlaylistSchedule>req.body, false)
        .subscribe(playlist => Utils.genericSuccessResponse(playlist, res),
                   err => Utils.genericServerErrorResponse(err, res),
                   () => next());
    });

    this._route.post('/playlist/generate/', (req: Request, res: Response, next: NextFunction) => {
      this._pm.saveSchedule(<PlaylistSchedule>req.body)
        .subscribe(playlist => Utils.genericSuccessResponse(playlist, res),
                   err => Utils.genericServerErrorResponse(err, res),
                   () => next());
    });

    this._route.get('/playlist/artwork/', (req: Request, res: Response, next: NextFunction) => {
      this._pm.getAllStillAdverts()
        .subscribe(arts => Utils.genericSuccessResponse(arts, res),
                   err => Utils.genericServerErrorResponse(err, res),
                   () => next());
    });

    this._route.get('/playlist/latest', (req: Request, res: Response, next: NextFunction) => {
      this._pm.getLast()
        .subscribe(schedule => Utils.genericSuccessResponse(schedule, res),
                   err => Utils.genericServerErrorResponse(err, res),
                   () => next());
    });

    this._route.get('/playlist/stream/a/:title', (req: Request, res: Response) => {
      let title = req.params.title;
      let stream = this._pm.streamAudioMedia(title);
      Utils.genericStreamResponse(stream, res);
    });

    this._route.get('/playlist/stream/v/:title', (req: Request, res: Response) => {
      let title = req.params.title;
      let stream = this._pm.streamVideoMedia(title);
      Utils.genericStreamResponse(stream, res);
    });

    this._route.get('/playlist/stream/:relativePath', (req: Request, res: Response) => {
      let relativePath = req.params.relativePath;
      let stream = this._pm.streamMedia(relativePath);
      Utils.genericStreamResponse(stream, res);
    });

    this._route.get('/playlist/stream/e/:relativePath', (req: Request, res: Response) => {
      let relativePath = req.params.relativePath;
      this._pm.streamEncryptedMedia(relativePath)
      .subscribe((stream) => Utils.genericStreamResponse(stream, res),
                 (err) => Utils.genericServerErrorResponse(err, res));
    });

    this._route.get('/playlist/artwork/:title', (req: Request, res: Response) => {
      let title = req.params.title;
      let stream = this._pm.streamArtwork(title);
      Utils.genericStreamResponse(stream, res);
    });
  }
}
