import { Component } from '@angular/core';
import { LanguageOriginService } from './core/services/language-origin.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  title = 'app';

  constructor(
    public languageOrigin: LanguageOriginService,
    public authService: AuthService
  ) {
    this.languageOrigin.onRetriveLanguages();
  }
}
