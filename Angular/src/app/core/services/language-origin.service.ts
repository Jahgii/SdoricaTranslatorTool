import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ApiService } from './api.service';
import { ILanguage } from '../interfaces/i-dialog-group';
import { LanguageType } from '../enums/languages';
import { AppModes } from '../enums/app-modes';
import { IndexDBService } from './index-db.service';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';

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
    private readonly api: ApiService,
    private readonly indexedDB: IndexDBService,
    private readonly lStorage: LocalStorageService
  ) { }

  public async onRetriveLanguages() {
    let langs: ILanguage[] = [];

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getAll<ILanguage[]>(ObjectStoreNames.Languages);
      langs = await firstValueFrom(r.success$);
    }
    else if (this.lStorage.getAppMode() === AppModes.Online)
      langs = await firstValueFrom(this.api.get<ILanguage[]>('languages'))
        .then(r => r, error => []);


    if (langs.length == 0) {
      this.ready$.next(true);
      return false;
    }

    this.languages = langs.map(e => e.Name);

    let defaultLang = this.lStorage.getDefaultLang();
    let lang = langs.find(e => e.Name == defaultLang);

    if (!lang) {
      lang = langs[0];
      this.lStorage.setDefaultLang(lang.Name);
    }

    this.language.valueChanges.subscribe(lang => {
      this.lStorage.setDefaultLang(lang);
      const languageIndex = Object.keys(LanguageType).indexOf(this.language.value);
      this.localizationLang = Object.values(LanguageType)[languageIndex];
      this.language$.next(lang);
    });

    this.language.patchValue(lang.Name);
    this.ready$.next(true);

    return true;
  }
}
