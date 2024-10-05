import {ITeam} from "./team.interface";

export interface IGame {
  id: string;
  time: number;
  wordsQty: number;
  teams: {
    [key: string]: ITeam
  };
  winnerTeamId?: string | null;
  currentTeamId?: string;
  inProgress: boolean;
  remainTime: number;
}
