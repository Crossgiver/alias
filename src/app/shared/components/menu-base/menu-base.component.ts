import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { IMenuOption } from '../../interfaces';
import { MenuOptionsComponent } from '../menu-options';
import { ClickOutsideDirective } from '../../directives';

@Component({
  selector: 'app-menu-base',
  templateUrl: './menu-base.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ClickOutsideDirective, NgIf],
})
export class MenuBaseComponent implements OnDestroy {
  @Input() triggerInfo!: string;
  @Input() options!: IMenuOption[];
  @Input() disabled = false;
  @Output() selected: EventEmitter<IMenuOption> =
    new EventEmitter<IMenuOption>();
  @Output() selectedList: EventEmitter<IMenuOption[]> = new EventEmitter<
    IMenuOption[]
  >();

  menuOptionsComponent!: ComponentRef<MenuOptionsComponent>;
  isOpened = false;

  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  constructor(
    public elemRef: ElementRef,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.destroy();
  }

  toggleMenu(toggleFromTrigger?: boolean): void {
    if (this.isOpened) {
      this.destroy();
    } else {
      const { bottom, left } =
        this.elemRef.nativeElement.getBoundingClientRect();
      this.menuOptionsComponent = createComponent(MenuOptionsComponent, {
        environmentInjector: this.injector,
      });
      this.menuOptionsComponent.instance.options = this.options;
      this.menuOptionsComponent.instance.top = bottom;
      this.menuOptionsComponent.instance.left = left;
      this.menuOptionsComponent.instance.menuTrigger = this;
      document.body.appendChild(
        this.menuOptionsComponent.location.nativeElement
      );
      this.appRef.attachView(this.menuOptionsComponent.hostView);
    }
    this.isOpened = !this.isOpened;
    this.cdr.markForCheck();
  }

  destroy(): void {
    if (this.menuOptionsComponent?.instance) {
      this.menuOptionsComponent.instance.close();
      this.menuOptionsComponent.destroy();
    }
  }

  clickOutside(): void {
    if (this.isOpened) {
      this.toggleMenu();
    }
  }

  selectOption(selectedOption: IMenuOption): void {
    this.selected.emit(selectedOption);
  }
}
