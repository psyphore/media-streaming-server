export class ClientStateLog {
  constructor(
    public id: number,
    public date: string,
    public time: string,
    public filename: string
  ) { }
}

export class ClientStateLogs {
  constructor(
    public logItems: ClientStateLog[]
  ) { }
}
