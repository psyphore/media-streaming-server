export enum CommandType {
  ListMediaFiles = 1, // used to request a listing of all media files available to play
  NotSet = 2, // you should never see this one
  RebootMachine = 3,// ignore this one for now
  ReloadPlaylists = 4, // force a playlist reload on the client.
  ReportActivityLog = 5, // ignore this one for now, but we need to implement later.
  ReportAllLogs = 6, // ignore this one for now
  /**
   * A log of all the states the client has been in at what time.
   * So basically you need to log everytime the client state changes.
   * This is not critical right now
   */
  ReportClientStateLog = 7,
  ReportExceptionLog = 8, // ignore for now
  RestartClient = 9, // ignore for now.

  Debug = 10  // toggle debugging on api and client
}
