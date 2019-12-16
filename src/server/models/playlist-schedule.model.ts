import { Playlist } from './playlist.model';
import { PlaylistTemplate } from './playlist-template.model';

export class PlaylistSchedule {
  constructor(
    public endTime: string,
    public endTimeTicks: number,
    public month: string,
    public name: string,
    public playlists: Playlist[],
    public startTime: string,
    public startTimeTicks: number,
    public playlistTemplate: PlaylistTemplate,
    public version: number
  ) { }
}
