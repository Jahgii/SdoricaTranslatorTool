import { Directive, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, fromEvent, take, takeWhile } from 'rxjs';

@Directive({
  selector: '[appDraggableElement]',
  standalone: true
})
export class DraggableElementDirective {
  @Input() elementRef!: HTMLElement;
  @Input() elementAnchorRef!: HTMLElement;
  @Input() draggableElementState: DraggableElementState = {
    isDragging: false,
    xDiff: 0,
    yDiff: 0,
    x: 0,
    y: 0,
    yTopMargin: 0,
    yBottomMargin: 0
  };

  public mouseMove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mousemove", { passive: false });
  private readonly touchMove$: Observable<TouchEvent> = fromEvent<TouchEvent>(document, "touchmove", { passive: false });
  public mouseUp$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mouseup", { passive: false });
  private readonly touchUp$: Observable<TouchEvent> = fromEvent<TouchEvent>(document, "touchend", { passive: false });
  public margin: number = 5;
  public boundings!: DOMRect;

  constructor() { }

  ngAfterViewInit(): void {
    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    if (this.draggableElementState.xDiff === 0 && this.draggableElementState.yDiff === 0)
      this.moveAxis(this.draggableElementState.x, this.draggableElementState.y);
    this.renderWindow();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    this.draggableElementState.xDiff = 0;
    this.draggableElementState.yDiff = 0;
    this.moveAxis(this.draggableElementState.x, this.draggableElementState.y);
    this.renderWindow();
  }

  //#region Mouse Events
  @HostListener('mousedown', ['$event']) onMouseDown(e: MouseEvent) {
    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    this.draggableElementState.isDragging = true;
    this.draggableElementState.xDiff = e.pageX - this.draggableElementState.x;
    this.draggableElementState.yDiff = e.pageY - this.draggableElementState.y;

    e.preventDefault();

    this.onMouseMoveSubs();
    this.onMouseUpSubs();
  }

  private onMouseMoveSubs() {
    this.mouseMove$
      .pipe(takeWhile(() => this.draggableElementState.isDragging))
      .subscribe(event => {
        this.moveAxis(event.pageX, event.pageY);
        this.renderWindow();
      });


  }

  private onMouseUpSubs() {
    this.mouseUp$
      .pipe(take(1))
      .subscribe(e => {
        this.draggableElementState.isDragging = false;
      });

  }
  //#endregion 

  //#region Touch Events
  @HostListener('touchstart', ['$event']) onTouchStart(e: TouchEvent) {
    let pageX = e.changedTouches[0].pageX;
    let pageY = e.changedTouches[0].pageY;

    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    this.draggableElementState.isDragging = true;
    this.draggableElementState.xDiff = pageX - this.draggableElementState.x;
    this.draggableElementState.yDiff = pageY - this.draggableElementState.y;

    e.preventDefault();

    this.onTouchMoveSubs();
    this.onTouchUpSubs();
  }

  private onTouchMoveSubs() {
    this.touchMove$
      .pipe(takeWhile(() => this.draggableElementState.isDragging))
      .subscribe(event => {
        event.preventDefault();
        this.moveAxis(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        this.renderWindow();
      });
  }

  private onTouchUpSubs() {
    this.touchUp$
      .pipe(take(1))
      .subscribe(e => {
        e.preventDefault();
        this.draggableElementState.isDragging = false;
      });

  }
  //#endregion

  private moveAxis(axisX: number, axisY: number) {
    this.draggableElementState.x = this.moveOnAxisX(axisX - this.draggableElementState.xDiff);
    this.draggableElementState.y = this.moveOnAxisY(axisY - this.draggableElementState.yDiff);
  }

  private moveOnAxisX(xCoordinate: number) {
    let elementWidth = this.elementRef.offsetWidth;
    let leftLimit = window.innerWidth - elementWidth - this.margin - this.boundings.left;
    let rightLimit = Math.max(this.margin - this.boundings.right, xCoordinate);
    return Math.min(rightLimit, leftLimit);
  }

  private moveOnAxisY(yCoordinate: number) {
    let elementHeight = this.elementRef.offsetHeight;
    let bottomLimit = window.innerHeight - elementHeight - this.draggableElementState.yBottomMargin - this.boundings.bottom;
    let topLimit = Math.max(this.draggableElementState.yTopMargin - this.boundings.top, yCoordinate);
    return Math.min(topLimit, bottomLimit);
  }

  private renderWindow() {
    this.elementRef.style.transform =
      'translate(' + this.draggableElementState.x + 'px, ' + this.draggableElementState.y + 'px)';
  }

}

interface DraggableElementState {
  isDragging: boolean,
  xDiff: number,
  yDiff: number,
  yTopMargin: number,
  yBottomMargin: number,
  x: number,
  y: number
}