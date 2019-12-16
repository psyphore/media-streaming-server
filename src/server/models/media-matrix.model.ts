import { PatternItem } from './pattern-item.model';

export class MediaMatrix {
  constructor(
    public patternItems: PatternItem[],
    public timeScheduledItems: any[],
    public timeScheduledTypes: any[],
    public templateName: string,
    public filename: string
  ) { }
}
