import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  Input,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();
  @Input() includeEls: any[] = [];

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: EventTarget) {
    if (!this.elRef.nativeElement.contains(target) && !this.isInclude(target)) {
      this.clickOutside.emit();
    }
  }

  isInclude(target: EventTarget): boolean {
    return this.includeEls?.some((item) => {
      const element =
        item instanceof Element ? item : item?.elementRef?.nativeElement;
      return element?.contains(target);
    });
  }
}
