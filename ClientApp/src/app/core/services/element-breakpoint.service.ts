import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ElementBreakpointService {
  private px_size: IElementSize = { x: 0, y: 0 };
  public mode$: BehaviorSubject<ElementBreakpoint> = new BehaviorSubject<ElementBreakpoint>(ElementBreakpoint.none);

  constructor(private host: ElementRef) {
    const observer = new ResizeObserver(entries => {
      this.px_size.x = entries[0].contentRect.width;
      this.px_size.y = entries[0].contentRect.height;

      let mode = ElementBreakpoint.none
      if (this.px_size.x <= 768) mode = ElementBreakpoint.mobile;
      else if (this.px_size.x <= 1024) mode = ElementBreakpoint.desktopSmall;
      else mode = ElementBreakpoint.desktopLarge;

      this.mode$.next(mode);
    });

    observer.observe(this.host.nativeElement);
  }
}

export enum ElementBreakpoint {
  none = 'none',
  desktopLarge = 'desktopLarge',
  desktopSmall = 'desktopSmall',
  mobile = 'mobile'
}

interface IElementSize {
  x: number;
  y: number;
}
