export type Player = {
  id: string;
  nickname: string;
  color?: string;
  profileImage?: string;
}
export type Room = {
  name: string;
  status: Status;
  players: Player[];
}
export enum Status {
  WAITING = "WAITING",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED"
}
export type RowType = 'wb' | 'wk' | 'wn' | 'wp' | 'wq' | 'wr' | 'bb' | 'bk' | 'bn' | 'bp' | 'bq' | 'br' | "" | null;
export type PieceImageKey = 'wb' | 'wk' | 'wn' | 'wp' | 'wq' | 'wr' | 'bb' | 'bk' | 'bn' | 'bp' | 'bq' | 'br' ;
export type BoardSetup = (RowType)[][];
