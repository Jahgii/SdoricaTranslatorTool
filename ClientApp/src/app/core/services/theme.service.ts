import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public nightMode$ = new BehaviorSubject<boolean>(false);
  public changeMode$ = new BehaviorSubject<boolean>(true);

  constructor() { }

  public switchTheme(): void {
    this.changeMode$.next(false);
    this.nightMode$.next(!this.nightMode$.value);
    setTimeout(() => {
      this.changeMode$.next(true);
    });
  }
}
