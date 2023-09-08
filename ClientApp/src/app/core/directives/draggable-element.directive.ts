import { Directive, HostListener, Input } from '@angular/core';
import { Observable, fromEvent, take, takeWhile } from 'rxjs';

@Directive({
  selector: '[appDraggableElement]'
})
export class DraggableElementDirective {
  @Input() elementRef!: HTMLElement;
  @Input() draggableElementState: DraggableElementState = {
    isDragging: false,
    xDiff: 0,
    yDiff: 0,
    x: 0,
    y: 0,
    xLLimits: 0,
    xRLimits: 0,
    yTLimits: 0,
    yBLimits: 0
  };

  public mouseMove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mousemove");
  public mouseUp$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mouseup");
  public margin: number = 5;

  constructor() { }

  ngAfterViewInit(): void {
    this.renderWindow();
  }

  @HostListener('mousedown', ['$event']) onMouseDown(e: MouseEvent) {
    this.draggableElementState.isDragging = true;
    this.draggableElementState.xDiff = e.pageX - this.draggableElementState.x;
    this.draggableElementState.yDiff = e.pageY - this.draggableElementState.y;

    e.preventDefault();

    this.onMouseMoveSubs();
    this.onMouseUpSubs();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.moveAxis(this.draggableElementState.x, this.draggableElementState.y);
    this.renderWindow();
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

  private moveAxis(axisX: number, axisY: number) {
    this.draggableElementState.x = this.moveOnAxisX(axisX - this.draggableElementState.xDiff);
    this.draggableElementState.y = this.moveOnAxisY(axisY - this.draggableElementState.yDiff);
  }

  private moveOnAxisX(xCoordinate: number) {
    let elementWidth = this.elementRef.offsetWidth + this.margin;
    let limit = window.innerWidth - elementWidth - this.draggableElementState.xRLimits;
    return Math.min(Math.max(xCoordinate, this.margin - this.draggableElementState.xLLimits), limit);
  }

  private moveOnAxisY(yCoordinate: number) {
    let elementHeight = this.elementRef.offsetHeight + this.margin;
    return Math.min(Math.max(yCoordinate, this.margin - this.draggableElementState.yTLimits), window.innerHeight - elementHeight - this.draggableElementState.yBLimits);
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
  xLLimits: number,
  xRLimits: number,
  yTLimits: number,
  yBLimits: number,
  x: number,
  y: number
}