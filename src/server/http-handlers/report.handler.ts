import { Router, Request, Response, NextFunction } from 'express';
import { ClientManagement } from '../services/client';
import { Utils } from '../util';

export class ReportHandler {
  private _route: Router;
  private _cm: ClientManagement;

  constructor(public route: Router) {
    this._route = route;
    this._cm = new ClientManagement();
    this.handleReportRequests();
  }

  private handleReportRequests(): void {
    this._route.get('/report/last/media', (req: Request, res: Response, next: NextFunction) => {
      this._cm.getCurrentMediaLog()
          .subscribe(log => Utils.genericSuccessResponse(log, res),
                     err => Utils.genericServerErrorResponse(err, res),
                     () => next());
    });

    this._route.get('/report/media/:size', (req: Request, res: Response, next: NextFunction) => {
      this._cm.getMediaLogs(+req.params.size)
          .subscribe(logs => Utils.genericSuccessResponse(logs, res),
                     err => Utils.genericServerErrorResponse(err, res),
                     () => next());
    });

  }
}
