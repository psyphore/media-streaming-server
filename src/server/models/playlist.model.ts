import { MediaContent } from './media-content.model';

export class Playlist {
  constructor(
    public audioRepo: any,
    public completed: boolean,
    public date: string,
    public inPlayIndex: number,
    public inPlayItem: MediaContent,
    public endTime: string,
    public endTimeTicks: number,
    public items: MediaContent[],
    public playlistName: string,
    public sessionDequeueCount: number,
    public startTime: string,
    public startTimeTicks: number
  ) { }
}
