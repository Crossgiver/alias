import {ChangeDetectionStrategy, Component, HostListener, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {GameService, WordService} from "../../../services";
import {IAnswer, IGame, ITeam, IWord} from "../../../interfaces";
import { interval, Subscription } from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  wordService = inject(WordService);
  router = inject(Router);

  game!: IGame;
  currentTeam!: ITeam;
  words = signal<IAnswer[]>([]);
  timer = signal(0);
  wordsCountForStep = 5;
  gamePaused = false;
  timeSub!: Subscription;
  subscription = new Subscription();

  ngOnInit(): void {
    this.game = this.gameService.getGame();
    this.currentTeam = this.gameService.getCurrentTeam();
    this.timer.set(this.game.remainTime ? this.game.remainTime : this.game.time);

    if (!this.game.remainTime) {
      this.start();
    } else {
      this.gamePaused = true;
    }

    this.getWords();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  start(): void {
    this.timeSub = interval(1000).subscribe(n => {
      this.timer.update(n => --n);
      this.gameService.setGame({
        ...this.game,
        remainTime: this.timer(),
      });
      if (this.timer() <= 0) {
        this.finishGame();
      }
    });

    this.subscription.add(this.timeSub);
  }

  finishGame(): void {
    this.game = {
      ...this.game,
      teams: {
        ...this.game.teams,
        [this.currentTeam.id]: {
          ...this.currentTeam,
          cycle: ++this.currentTeam.cycle
        }
      }
    };
    const teamsKeysList = Object.keys(this.game.teams);
    const currentTeamIndex = teamsKeysList
      .findIndex((teamId) => (teamId === this.currentTeam.id));
    const nextTeamIndex = !!teamsKeysList[currentTeamIndex + 1] ? currentTeamIndex + 1 : 0;

    this.game.currentTeamId = teamsKeysList[nextTeamIndex];
    this.game.inProgress = false;
    this.game.remainTime = 0;

    this.gameService.setGame(this.game);
    this.timeSub.unsubscribe();
    this.router.navigate(['game', 'ready']);
  }

  guessWord(guessedWord: IAnswer): void {
    if (this.gamePaused) {
      return;
    }

    const newGuessedWordsList = this.words().map((word) => {
      if (word.id === guessedWord.id) {
        return { ...word, isGuessed: !word.isGuessed }
      } else {
        return word;
      }
    });

    this.words.set(newGuessedWordsList);
    this.currentTeam.score = guessedWord.isGuessed ? --this.currentTeam.score : ++this.currentTeam.score;
    this.gameService.setCurrentTeamLastStep(newGuessedWordsList);
    this.gameService.setCurrentTeamScore(this.currentTeam.score);
    this.getGameData();

    const guessedWordsCountForStep = this.words().filter((word) => word.isGuessed).length;
    if (guessedWordsCountForStep >= this.wordsCountForStep) {
      this.getWords();
    }
  }

  saveStep(): void {
    const stepIndex = Object.keys(this.currentTeam.steps).length + 1;
    this.currentTeam.steps[`Step ${stepIndex}`] = this.words();
  }

  getWords(): void {
    if (this.game.remainTime && this.gamePaused) {
      const teamStepsList: IAnswer[][] = Object.values(this.currentTeam.steps);
      const teamLastStep: IAnswer[] = teamStepsList[teamStepsList.length - 1];
      this.words.set(teamLastStep);
    } else {
      const wordsForStep = this.wordService.getWords(this.wordsCountForStep);
      this.words.set(wordsForStep.map((word: IWord) => ({ ...word, isGuessed: false })));
      this.gameService.setCurrentTeamNextStep(this.words());
      this.getGameData();
    }
  }

  getGameData(): void {
    this.game = this.gameService.getGame();
    this.currentTeam = this.gameService.getCurrentTeam();
  }

  togglePause(): void {
    this.gamePaused = !this.gamePaused;

    if (this.gamePaused) {
      this.gameService.setGame({
        ...this.game,
        remainTime: this.timer(),
      });
      this.timeSub.unsubscribe();
    } else {
      this.start();
    }
  }
}
