import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from "@angular/router";
import {GameService} from "../../../services";
import { IGame, ITeam } from "../../../interfaces";

@Component({
  selector: 'app-ready-to-go',
  standalone: true,
  imports: [],
  templateUrl: './ready-to-go.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadyToGoComponent implements OnInit {
  gameService = inject(GameService);
  router = inject(Router);

  game!: IGame;
  currentTeam!: ITeam;
  isScoreShown = false;
  teamsInfo = signal<ITeam[]>([]);

  ngOnInit(): void {
    this.game = this.gameService.getGame();
    this.teamsInfo.set(Object.values(this.game.teams).sort((prev, curr) => curr.score - prev.score) as ITeam[]);
    this.currentTeam = this.gameService.getCurrentTeam();
    this.detectWinnerTeam();
  }

  start(): void {
    this.game.inProgress = true;
    this.gameService.setGame(this.game);
    this.router.navigate(['game']);
  }

  showScore(): void {
    this.isScoreShown = !this.isScoreShown;
  }

  goToGames(team: ITeam): void {
    this.router.navigate(['game', 'team-statistics', team.id]);
  }

  detectWinnerTeam(): void {
    let winnerTeam = null;
    const teamsInfoList: ITeam[] = Object.values(this.game.teams);
    const teamsCycleList: number[] = teamsInfoList.map((team) => team.cycle);

    const cycleMaxValue = Math.max(...teamsCycleList);
    const cycleMinValue = Math.min(...teamsCycleList);

    const newCycle = cycleMaxValue === cycleMinValue;

    if (!newCycle) {
      return;
    }

    const leadersList = teamsInfoList.filter((team: ITeam) => team.score >= this.game.wordsQty);

    if (newCycle && leadersList.length) {
      const highScore = leadersList.reduce((current: number, acc: ITeam) => {
        return acc.score > current ? acc.score : current;
      }, 0);
      const finalistsList = leadersList.filter((team) => team.score === highScore);

      if (finalistsList.length === 1) {
        winnerTeam = finalistsList[0];
      }
    }

    if (winnerTeam) {
      this.game.winnerTeamId = winnerTeam.id;
      this.gameService.setGame(this.game);
      this.router.navigate(['game', 'winner-is']);
    }
  }
}
