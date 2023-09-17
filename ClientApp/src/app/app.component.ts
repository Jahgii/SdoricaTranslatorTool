import { Component } from '@angular/core';
import { LanguageOriginService } from './core/services/language-origin.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  title = 'app';

  constructor(
    public languageOrigin: LanguageOriginService
  ) {
    this.languageOrigin.onRetriveLanguages();
  }
}
