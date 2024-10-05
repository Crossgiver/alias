import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {InputErrorComponent} from "../input-error";
import { AutofocusDirective } from '../../directives';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputErrorComponent,
    AutofocusDirective,
    AsyncPipe,
    ReactiveFormsModule,
    NgIf,
    NgClass,
  ],
})
export class FormInputComponent implements AfterViewInit, OnInit {
  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;
  @Input() formGroup!: FormGroup;
  @Input() control!: AbstractControl;
  @Input() id!: string;
  @Input() name!: string;
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() type = 'text';
  @Input() className = '';
  @Input() autofocus = false;
  @Input() autocomplete = 'off';
  @Output() valueChanged = new EventEmitter();
  focused = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.control?.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.valueChanged.emit(value);
      });
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      this.focused = true;
      this.cd.detectChanges();
    }
  }
}
