import { CommandState } from '../enums/command-state.enum';
import { CommandType } from '../enums/command-type.enum';

export class Command {
  constructor(
    public commandID: number,
    public commandName: string,
    public commandOutputFile: string,
    public commandParameter: Array<any>,
    public commandState: CommandState,
    public commandType: CommandType
  ) { }
}
