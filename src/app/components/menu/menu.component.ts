import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {IGame, ITeam, ITeamSimple} from "../../interfaces";
import {GameService, WordService} from "../../services";
import {Router} from "@angular/router";
import {IMenuOption} from "../../shared/interfaces";
import {SelectComponent} from "../../shared/components/select";
import {FormInputComponent} from "../../shared/components/form-input";
import {customValidator, required } from "../../shared/validators";

export interface IGameForm {
  teamName: FormControl<string>;
  wordsQty: FormControl<number>;
  time: FormControl<number>;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent, FormInputComponent],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  isCreateTeamOpen = false;
  router = inject(Router);
  fb = inject(NonNullableFormBuilder);
  wordService = inject(WordService);
  gameService = inject(GameService);

  teams = signal<{
    [key: string]: ITeam
  }>({});

  gameForm = this.fb.group<IGameForm>({
    teamName: this.fb.control<string>(
      '',
      Validators.compose([
        customValidator({
          crossValidationFn: (form: FormGroup) => {
            return !Object.values(this.teams()).find((team) => team.name === form?.get('teamName')?.value);
          },
          errorMsg: 'Team name already exists',
        }),
        customValidator({
          validator: Validators.required,
          errorMsg: 'Team name is required',
        }),
      ]),
    ),
    wordsQty: this.fb.control<number>(0),
    time: this.fb.control<number>(0),
  })
  wordsQtySelectedOption!: IMenuOption;
  timeSelectedOption!: IMenuOption;
  wordsQtyOptions: IMenuOption[] = [
    { title: '10', value: '10' },
    { title: '15', value: '15' },
    { title: '20', value: '20' },
    { title: '25', value: '25' },
    { title: '30', value: '30' },
  ];
  timeOptions: IMenuOption[] = [
    { title: '30', value: '30' },
    { title: '35', value: '35' },
    { title: '40', value: '40' },
    { title: '45', value: '45' },
    { title: '50', value: '50' },
    { title: '55', value: '55' },
    { title: '60', value: '60' },
  ];

  ngOnInit(): void {
    this.wordsQtySelectedOption = this.wordsQtyOptions[0];
    this.timeSelectedOption = this.timeOptions[0];
    this.wordsQty.setValue(this.wordsQtySelectedOption.value);
    this.time.setValue(this.timeSelectedOption.value);
    this.wordService.generateWords();

    const game = this.gameService.getGame();
    if (game) {
      this.router.navigate(['game']);
    }
  }

  get teamName(): AbstractControl {
    return this.gameForm.get('teamName') as AbstractControl;
  }

  get wordsQty(): AbstractControl {
    return this.gameForm.get('wordsQty') as AbstractControl;
  }

  get time(): AbstractControl {
    return this.gameForm.get('time') as AbstractControl;
  }

  createTeam(): void {
    this.isCreateTeamOpen = true;
  }

  close(): void {
    this.isCreateTeamOpen = false;
    this.teamName.reset();
    this.teamName.markAsUntouched();
  }

  create(): void {
    const teamId = crypto.randomUUID();
    this.teams.update(teams => ({
      ...teams,
      [teamId]: {
        cycle: 0,
        name: this.teamName.value || '',
        id: teamId,
        score: 0,
        steps: {},
      }
    }));
    this.teamName.reset();
    this.isCreateTeamOpen = false;
  }

  remove(removedTeam: ITeamSimple): void {
    const modifiedTeams = this.teams();
    delete modifiedTeams[removedTeam.id];

    this.teams.set(modifiedTeams);
  }

  get teamsList(): ITeam[] {
    return Object.values(this.teams());
  }

  start(): void {
    const newGame: IGame = {
      id: crypto.randomUUID(),
      time: Number(this.time.value),
      wordsQty: Number(this.wordsQty.value),
      teams: this.teams(),
      currentTeamId: Object.keys(this.teams())[0],
      winnerTeamId: null,
      inProgress: true,
      remainTime: 0,
    };

    this.gameService.setGame(newGame);
    this.router.navigate(['game', 'ready']);
  }

  selectWordsQty(wordQty: IMenuOption): void {
    this.wordsQty.setValue(wordQty.value);
  }

  selectTime(time: IMenuOption): void {
    this.time.setValue(time.value);
  }
}
