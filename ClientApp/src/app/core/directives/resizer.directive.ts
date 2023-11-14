import { Directive, HostListener, Input } from '@angular/core';
import { Observable, fromEvent, take, takeWhile } from 'rxjs';
import { ViewerComponent } from 'src/app/components/viewer/viewer.component';

@Directive({
  selector: '[appResizer]',
  standalone: true
})
export class ResizerDirective {
  @Input() elementRef!: HTMLElement;
  @Input() views: ViewerComponent[] = [];

  public resizerState: ResizerElementState = {
    isResizing: false,
    xDiff: 0,
    yDiff: 0,
    combinePercentage: 0,
    previousLeftWidth: 0,
    previousRightWidth: 0
  };

  private mouseMove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mousemove");
  private mouseUp$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mouseup");
  private px_minResizer = 64;

  constructor() { }

  @HostListener('mousedown', ['$event']) onMouseDown(e: MouseEvent) {
    if (this.views.length <= 1) return;
    this.resizerState.isResizing = true;
    this.resizerState.xDiff = e.pageX;
    this.resizerState.yDiff = e.pageY;

    this.resizerState.previousLeftWidth = Number(this.views[0].widthPercentage.substring(0, this.views[0].widthPercentage.length - 1));
    this.resizerState.previousRightWidth = Number(this.views[1].widthPercentage.substring(0, this.views[1].widthPercentage.length - 1));
    this.resizerState.combinePercentage = this.resizerState.previousLeftWidth + this.resizerState.previousRightWidth;

    e.preventDefault();

    this.onMouseMoveSubs();
    this.onMouseUpSubs();
  }

  private onMouseMoveSubs() {
    this.mouseMove$
      .pipe(takeWhile(() => this.resizerState.isResizing))
      .subscribe(event => {
        this.moveAxis(event.pageX, event.pageY);
      });
  }

  private moveAxis(axisX: number, axisY: number) {
    this.moveOnAxisX(axisX - this.resizerState.xDiff);
  }

  private moveOnAxisX(xCoordinate: number) {
    let px_totalContent: number = window.innerWidth - 48;
    let px_resize = px_totalContent * (this.resizerState.combinePercentage / 100);

    let px_leftWidth = px_resize * (this.resizerState.previousLeftWidth / 100);
    let px_rightWidth = px_resize * (this.resizerState.previousRightWidth / 100);

    let px_newLeftWidth: number = px_leftWidth;
    let px_newRightWidth: number = px_rightWidth;

    px_newLeftWidth += xCoordinate;
    px_newLeftWidth = Math.min(px_resize - this.px_minResizer, px_newLeftWidth);
    if (this.px_minResizer > px_newLeftWidth) px_newLeftWidth = this.px_minResizer;
    let percentage_newLeftWidth = (px_newLeftWidth * 100) / px_resize;

    px_newRightWidth -= xCoordinate;
    px_newRightWidth = Math.min(px_resize - this.px_minResizer, px_newRightWidth);
    if (this.px_minResizer > px_newRightWidth) px_newRightWidth = this.px_minResizer;
    let percentage_newRightWidth = (px_newRightWidth * 100) / px_resize;

    this.views[0].changeWidth(percentage_newLeftWidth);
    this.views[1].changeWidth(percentage_newRightWidth);
  }

  private onMouseUpSubs() {
    this.mouseUp$
      .pipe(take(1))
      .subscribe(e => {
        this.resizerState.isResizing = false;
      });

  }

}

interface ResizerElementState {
  isResizing: boolean;
  combinePercentage: number;
  previousLeftWidth: number;
  previousRightWidth: number;
  xDiff: number,
  yDiff: number,
}