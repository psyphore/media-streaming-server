import { MediaContentType } from '../enums/media-content-type.enum';

export class MediaContent {
  constructor(
    public duration: string,
    public durationTicks: number,
    public id: number,
    public mediaType: MediaContentType,
    public name: string,
    public relativePath: string,
    public scheduledEndTime: string,
    public scheduledStartTime: string,
    public startTimeTicks: number,
    public volume: number
  ) { }
}
