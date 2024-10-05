import {inject, Injectable} from "@angular/core";
import {WebStorageService} from "./web-storage.service";
import {IAnswer, IGame, ITeam} from "../interfaces";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private webStorage = inject(WebStorageService);
  private router = inject(Router);

  getGame(): IGame {
    return this.webStorage.get('game', 'SESSION') as IGame;
  }

  setGame(game: IGame | null): void {
    this.webStorage.set('game', game, 'SESSION');
  }

  getCurrentTeam(): ITeam {
    const game = this.getGame();
    return game?.teams?.[game.currentTeamId as string] as ITeam;
  }

  setCurrentTeamNextStep(step: IAnswer[]): void {
    let currentTeam = this.getCurrentTeam();
    const game = this.getGame();
    const stepName = `Step ${Object.keys(currentTeam.steps).length + 1}`;

    currentTeam = {
      ...currentTeam,
      steps: {
        ...currentTeam.steps,
        [stepName]: step,
      },
    };

    this.setGame({
      ...game,
      teams: {
        ...game.teams,
        [currentTeam.id]: currentTeam
      },
    });
  }

  setCurrentTeamLastStep(step: IAnswer[]): void {
    let currentTeam = this.getCurrentTeam();
    const game = this.getGame();
    const lastStepIndex = Object.keys(currentTeam.steps).length;

    const lastStep = lastStepIndex === 0
      ? `Step ${Object.keys(currentTeam.steps).length + 1}`
      : `Step ${Object.keys(currentTeam.steps).length}`;

    const steps = lastStepIndex === 0
    ? { [lastStep]: step }
      : {
        ...currentTeam.steps,
        [lastStep]: step,
      };
    currentTeam = {
      ...currentTeam,
      steps: steps
    };

    this.setGame({
      ...game,
      teams: {
        ...game.teams,
        [currentTeam.id]: currentTeam
      },
    });
  }

  setCurrentTeamScore(score: number): void {
    let currentTeam = this.getCurrentTeam();
    const game = this.getGame();
    this.setGame({
      ...game,
      teams: {
        ...game.teams,
        [currentTeam.id]: {
          ...currentTeam,
          score: score,
        }
      },
    });
  }

  canActivate(): boolean {
    if (!!this.getGame()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }

  isWinnerNotExist(): boolean {
    if (!this.getGame()?.winnerTeamId) {
      return true;
    } else {
      this.router.navigate(['game', 'winner-is']);
      return false;
    }
  }
}
