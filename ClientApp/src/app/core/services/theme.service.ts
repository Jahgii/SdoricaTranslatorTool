import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public nightMode$ = new BehaviorSubject<boolean>(false);
  public changeMode$ = new BehaviorSubject<boolean>(true);

  constructor(
    private localStorage: LocalStorageService
  ) {
    this.loadTheme();
  }

  private loadTheme() {
    let theme = this.localStorage.getTheme();

    switch (theme) {
      case 'light':
        this.nightMode$.next(false);
        break;
      case 'dark':
        this.nightMode$.next(true);
        break;
    }
  }

  public switchTheme(event: MouseEvent): void {
    if (event.isTrusted === false) return;

    this.changeMode$.next(false);
    this.localStorage.setTheme(this.nightMode$.value ? 'light' : 'dark');
    this.nightMode$.next(!this.nightMode$.value);
    setTimeout(() => {
      this.changeMode$.next(true);
    });
  }
}
