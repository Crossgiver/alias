import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { AutofocusDirective } from '../../directives';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AutofocusDirective,
    AsyncPipe,
    ReactiveFormsModule,
    NgIf,
    NgClass,
    FormsModule,
  ],
})
export class InputComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;
  @Input() id!: string;
  @Input() name!: string;
  @Input() title!: string;
  @Input() type = 'text';
  @Input() className = '';
  @Input() autofocus = false;
  @Input() autocomplete = 'off';
  @Output() valueChanged = new EventEmitter();

  fb = inject(UntypedFormBuilder);
  cdr = inject(ChangeDetectorRef);

  control = this.fb.control('');
  focused = false;
  isReset = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['title']?.currentValue && !changes['title']?.firstChange) {
      this.isReset = false;
      this.toggleFocus(true);
    }
  }

  ngOnInit(): void {
    this.control?.valueChanges
      .pipe(
        filter(() => !this.isReset),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.valueChanged.emit(value);
      });
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      this.toggleFocus(true);
    }
  }

  toggleFocus(focused: boolean): void {
    this.focused = focused;
    if (this.focused) {
      this.inputElement.nativeElement.focus();
    }
    this.cdr.detectChanges();
  }

  resetValue(): void {
    this.isReset = true;
    this.control.setValue('');
  }
}
