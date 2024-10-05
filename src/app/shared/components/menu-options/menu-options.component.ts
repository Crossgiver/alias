import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { IMenuOption } from '../../interfaces';
import { MenuBaseComponent } from '../menu-base';

export interface IMenuTriggerMetrics {
  halfWidth: number;
  halfHeight: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IMenuOptionsMetrics {
  width: number;
  height: number;
  halfWidth: number;
  halfHeight: number;
}

export interface PageMetrics {
  width: number;
  height: number;
  scrollY: number;
}

export enum IMenuPosition {
  Above = 'ABOVE',
  Below = 'BELOW',
  Left = 'LEFT',
  Right = 'RIGHT',
  Default = 'ABOVE',
}

@Component({
  selector: 'app-menu-options',
  templateUrl: './menu-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgStyle, NgClass, NgIf],
  standalone: true,
})
export class MenuOptionsComponent implements AfterViewInit {
  options!: IMenuOption[];
  top!: number;
  left!: number;
  position: IMenuPosition = IMenuPosition.Below;
  menuTrigger!: MenuBaseComponent;
  className = '';
  hidden = true;
  private triggerMetrics!: IMenuTriggerMetrics;
  private menuMetrics!: IMenuOptionsMetrics;
  private pageMetrics!: PageMetrics;

  constructor(
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.setMetrics();
    this.computePositions();
  }

  private setMetrics(): void {
    const { width: menuWidth, height: menuHeight }: DOMRect =
      this.elementRef.nativeElement.firstElementChild.getBoundingClientRect();
    const {
      width: triggerWidth,
      height: triggerHeight,
      top: triggerTop,
      right: triggerRight,
      bottom: triggerBottom,
      left: triggerLeft,
    }: DOMRect = this.menuTrigger.elemRef.nativeElement.getBoundingClientRect();

    this.triggerMetrics = {
      halfHeight: Math.round(triggerHeight / 2),
      halfWidth: Math.round(triggerWidth / 2),
      top: Math.round(triggerTop),
      right: Math.round(triggerRight),
      bottom: Math.round(triggerBottom),
      left: Math.round(triggerLeft),
    };
    this.menuMetrics = {
      width: Math.round(menuWidth),
      height: Math.round(menuHeight),
      halfWidth: Math.round(menuWidth / 2),
      halfHeight: Math.round(menuHeight / 2),
    };
    this.pageMetrics = {
      width: Math.round(window.innerWidth),
      height: Math.round(window.innerHeight),
      scrollY: Math.round(window.scrollY),
    };
  }

  private computePositions(): void {
    this.top = this.topOffset;
    this.left = this.leftOffset;
    this.hidden = false;
    this.cdRef.detectChanges();
  }

  private get topOffset(): number {
    let topOffset;
    let isMenuGetsOutOfPageTopBorder;
    let isMenuGetsOutOfPageBottomBorder;

    switch (this.position) {
      case IMenuPosition.Above:
        isMenuGetsOutOfPageTopBorder =
          this.triggerMetrics.top <= this.menuMetrics.height;
        topOffset = isMenuGetsOutOfPageTopBorder
          ? this.triggerMetrics.bottom
          : this.triggerMetrics.top - this.menuMetrics.height;
        break;
      case IMenuPosition.Below:
        isMenuGetsOutOfPageBottomBorder =
          this.triggerMetrics.bottom + this.menuMetrics.height >
          this.pageMetrics.height;
        topOffset = isMenuGetsOutOfPageBottomBorder
          ? this.triggerMetrics.top - this.menuMetrics.height
          : this.triggerMetrics.bottom;
        break;
      case IMenuPosition.Right:
      case IMenuPosition.Left:
        isMenuGetsOutOfPageTopBorder =
          this.menuMetrics.halfHeight - this.triggerMetrics.halfHeight >
          this.triggerMetrics.top;
        isMenuGetsOutOfPageBottomBorder =
          this.menuMetrics.halfHeight -
            this.triggerMetrics.halfHeight +
            this.triggerMetrics.bottom >
          this.pageMetrics.height;

        if (isMenuGetsOutOfPageTopBorder) {
          topOffset = this.triggerMetrics.top > 0 ? this.triggerMetrics.top : 5;
        } else if (isMenuGetsOutOfPageBottomBorder) {
          topOffset =
            this.pageMetrics.height > this.triggerMetrics.bottom
              ? this.triggerMetrics.bottom - this.menuMetrics.height
              : this.pageMetrics.height - (this.menuMetrics.height + 5);
        } else {
          topOffset =
            this.triggerMetrics.top +
            this.triggerMetrics.halfHeight -
            this.menuMetrics.halfHeight;
        }
        break;
    }

    return this.pageMetrics.scrollY + topOffset;
  }

  private get leftOffset(): number {
    let leftOffset;
    let isMenuGetsOutOfPageLeftBorder;
    let isMenuGetsOutOfPageRightBorder;

    switch (this.position) {
      case IMenuPosition.Above:
      case IMenuPosition.Below:
        isMenuGetsOutOfPageLeftBorder =
          this.triggerMetrics.left + this.triggerMetrics.halfWidth <
          this.menuMetrics.halfWidth;
        isMenuGetsOutOfPageRightBorder =
          this.triggerMetrics.right -
            this.triggerMetrics.halfWidth +
            this.menuMetrics.halfWidth >
          this.pageMetrics.width;

        if (isMenuGetsOutOfPageLeftBorder) {
          leftOffset = this.triggerMetrics.left;
        } else if (isMenuGetsOutOfPageRightBorder) {
          leftOffset = this.triggerMetrics.right - this.menuMetrics.width;
        } else {
          leftOffset =
            this.triggerMetrics.halfWidth +
            this.triggerMetrics.left -
            this.menuMetrics.halfWidth;
        }
        break;
      case IMenuPosition.Right:
        isMenuGetsOutOfPageRightBorder =
          this.triggerMetrics.right + this.menuMetrics.width >
          this.pageMetrics.width;
        leftOffset = isMenuGetsOutOfPageRightBorder
          ? this.triggerMetrics.left - this.menuMetrics.width
          : this.triggerMetrics.right;
        break;
      case IMenuPosition.Left:
        isMenuGetsOutOfPageLeftBorder =
          this.triggerMetrics.left < this.menuMetrics.width;
        leftOffset = isMenuGetsOutOfPageLeftBorder
          ? this.triggerMetrics.right
          : this.triggerMetrics.left - this.menuMetrics.width;
        break;
    }

    return leftOffset;
  }

  close(): void {
    this.options = [];
    this.top = 0;
    this.left = 0;
  }

  select(selection: IMenuOption): void {
    if ('actionFn' in selection && selection.actionFn) {
      selection.actionFn();
    }

    this.menuTrigger.selectOption(selection);
    this.menuTrigger.toggleMenu();
  }

  checkOption(selection: IMenuOption, checked: boolean): void {
    this.select({ ...selection, selected: checked });
  }

  private defineClassName(classList: string[]): string {
    return classList.reduce(
      (previous, current) => previous + ` ${current}`,
      ''
    );
  }
}
