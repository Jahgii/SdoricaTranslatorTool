import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, fromEvent, take, takeWhile } from 'rxjs';
import { ViewerComponent } from 'src/app/mainlayout/viewer/viewer.component';

@Directive({
  selector: '[appResizer]',
  standalone: true
})
export class ResizerDirective implements OnChanges {
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

  private mouseDown$!: Observable<MouseEvent>;
  private touchStart$!: Observable<TouchEvent>;
  private readonly mouseMove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mousemove", { passive: false });
  private readonly touchMove$: Observable<TouchEvent> = fromEvent<TouchEvent>(document, "touchmove", { passive: false });
  private readonly mouseUp$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mouseup", { passive: false });
  private readonly touchUp$: Observable<TouchEvent> = fromEvent<TouchEvent>(document, "touchend", { passive: false });
  private readonly px_minResizer = 64;

  private readonly elementContainer?: Element;
  private ghostElement?: HTMLElement;

  constructor() {
    this.elementContainer = document.getElementsByClassName("main-viewer")[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.elementRef) {
      this.mouseDown$ = fromEvent<MouseEvent>(this.elementRef, "mousedown", { passive: true });
      this.onMouseDownSubs();

      this.touchStart$ = fromEvent<TouchEvent>(this.elementRef, "touchstart", { passive: true });
      this.onTouchStartSubs();
    }
  }

  //#region Mouse Events
  private onMouseDown(e: MouseEvent) {
    let pageX = e.pageX;
    let pageY = e.pageY;

    if (this.views.length <= 1) return;
    this.resizerState.isResizing = true;
    this.resizerState.xDiff = pageX;
    this.resizerState.yDiff = pageY;

    this.resizerState.previousLeftWidth = Number(this.views[0].widthPercentage.substring(0, this.views[0].widthPercentage.length - 1));
    this.resizerState.previousRightWidth = Number(this.views[1].widthPercentage.substring(0, this.views[1].widthPercentage.length - 1));
    this.resizerState.combinePercentage = this.resizerState.previousLeftWidth + this.resizerState.previousRightWidth;

    this.addActiveClass();
    this.changeDocumentEvents('none');
    this.createGhostElement(e.pageX, e.pageY);
    this.onMouseMoveSubs();
    this.onMouseUpSubs();
  }

  private onMouseDownSubs() {
    this.mouseDown$
      .subscribe(event => {
        this.onMouseDown(event)
      });
  }

  private onMouseMoveSubs() {
    this.mouseMove$
      .pipe(takeWhile(() => this.resizerState.isResizing))
      .subscribe(event => {
        event.preventDefault();
        this.moveGhostAxis(event.pageX, event.pageY);
      });
  }

  private onMouseUpSubs() {
    this.mouseUp$
      .pipe(take(1))
      .subscribe(e => {
        e.preventDefault();
        this.resizerState.isResizing = false;
        this.removeActiveClass();
        this.ghostElement?.remove();
        this.ghostElement = undefined;
        this.changeDocumentEvents('');
        this.moveAxis(e.pageX, e.pageY);
      });

  }
  //#endregion

  //#region Touch Events
  private onTouchStart(e: TouchEvent) {
    let pageX = e.changedTouches[0].pageX;
    let pageY = e.changedTouches[0].pageY;

    if (this.views.length <= 1) return;
    this.resizerState.isResizing = true;
    this.resizerState.xDiff = pageX;
    this.resizerState.yDiff = pageY;

    this.resizerState.previousLeftWidth = Number(this.views[0].widthPercentage.substring(0, this.views[0].widthPercentage.length - 1));
    this.resizerState.previousRightWidth = Number(this.views[1].widthPercentage.substring(0, this.views[1].widthPercentage.length - 1));
    this.resizerState.combinePercentage = this.resizerState.previousLeftWidth + this.resizerState.previousRightWidth;

    this.addActiveClass();
    this.changeDocumentEvents('none');
    this.createGhostElement(pageX, pageY);
    this.onTouchMoveSubs();
    this.onTouchUpSubs();
  }

  private onTouchStartSubs() {
    this.touchStart$
      .subscribe(event => {
        this.onTouchStart(event);
      });
  }

  private onTouchMoveSubs() {
    this.touchMove$
      .pipe(takeWhile(() => this.resizerState.isResizing))
      .subscribe(event => {
        event.preventDefault();
        this.moveGhostAxis(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
      });
  }

  private onTouchUpSubs() {
    this.touchUp$
      .pipe(take(1))
      .subscribe(e => {
        e.preventDefault();
        this.resizerState.isResizing = false;
        this.removeActiveClass();
        this.ghostElement?.remove();
        this.ghostElement = undefined;
        this.changeDocumentEvents('');
        this.moveAxis(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
      });

  }
  //#endregion

  private moveGhostAxis(axisX: number, _: number) {
    let x = axisX;
    let y = 0;
    let rect = this.elementContainer?.getBoundingClientRect();

    if (rect) {
      x = Math.max(
        rect.left + this.px_minResizer,
        Math.min(x, rect.right - this.elementRef.offsetWidth - this.px_minResizer)
      );
      y = rect.top
    }


    this.ghostElement!.style.left = `${x}px`;
    this.ghostElement!.style.top = `${y}px`;
  }

  private moveAxis(axisX: number, _: number) {
    this.moveOnAxisX(axisX - this.resizerState.xDiff);
  }

  private moveOnAxisX(xCoordinate: number) {
    let px_totalContent: number = globalThis.innerWidth - 48;
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

  private addActiveClass() {
    this.elementRef.classList.add("resizer-line-active");
    document.documentElement?.classList.add("resizer-cursor");
  }

  private removeActiveClass() {
    this.elementRef.classList.remove("resizer-line-active");
    document.documentElement?.classList.remove("resizer-cursor");
  }

  private createGhostElement(axisX: number, _: number) {
    this.ghostElement = this.elementRef.cloneNode(true) as HTMLElement;
    this.ghostElement.style.position = "absolute";
    this.ghostElement.style.opacity = "1";
    this.ghostElement.style.pointerEvents = "none";
    this.ghostElement.style.zIndex = "1000";

    let rect = this.elementContainer?.getBoundingClientRect();
    if (rect) this.ghostElement.style.height = `${rect.height}px`;

    this.elementRef.parentElement?.appendChild(this.ghostElement);

    this.moveGhostAxis(axisX, _);
  }

  private changeDocumentEvents(change: "none" | "") {
    document.body.style.userSelect = change;
    document.body.style.pointerEvents = change;
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