import { inject, Injectable } from '@angular/core';
import { TUI_DARK_MODE, TUI_DARK_MODE_KEY } from '@taiga-ui/core';
import { WA_LOCAL_STORAGE, WA_WINDOW } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly key = inject(TUI_DARK_MODE_KEY);
  private readonly storage = inject(WA_LOCAL_STORAGE);
  private readonly media = inject(WA_WINDOW).matchMedia('(prefers-color-scheme: light)');
  public readonly darkMode = inject(TUI_DARK_MODE);

  constructor() { }

  public switchTheme(event: MouseEvent): void {
    if (event.isTrusted)
      this.darkMode.set(!this.darkMode())
  }
}
