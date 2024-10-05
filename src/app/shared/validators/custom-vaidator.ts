import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { IValidatorParams } from '../interfaces';

export function customValidator(params: IValidatorParams): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (params.validator) {
      const isInvalid = params.validator(control);
      return isInvalid
        ? {
            [`${Object.keys(isInvalid)[0]}Custom`]: {
              valid: false,
              message: params.errorMsg.replace('{{value}}', value),
            },
          }
        : null;
    }

    if (params.validationFn) {
      const isValid = params.validationFn(value);

      return !isValid
        ? {
            validationInfo: {
              valid: false,
              message: params.errorMsg.replace('{{value}}', value),
            },
          }
        : null;
    }

    if (params.crossValidationFn) {
      const isValid = params.crossValidationFn(control?.parent as FormGroup);

      return !isValid
        ? {
            validationInfo: {
              valid: false,
              message: params.errorMsg.replace('{{value}}', value),
            },
          }
        : null;
    }

    return null;
  };
}
