import { Router, Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';

export class HttpHandler {
  private _route: Router;

  constructor(route: Router) {
    this._route = route;
    this.handleHttpRequests();
  }

  private handleHttpRequests(): void {
    this._route.options(/^/, (req: Request, res: Response, next: NextFunction) => {
      res.status(200);
      next();
    });
  }

}
