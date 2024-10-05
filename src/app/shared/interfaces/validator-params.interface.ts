import { FormGroup, ValidatorFn } from '@angular/forms';

export interface IValidatorParams {
  validationFn?: (v: string) => boolean;
  crossValidationFn?: (form: FormGroup) => boolean;
  validator?: ValidatorFn;
  errorMsg: string;
}
