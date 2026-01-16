import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranslateService, TranslationObject } from '@ngx-translate/core';
import { TUI_ENGLISH_LANGUAGE, TuiLanguageName, TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { LocalStorageService } from './local-storage.service';
import { HttpClient } from '@angular/common/http';
import { IndexDBService } from './index-db.service';
import { firstValueFrom, of, shareReplay, takeWhile } from 'rxjs';
import { Indexes, ObjectStoreNames } from '../interfaces/i-indexed-db';
import { IAppText } from '../interfaces/i-i18n';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  protected readonly tuiLangSwitcher = inject(TuiLanguageSwitcherService);
  protected readonly lStorage = inject(LocalStorageService);
  protected readonly translate = inject(TranslateService);
  private readonly http = inject(HttpClient);
  protected readonly indexedDB = inject(IndexDBService);

  public readonly names: WritableSignal<string[]> = signal([
    'english',
    'spanish'
  ]);

  public readonly customNames: WritableSignal<string[]> = signal([]);

  public readonly language = new FormControl(capitalize(this.tuiLangSwitcher.language));
  public readonly languages: WritableSignal<IAppText[]> = signal([]);
  public keys: string[] = [];

  public initialize() {
    let lang = this.lStorage.getAppLang();
    let custom = this.lStorage.getAppLangCustom();

    if (lang && custom === "0") this.setLang(lang);
    else this.setLang('english');

    this.indexedDB.dbLoaded$.pipe(
      shareReplay(),
      takeWhile(e => !e, true),
    ).subscribe(_ => {
      if (!_) return;

      if (lang && custom === "1") this.setCustomLang(lang);
      this.loadLanguages();
    })
  }

  public setLang(lang: TuiLanguageName): void {
    //App
    this.lStorage.setAppLang(lang);
    this.lStorage.setAppLangCustom(false);
    this.translate.use(lang);

    //Taiga
    this.tuiLangSwitcher.setLanguage(lang);
  }

  public setCustomLang(lang: TuiLanguageName): void {
    //App
    this.lStorage.setAppLang(lang);
    this.lStorage.setAppLangCustom(true);
    this.translate.use(lang);

    //Taiga
    let request = this.indexedDB.getIndex<IAppText, ObjectStoreNames.AppLanguages>(
      ObjectStoreNames.AppLanguages,
      Indexes.AppLanguages.Language,
      lang,
      true
    ).success$;

    firstValueFrom(request).then(customLang => {
      this.tuiLangSwitcher.setLanguage(lang);
      if (customLang?.Taiga) this.tuiLangSwitcher.next(of(customLang.Taiga));
      else this.tuiLangSwitcher.next(of(TUI_ENGLISH_LANGUAGE));
    });
  }

  public async createNew(name: string) {
    const defaultLang = this.http.get<TranslationObject>(`/assets/i18n/english.json`);
    const lang = await firstValueFrom(defaultLang);

    let langDB: IAppText = {
      Language: name,
      Custom: 1,
      Content: lang,
      Taiga: TUI_ENGLISH_LANGUAGE
    };

    await firstValueFrom(this.indexedDB.post<IAppText>(ObjectStoreNames.AppLanguages, langDB, 'Id').success$);

    this.customNames.set([...this.customNames(), name]);
  }

  public async saveChanges() {
    for (const l of this.languages().filter(_l => _l.Custom === 1)) {
      firstValueFrom(this.indexedDB.put<IAppText>(ObjectStoreNames.AppLanguages, l).success$);
    }
  }

  private async loadLanguages() {
    this.languages.set(await firstValueFrom(this.indexedDB.getAll<IAppText[]>(ObjectStoreNames.AppLanguages).success$));

    if (this.languages().length === 0) return;
    this.keys = Object.keys(this.languages().find(e => e.Custom === 0)?.Content).filter(key => !key.startsWith('_'));
  }
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}