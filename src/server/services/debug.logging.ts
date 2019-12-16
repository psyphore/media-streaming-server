import { Settings } from '../config/settings';

export class Logging {
  private _log = console.log.bind(console);
  private _error = console.error.bind(console);
  private _warn = console.warn.bind(console);
  private _info = console.info.bind(console);

  public info(content: any): void {
    if (!Settings.debugging) return;

    if (Array.isArray(content))
      this._info(content.join(' '));

    this._info(content);
  }

  public error(content: any): void {
    if (!Settings.debugging) return;

    if (Array.isArray(content))
      this._error(content.join(' '));

    this._error(content);
  }

  public message(content: any): void {
    if (!Settings.debugging) return;

    if (Array.isArray(content))
      this._log(content.join(' '));

    this._log(content);
  }

  public warn(content: any): void {
    if (!Settings.debugging) return;

    if (Array.isArray(content))
      this._warn(content.join(' '));

    this._warn(content);
  }
}
