import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  AsyncPipe,
  JsonPipe,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';

@Component({
  selector: 'app-input-error',
  templateUrl: 'input-error.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    AsyncPipe,
    JsonPipe,
  ],
})
export class InputErrorComponent implements OnChanges {
  @Input() control!: AbstractControl;
  @Input() status!: string;
  @Input() value!: string;
  @Input() touched!: boolean;
  @Input() showFirstError = false;

  showError = false;
  errorsArray: { name: string; info: Record<string, unknown> }[] = [];
  errorMessagesList!: string[];

  ngOnChanges(): void {
    this.showError =
      (this.control?.invalid &&
        (this.control?.dirty || this.control?.touched)) ||
      false;

    this.errorsArray = Object.entries(this.control?.errors || []).map(
      (errorEntry) => {
        return { name: errorEntry[0], info: errorEntry[1] };
      }
    );

    this.errorMessagesList = (
      this.showFirstError ? [this.errorsArray[0]] : this.errorsArray
    ).map((error) => {
      return this.getErrorMessage(error);
    });
  }

  getErrorMessage(error: {
    name: string;
    info: Record<string, unknown>;
  }): string {
    switch (error?.name) {
      case 'min':
        return `Input should be at least ${error.info['min']} characters long.`;
      case 'minlength':
        return `Input should be at least ${error.info['requiredLength']} characters long.`;
      case 'max':
        return `Input should be maximum ${error.info['max']} characters long.`;
      case 'maxlength':
        return `Input should be maximum ${error.info['requiredLength']} characters long.`;
      case 'required':
        return 'Input is required.';
      case 'email':
        return 'Input should be email.';
      case 'pattern':
        return 'Input not matched with pattern.';
      default:
        return `${error?.info?.['message']}`;
    }
  }
}
