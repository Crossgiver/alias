import {IWord} from "./word.interface";

export interface IAnswer extends IWord {
  isGuessed: boolean;
}
