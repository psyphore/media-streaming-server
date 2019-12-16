import { Settings } from '../config/settings';

export class Message {
  public from?: string = Settings.name;
  public subject?: string = 'message';
  public body: any;
}
