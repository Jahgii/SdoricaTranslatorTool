import { Component } from '@angular/core';
import { LanguageOriginService } from './core/services/language-origin.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  title = 'app';

  constructor(
    public languageOrigin: LanguageOriginService,
    public authService: AuthService,
    public theme: ThemeService
  ) {
    // this.languageOrigin.onRetriveLanguages();
  }
}
