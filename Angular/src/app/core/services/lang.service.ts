import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranslateService, TranslationObject } from '@ngx-translate/core';
import { TUI_ENGLISH_LANGUAGE, TuiLanguageName, TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { LocalStorageService } from './local-storage.service';
import { HttpClient } from '@angular/common/http';
import { IndexDBService } from './index-db.service';
import { firstValueFrom, of, shareReplay, takeWhile } from 'rxjs';
import { Indexes, ObjectStoreNames } from '../interfaces/i-indexed-db';
import { IAppLanguage } from '../interfaces/i-i18n';
import { FormControl } from '@angular/forms';
import { GeminiApiService } from './gemini-api.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private readonly http = inject(HttpClient);
  protected readonly tuiLangSwitcher = inject(TuiLanguageSwitcherService);
  protected readonly lStorage = inject(LocalStorageService);
  protected readonly translate = inject(TranslateService);
  protected readonly indexedDB = inject(IndexDBService);

  public readonly names: WritableSignal<string[]> = signal([
    'english',
    'spanish'
  ]);

  public readonly customNames: WritableSignal<string[]> = signal([]);
  public readonly savingChanges = signal(false);
  public readonly language = new FormControl(capitalize(this.tuiLangSwitcher.language));
  public readonly languages: WritableSignal<IAppLanguage[]> = signal([]);
  public keys: string[] = [];

  public initialize() {
    let lang = this.lStorage.getAppLang();
    let custom = this.lStorage.getAppLangCustom();

    if (lang && custom === "0") this.setLang(lang);
    else this.setLang('english');

    this.indexedDB.dbLoaded$.pipe(
      shareReplay(),
      takeWhile(e => !e, true),
    ).subscribe(async _ => {
      if (!_) return;

      if (lang && custom === "1") this.setCustomLang(lang);
      await this.createCustomLang();
      this.loadLanguages();
    })
  }

  private reInitialize() {
    let lang = this.lStorage.getAppLang();
    let custom = this.lStorage.getAppLangCustom();

    if (lang && custom === "1") {
      this.translate.reloadLang(lang);
      this.setCustomLang(lang);
    }
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
    let request = this.indexedDB.getIndex<IAppLanguage, ObjectStoreNames.AppLanguages>(
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

  public async saveChanges() {
    this.savingChanges.set(true);
    for (const l of this.languages().filter(_l => _l.Custom === 1)) {
      await firstValueFrom(this.indexedDB.put<IAppLanguage>(ObjectStoreNames.AppLanguages, l).success$);
    }
    this.reInitialize();
    this.savingChanges.set(false);
  }

  private async loadLanguages() {
    const langs = await firstValueFrom(this.indexedDB.getAll<IAppLanguage[]>(ObjectStoreNames.AppLanguages).success$);

    langs.sort((l1, l2) => l1.Custom - l2.Custom);
    this.languages.set(langs);

    if (this.languages().length === 0) return;
    this.keys = Object.keys(this.languages().find(e => e.Custom === 0)?.Content).filter(key => !key.startsWith('_'));
  }

  private async createCustomLang() {
    const langs = await firstValueFrom(this.indexedDB.getAll<IAppLanguage[]>(ObjectStoreNames.AppLanguages).success$);
    const cLang = langs.find(e => e.Custom === 1);
    if (cLang) return;
    await this.createNew("userlang");
  }

  private async createNew(name: string) {
    const defaultLang = this.http.get<TranslationObject>(`/assets/i18n/english.json`);
    const lang = await firstValueFrom(defaultLang);

    let langDB: IAppLanguage = {
      Language: name,
      Custom: 1,
      Content: lang,
      Taiga: TUI_ENGLISH_LANGUAGE
    };

    await firstValueFrom(this.indexedDB.post<IAppLanguage>(ObjectStoreNames.AppLanguages, langDB, 'Id').success$);

    this.customNames.set([...this.customNames(), name]);
  }
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}