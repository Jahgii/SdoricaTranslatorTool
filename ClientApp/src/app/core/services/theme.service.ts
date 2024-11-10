import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { TUI_DARK_MODE, TUI_DARK_MODE_KEY } from '@taiga-ui/core';
import { WA_LOCAL_STORAGE, WA_WINDOW } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public nightMode$ = new BehaviorSubject<boolean>(false);
  public changeMode$ = new BehaviorSubject<boolean>(true);

  private readonly key = inject(TUI_DARK_MODE_KEY);
  private readonly storage = inject(WA_LOCAL_STORAGE);
  private readonly media = inject(WA_WINDOW).matchMedia('(prefers-color-scheme: dark)');

  public readonly darkMode = inject(TUI_DARK_MODE);

  constructor(private readonly localStorage: LocalStorageService) {
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
