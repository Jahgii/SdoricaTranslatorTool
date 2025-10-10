import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TuiLanguageName } from '@taiga-ui/i18n';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  protected readonly lStorage = inject(LocalStorageService);
  protected readonly translate = inject(TranslateService);

  constructor() {
    let lang = this.lStorage.getAppLang();

    if (lang) this.setLang(lang);
    else this.setLang('english');
  }

  public setLang(lang: TuiLanguageName): void {
    this.lStorage.setAppLang(lang);
    this.translate.use(lang);

  }
}