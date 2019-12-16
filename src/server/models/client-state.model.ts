import { ClientStateType } from '../enums/client-state-type.enum';

export class ClientState {
  constructor(
    public clientState: ClientStateType,
    public clientVersion: string,
    public currentPlaylistName: string,
    public currentPlaylistScheduleName: string,
    public currentPlaylistItem: string,
    public currentPlaylistEndtime: string,
    public endTimeTicks: number,
    public currentPlaylistStartTime: string,
    public startTimeTicks: number,
    public currentPlaylistScheduleVersion: number,
    public pointInTime: string,
    public debugging: boolean
  ) { }
}
