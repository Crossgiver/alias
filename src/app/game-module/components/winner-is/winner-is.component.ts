import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {GameService, WebStorageService} from "../../../services";
import {IGame, ITeam} from "../../../interfaces";
import {Router} from "@angular/router";

@Component({
  selector: 'app-winner-is',
  standalone: true,
  imports: [],
  templateUrl: './winner-is.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnerIsComponent implements OnInit {
  webStorage = inject(WebStorageService);
  gameService = inject(GameService);
  router = inject(Router);

  game!: IGame;
  winnerTeam!: ITeam;
  teamsList!: ITeam[];

  ngOnInit(): void {
    this.game = this.gameService.getGame();
    if (this.game.winnerTeamId) {
      this.winnerTeam = this.game.teams[this.game.winnerTeamId];
      this.teamsList = Object.values(this.game.teams).sort((prev, curr) => curr.score - prev.score) as ITeam[];
    }
  }

  startNewGame(): void {
    this.gameService.setGame(null);
    this.router.navigate(['menu']);
  }

  continue(): void {
    let resetTeams: {
      [key: string]: ITeam
    }  = {};
    Object.values(this.teamsList).forEach((teamData) => {
      resetTeams[teamData.id] = {
        ...teamData,
        score: 0,
        cycle: 0,
        steps: {},
      };
    });
    const newGame = {
      ...this.game,
      inProgress: false,
      remainTime: 0,
      winnerTeamId: null,
      teams: resetTeams,
    };
    this.gameService.setGame(newGame);
    this.router.navigate(['game', 'ready']);
  };
}
