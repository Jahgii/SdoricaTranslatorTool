import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ApiService } from './api.service';
import { ILanguage } from '../interfaces/i-dialog-group';
import { LanguageType } from '../interfaces/i-dialog-asset';

@Injectable({
  providedIn: 'root'
})
export class LanguageOriginService {
  public ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public language$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public languages!: string[];
  public language: FormControl = new FormControl(undefined);
  public localizationLang: string = '';

  constructor(
    private api: ApiService,
    private local: LocalStorageService
  ) { }

  public async onRetriveLanguages() {
    return await firstValueFrom(this.api.get<ILanguage[]>('languages'))
      .then(r => {
        if (r.length == 0) {
          this.ready$.next(true);
          return false;
        }

        this.languages = r.map(e => e.Name);

        let defaultLang = this.local.getDefaultLang();
        let lang = r.find(e => e.Name == defaultLang);

        if (!lang) {
          lang = r[0];
          this.local.setDefaultLang(lang.Name);
        }

        this.language.valueChanges.subscribe(lang => {
          this.local.setDefaultLang(lang);
          const languageIndex = Object.keys(LanguageType).indexOf(this.language.value);
          this.localizationLang = Object.values(LanguageType)[languageIndex];
          this.language$.next(lang);
        });

        this.language.patchValue(lang.Name);
        this.ready$.next(true);

        return true;
      });
  }
}
