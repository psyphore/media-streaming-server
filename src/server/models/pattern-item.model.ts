import { MediaContentType } from '../enums/media-content-type.enum';

export class PatternItem {
  constructor(
    public allowDuplicates: boolean,
    public playCount: number,
    public mediaType: MediaContentType,
    public scheduleStyle: number,
    public scheduledTime: string,
    public scheduledTimeTicks: number,
    public volume: number
  ) { }
}
