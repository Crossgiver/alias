import {ITeamSimple} from "./team-simple.interface";
import {IAnswer} from "./answer.interface";

export interface ITeam extends ITeamSimple {
  cycle: number;
  score: number;
  steps: {
    [key: string]: IAnswer[];
  };
}
