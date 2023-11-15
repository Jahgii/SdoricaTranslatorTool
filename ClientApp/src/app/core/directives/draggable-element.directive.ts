import { Directive, HostListener, Input } from '@angular/core';
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

  public mouseMove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mousemove");
  public mouseUp$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mouseup");
  public margin: number = 5;
  public boundings!: DOMRect;

  constructor() { }

  ngAfterViewInit(): void {
    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    if (this.draggableElementState.xDiff === 0 && this.draggableElementState.yDiff === 0)
      this.moveAxis(this.draggableElementState.x, this.draggableElementState.y);
    this.renderWindow();
  }

  @HostListener('mousedown', ['$event']) onMouseDown(e: MouseEvent) {
    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    this.draggableElementState.isDragging = true;
    this.draggableElementState.xDiff = e.pageX - this.draggableElementState.x;
    this.draggableElementState.yDiff = e.pageY - this.draggableElementState.y;

    e.preventDefault();

    this.onMouseMoveSubs();
    this.onMouseUpSubs();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.boundings = this.elementAnchorRef.getBoundingClientRect();
    this.draggableElementState.xDiff = 0;
    this.draggableElementState.yDiff = 0;
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