import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {WebStorageService} from "../../../services";
import {IAnswer, IGame, ITeam} from "../../../interfaces";

@Component({
  selector: 'app-team-statistics',
  standalone: true,
  imports: [],
  templateUrl: './team-statistics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStatisticsComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private webStorage = inject(WebStorageService);
  game!: IGame;
  team!: ITeam;
  isEditMode = false;
  steps = signal<{ name: string; step: IAnswer[] }[]>([]);

  ngOnInit(): void {
    const teamId = this.activatedRoute.snapshot.params['teamId'];
    this.game = this.webStorage.get('game', 'SESSION') as IGame;
    this.team = this.game.teams[teamId] as ITeam;
    this.steps.set(Object.entries(this.team.steps as {[key: string]: IAnswer[]}).map(([key, value]) => ({ name: key, step: value })));
  }

  toggleAnswer(selectedAnswer: IAnswer, stepName: string): void {
    this.steps.update((steps) => {
      return steps.map((step) => {
        return step.name === stepName ? { name: step.name, step: step.step.map((answer) => {
            return answer.id === selectedAnswer.id ? { ...answer, isGuessed: !answer.isGuessed } : answer;
          })
        }: step;
      });
    });
  }

  goBack(): void {
    this.team.steps = {};
    this.team.score = 0;
    this.steps().forEach(({name, step}) => {
      this.team.steps[name] = step;
      this.team.score += step.filter(answer => answer.isGuessed).length;
    });
    this.game = {
      ...this.game,
      teams: {
        ...this.game.teams,
        [this.team.id]: this.team,
      },
    };
    this.webStorage.set('game', this.game, 'SESSION');
    this.router.navigate(['game', 'ready']);
  }

  edit(): void {
    this.isEditMode = !this.isEditMode;
  }
}
