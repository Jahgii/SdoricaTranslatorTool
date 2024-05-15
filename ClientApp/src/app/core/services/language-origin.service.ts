import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ApiService } from './api.service';
import { ILanguage } from '../interfaces/i-dialog-group';
import { LanguageType } from '../interfaces/i-dialog-asset';
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
    private api: ApiService,
    private indexedDB: IndexDBService,
    private local: LocalStorageService
  ) { }

  public async onRetriveLanguages() {
    let langs: ILanguage[] = [];

    if (this.local.getAppMode() === AppModes.Offline) {
      let r = await this.indexedDB.getAll<ILanguage[]>(ObjectStoreNames.Languages);
      langs = await firstValueFrom(r.success$);
    }
    else if (this.local.getAppMode() === AppModes.Online)
      langs = await firstValueFrom(this.api.get<ILanguage[]>('languages'));


    if (langs.length == 0) {
      this.ready$.next(true);
      return false;
    }

    console.log(langs);

    this.languages = langs.map(e => e.Name);

    let defaultLang = this.local.getDefaultLang();
    let lang = langs.find(e => e.Name == defaultLang);

    if (!lang) {
      lang = langs[0];
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
  }
}
