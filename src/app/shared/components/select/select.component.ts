import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { ClickOutsideDirective } from '../../directives';
import { IMenuOption } from '../../interfaces';
import { MenuBaseComponent } from '../menu-base';

export interface ISelectOption {
  key: string;
  value: string;
  selected?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClickOutsideDirective, MenuBaseComponent, NgIf],
})
export class SelectComponent implements OnChanges {
  @Input() id!: string;
  @Input() options!: IMenuOption[];
  @Input() enableAllOption = false;
  @Input() selectedOption!: IMenuOption | null;
  @Input() title!: string;
  @Input() label!: string;
  @Input() disabled = false;
  @Output() optionSelected = new EventEmitter<ISelectOption>();
  @Output() optionsSelected = new EventEmitter<ISelectOption[]>();
  modifiedOptions: IMenuOption[] = [];
  allOption!: IMenuOption;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']?.currentValue) {
      this.allOption = { title: this.title, value: '' };
      this.createOptions();
    }
  }

  selectOption(selected: IMenuOption): void {
    this.selectedOption = selected;
    this.createOptions();
    this.optionSelected.emit({
      key: this.id || (this.selectedOption.title as string),
      value: this.selectedOption.value,
    });
  }

  selectOptions(selectedList: IMenuOption[]): void {
    const selectedOptions = selectedList.map((selected) => {
      return {
        key: this.id,
        value: selected.value,
        selected: !!selected?.selected,
      };
    });
    this.optionsSelected.emit(selectedOptions);
  }

  createOptions(): void {
    this.modifiedOptions = this.options.map((option) => {
      if (this.selectedOption) {
        return {
          ...option,
          selected: this.selectedOption?.value === option.value
        }
      } else {
        return option;
      }
    });
  }

  reset(): void {
    this.selectedOption = null;
    this.createOptions();
  }
}
