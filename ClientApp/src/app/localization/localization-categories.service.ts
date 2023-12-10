import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { StoreService } from 'src/app/core/services/store.service';

@Injectable({
  providedIn: 'root'
})
export class LocalizationCategoriesService extends StoreService<ILocalizationCategory> {

  constructor(
    private api: ApiService,
    readonly languageOrigin: LanguageOriginService,
  ) {
    super();
    this.init();
  }

  private init() {
    this.languageOrigin.language$
      .subscribe((lang: string) => {
        let categories$: Observable<ILocalizationCategory[]> = this.api
          .get<ILocalizationCategory[]>('localizationcategories')
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

    if (index === 0) {
      let keyCategoryIndex = this.getData().findIndex(e => e.Name === key.Category);
      let keyCategory = this.getData()[keyCategoryIndex];
      if (keyCategory)
        keyCategory.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;

      category.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;

      this.update(keyCategory, keyCategoryIndex);
      this.update(category, index);
    }
    else {
      let categorySearch = this.getData()[0];

      category.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;
      categorySearch.KeysTranslated[this.languageOrigin.localizationLang] += addOrSubs;

      this.update(category, index);
      this.update(categorySearch, 0);
    }
  }

  public addCategoryKeys(key: ILocalizationKey) {
    let searchCategory = this.getData()[0];

    let index = this.getData().findIndex(e => e.Name === key.Category);
    let category = this.getData()[index];

    Object.keys(category.Keys).forEach(k => {
      category.Keys[k] += 1;
    });

    Object.keys(searchCategory.Keys).forEach(k => {
      searchCategory.Keys[k] += 1;
    });


    this.update(category, index);
    this.update(searchCategory, 0);
  }
}
