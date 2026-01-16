import { HttpClient } from "@angular/common/http";
import { IndexDBService } from "./services/index-db.service";
import { TranslateLoader, TranslationObject } from "@ngx-translate/core";
import { firstValueFrom, from, Observable, switchMap, takeWhile } from "rxjs";
import { Indexes, ObjectStoreNames } from "./interfaces/i-indexed-db";
import { IAppText } from "./interfaces/i-i18n";

export class IndexDBi18nLoader implements TranslateLoader {
    constructor(private readonly http: HttpClient, private readonly indexedDB: IndexDBService) { }

    getTranslation(lang: string): Observable<TranslationObject> {
        return this.indexedDB.dbLoaded$.pipe(
            takeWhile(e => !e, true),
            switchMap(_ => this.onLoadFromIndexDB(_, lang))
        );
    }

    onLoadFromIndexDB(_: boolean, lang: string) {
        if (!_) return "";

        let request$ = this.indexedDB.getIndex<IAppText, ObjectStoreNames.AppLanguages>(
            ObjectStoreNames.AppLanguages,
            Indexes.AppLanguages.Language,
            lang,
            true
        ).success$;

        return request$.pipe(
            switchMap(i18n => {
                if (i18n?.Content) {
                    this.onCheckVersion(lang, i18n);
                    return from(Promise.resolve(i18n.Content));
                }

                return this.onLoadFallback(lang);
            })
        );
    }

    onLoadFallback(lang: string) {
        return this.http.get<TranslationObject>(`/assets/i18n/${lang}.json`).pipe(
            switchMap(async i18n => {
                let langDB: IAppText = {
                    Language: lang,
                    Custom: 0,
                    Content: i18n,
                    Taiga: null
                };
                firstValueFrom(this.indexedDB.post<IAppText>(ObjectStoreNames.AppLanguages, langDB, 'Id').success$);
                return i18n;
            })
        );
    }

    onCheckVersion(lang: string, jsonOnDB: IAppText) {
        if (jsonOnDB.Custom) lang = 'english';

        let request = this.http.get<TranslationObject>(`/assets/i18n/${lang}.json`).pipe(
            switchMap(async i18n => {
                if (!this.compareVersions((i18n._version as any) ?? "0.0.0", jsonOnDB.Content._version ?? "0.0.0")) return;

                if (jsonOnDB.Custom) this.updateCustomLang(jsonOnDB, i18n);
                else jsonOnDB.Content = i18n;
                firstValueFrom(this.indexedDB.put<IAppText>(ObjectStoreNames.AppLanguages, jsonOnDB).success$);
            })
        );

        firstValueFrom(request);
    }

    compareVersions(_v1: string, _v2: string) {
        const v1 = _v1.split('.').map(Number);
        const v2 = _v2.split('.').map(Number);

        if (v1[0] > v2[0]) return true;
        if (v1[1] > v2[1]) return true;
        if (v1[2] > v2[2]) return true;

        return false;
    }

    updateCustomLang(oldLang: IAppText, updateLang: any) {
        for (const key in updateLang) oldLang.Content[key] ??= updateLang[key];
    }
}