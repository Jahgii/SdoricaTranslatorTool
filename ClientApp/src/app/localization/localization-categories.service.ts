import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { StoreService } from 'src/app/core/services/store.service';
import { LocalStorageService } from '../core/services/local-storage.service';
import { AppModes } from '../core/enums/app-modes';
import { ObjectStoreNames } from '../core/interfaces/i-indexed-db';
import { IndexDBService } from '../core/services/index-db.service';

@Injectable({
  providedIn: 'root'
})
export class LocalizationCategoriesService extends StoreService<ILocalizationCategory> {

  constructor(
    private api: ApiService,
    private indexedDB: IndexDBService,
    private lStorage: LocalStorageService,
    readonly languageOrigin: LanguageOriginService,
  ) {
    super();
    this.init();
  }

  private init() {
    this.languageOrigin
      .language$
      .subscribe(_ => {
        let categories$: Observable<ILocalizationCategory[]>;

        if (this.lStorage.getAppMode() === AppModes.Offline) {
          let r = this.indexedDB.getAll<ILocalizationCategory[]>(ObjectStoreNames.LocalizationCategory);
          categories$ = r.success$;
        }
        else if (this.lStorage.getAppMode() === AppModes.Online)
          categories$ = this.api
            .get<ILocalizationCategory[]>('localizationcategories');
        else {
          categories$ = of([]);
        }

        if (!categories$) categories$ = of([]);

        categories$ = categories$
          .pipe(map(r => {
            let searchCategory: ILocalizationCategory = {
              Id: 'SEARCH',
              Name: "SEARCH",
              Keys: {
                [this.languageOrigin.localizationLang]: r.reduce((ac, v) => {
                  return ac + v.Keys[this.languageOrigin.localizationLang];
                }, 0)
              },
              KeysTranslated: {
                [this.languageOrigin.localizationLang]: r.reduce((ac, v) => {
                  return ac + v.KeysTranslated[this.languageOrigin.localizationLang];
                }, 0)
              }
            }
            r.unshift(searchCategory);
            return r;
          }));

        this.initData(categories$);
      });
  }

  public updateCategoryKeys(category: ILocalizationCategory, index: number, translated: boolean, key: ILocalizationKey) {
    let addOrSubs = translated === true ? 1 : -1;
    let categories = this.getData();

    if (index === 0) {
      let keyCategoryIndex = categories.findIndex(e => e.Name === key.Category);
      let keyCategory = categories[keyCategoryIndex];
      if (keyCategory)
        keyCategory.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;

      category.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;

      this.update(keyCategory, keyCategoryIndex);
      this.update(category, index);
    }
    else {
      let categorySearch = categories[0];

      category.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;
      categorySearch.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;

      this.update(category, index);
      this.update(categorySearch, 0);
    }
  }

  public addCategoryKeys(key: ILocalizationKey) {
    let categories = this.getData();
    let searchCategory = categories[0];

    let index = categories.findIndex(e => e.Name === key.Category);
    let category = categories[index];

    for (const k of Object.keys(category.Keys))
      category.Keys[k] += 1;

    for (const k of Object.keys(searchCategory.Keys))
      searchCategory.Keys[k] += 1;

    this.update(category, index);
    this.update(searchCategory, 0);
  }
}
