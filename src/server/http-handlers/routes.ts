import { Router } from 'express';

import { HttpHandler } from './http.handler';
import { ClientHandler } from './client.handler';
import { MediaHandler } from './media.handler';
import { ReportHandler } from './report.handler';

export class Route {
  _route: Router;

  private _hh: HttpHandler;
  private _ch: ClientHandler;
  private _mh: MediaHandler;
  private _rh: ReportHandler;

  constructor(public route: Router) {
    this._hh = new HttpHandler(route);

    this._ch = new ClientHandler(route);

    this._mh = new MediaHandler(route);

    this._rh = new ReportHandler(route);

    this._route = route;
  }
}
