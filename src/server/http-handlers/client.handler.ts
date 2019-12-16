import { Router, Request, Response, NextFunction } from 'express';
import { ClientManagement } from '../services/client';
import { Utils } from '../util';

export class ClientHandler {
  private _route: Router;
  private _cm: ClientManagement;

  constructor(public route: Router) {
    this._route = route;
    this._cm = new ClientManagement();
    this.handleClientRequest();
  }

  private handleClientRequest(): void {
    this._route.post('/client/current/media', (req: Request, res: Response, next: NextFunction) => {
      this._cm.logCurrentMedia(req.body)
          .subscribe(updates => Utils.genericSuccessResponse(updates, res),
                     err => Utils.genericServerErrorResponse(err, res),
                    () => next());
    });
  }

}
