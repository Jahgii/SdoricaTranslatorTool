import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { IndexDBService } from '../core/services/index-db.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ObjectStoreNames } from '../core/interfaces/i-indexed-db';
import { IAppText } from '../core/interfaces/i-i18n';
import { TranslationObject } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UserLanguageService {
  private readonly http = inject(HttpClient);
  protected readonly indexedDB = inject(IndexDBService);

  public readonly languages: WritableSignal<IAppText[]> = signal([]);
  public keys: string[] = [];

  constructor() {
    this.loadLanguages();
  }

  public async createNew(name: string) {
    const defaultLang = this.http.get<TranslationObject>(`/assets/i18n/english.json`);
    const lang = await firstValueFrom(defaultLang);

    let langDB: IAppText = {
      Language: name,
      Custom: 1,
      Content: lang,
    };
    await firstValueFrom(this.indexedDB.post<IAppText>(ObjectStoreNames.AppLanguages, langDB, 'Id').success$);
  }

  private async loadLanguages() {
    this.languages.set(await firstValueFrom(this.indexedDB.getAll<IAppText[]>(ObjectStoreNames.AppLanguages).success$));

    if (this.languages.length === 0) return;
    this.keys = Object.keys(this.languages().find(e => e.Custom === 0)?.Content).filter(key => !key.startsWith('_'));
  }
}
