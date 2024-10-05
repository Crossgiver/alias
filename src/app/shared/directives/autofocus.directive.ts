import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit {
  @Input() appAutofocus = false;

  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    if (this.appAutofocus) {
      this.host.nativeElement.focus();
    }
  }
}
