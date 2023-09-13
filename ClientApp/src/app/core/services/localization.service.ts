import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from '../interfaces/i-localizations';
import { LanguageOriginService } from './language-origin.service';
import { LibreTranslateService } from './libre-translate.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Injectable()
export class LocalizationService implements OnDestroy {
  public categories$: Observable<ILocalizationCategory[]> = this.api.get<ILocalizationCategory[]>('localizationcategories')
    .pipe(map(r => {
      let searchCategory: ILocalizationCategory = {
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

  //#region Table Filters
  readonly filterForm = new FormGroup({
    original: new FormControl(undefined),
    translation: new FormControl(undefined),
    translated: new FormControl(false)
  });

  readonly filterOriginalColumn = (item: { [language: string]: string }, value: string): boolean => {
    if (!value) value = "";
    return item[this.languageOrigin.localizationLang].toLowerCase().includes(value?.toLowerCase());
  };

  readonly filterTranslationColumn = (item: { [language: string]: string }, value: string): boolean => {
    if (!value) value = "";
    return item[this.languageOrigin.localizationLang].toLowerCase().includes(value?.toLowerCase());
  };

  readonly filterTranslatedColumn = (item: { [language: string]: boolean }, value: boolean): boolean => {
    return item[this.languageOrigin.localizationLang] === value;
  };
  //#endregion

  public keys$!: Observable<ILocalizationKey[]>;
  public keys: ILocalizationKey[] | undefined;
  public searchCategory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public alreadySearch$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public selectedCategory!: ILocalizationCategory;
  public propagateTranslation: boolean = true;
  public language: string = '';
  public focusRow: number = -1;
  public searchTotalTranslated = 0;

  public search: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  public searchKey: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  public searchTranslation: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  private subsSearch!: Subscription;
  private subsSearchKey!: Subscription;
  private subsSearchTranslation!: Subscription;

  constructor(
    private api: ApiService,
    private languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService
  ) {
    this.language = this.languageOrigin.localizationLang;
    this.autoSearch();
  }

  ngOnDestroy(): void {
    this.subsSearch.unsubscribe();
    this.subsSearchKey.unsubscribe();
    this.subsSearchTranslation.unsubscribe();
  }

  public async onSelectCategory(category: ILocalizationCategory) {
    // if (this.selectedCategory.Name === category.Name) return;

    this.keys = undefined;

    this.filterForm.reset();
    this.filterForm.patchValue({
      translated: false
    });
    this.keys$ = this.api.getWithHeaders('localizationkeys', { category: category.Name });

    if (category.Name == 'SEARCH') {
      this.keys = undefined;
      this.searchCategory$.next(true);
    }
    else {
      this.searchCategory$.next(false);
      this.alreadySearch$.next(false);
      this.loading$.next(true)
      await firstValueFrom(this.keys$).then(r => this.keys = r, e => undefined);
      this.loading$.next(false);
    }
  }

  public async onTranslatedCheck(check: boolean, keys: ILocalizationKey[], key: ILocalizationKey) {
    if (check) this.selectedCategory.KeysTranslated[this.languageOrigin.localizationLang] += 1;
    else this.selectedCategory.KeysTranslated[this.languageOrigin.localizationLang] -= 1;

    await this.onKeyTranslated(key);

    if (!this.propagateTranslation) return;

    let propagateKeys = this.getPropagateKeys(keys, key);

    for (let index = 0; index < propagateKeys.length; index++) {
      let keyToPropagate = propagateKeys[index];
      if (keyToPropagate.Translated[this.languageOrigin.localizationLang] === check) return;
      if (check) this.selectedCategory.KeysTranslated[this.languageOrigin.localizationLang] += 1;
      else this.selectedCategory.KeysTranslated[this.languageOrigin.localizationLang] -= 1;
      keyToPropagate.Translated[this.languageOrigin.localizationLang] = check;
      await this.onKeyTranslated(keyToPropagate);
    }
  }

  public onTranslationChange(translation: string, keys: ILocalizationKey[], key: ILocalizationKey) {
    if (!this.propagateTranslation) return;

    this.getPropagateKeys(keys, key).forEach(key => {
      key.Translations[this.languageOrigin.localizationLang] = translation;
    });
  }

  private getPropagateKeys(keys: ILocalizationKey[], key: ILocalizationKey) {
    var keysToPropagate = keys.filter(e => e.Original[this.languageOrigin.localizationLang] === key.Original[this.languageOrigin.localizationLang]);
    var keyIndex = keysToPropagate.findIndex(e => e === key);
    keysToPropagate.splice(keyIndex, 1);

    return keysToPropagate;
  }

  public async onKeyTranslated(key: ILocalizationKey) {
    await firstValueFrom(this.api.putWithHeaders('localizationkeys', { language: this.language }, key))
      .then(
        r => {

        },
        error => {
        }
      );
  }

  public refreshAll() {
    this.categories$ = this.api.get<ILocalizationCategory[]>('localizationcategories')
      .pipe(map(r => {
        let searchCategory: ILocalizationCategory = {
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

    if (this.selectedCategory?.Name == 'SEARCH') return;
    this.keys$ = this.api.getWithHeaders('localizationkeys', { category: this.selectedCategory.Name });
  }

  public onMachineTranslate() {
    if (this.keys)
      this.libreTranslate.onTranslateKeys(this.keys, this.languageOrigin.localizationLang);
  }

  //#region Search
  private autoSearch() {
    this.subsSearch = this.search.valueChanges
      .pipe(
        debounceTime(1000)
      )
      .subscribe(v => {
        this.onSearch();
      });
    this.subsSearchKey = this.searchKey.valueChanges
      .pipe(
        debounceTime(1000)
      )
      .subscribe(v => {
        this.onSearchKey();
      });
    this.subsSearchTranslation = this.searchTranslation.valueChanges
      .pipe(
        debounceTime(1000)
      )
      .subscribe(v => {
        this.onSearchTranslation();
      });
  }

  public async onSearch() {
    this.alreadySearch$.next(true);
    this.keys$ = this.api
      .getWithHeaders('localizationkeys/search',
        {
          language: this.languageOrigin.localizationLang,
          text: this.search.value
        });
    this.loading$.next(true);
    await firstValueFrom(this.keys$)
      .then(
        r => {
          this.searchTotalTranslated = 0;
          this.searchTotalTranslated = r.reduce((ac, v) => {
            if (v.Translated[this.languageOrigin.localizationLang])
              return ac + 1;
            return ac;
          }, 0);
          this.keys = r;
        },
        e => undefined);
    this.loading$.next(false);
  }

  public async onSearchKey() {
    this.alreadySearch$.next(true);
    this.keys$ = this.api
      .getWithHeaders('localizationkeys/searchkey',
        {
          key: this.searchKey.value
        });

    this.loading$.next(true);
    await firstValueFrom(this.keys$).then(
      r => {
        this.searchTotalTranslated = 0;
        this.searchTotalTranslated = r.reduce((ac, v) => {
          if (v.Translated[this.languageOrigin.localizationLang])
            return ac + 1;
          return ac;
        }, 0);
        this.keys = r;
      },
      e => undefined);
    this.loading$.next(false);
  }

  public async onSearchTranslation() {
    this.alreadySearch$.next(true);
    this.keys$ = this.api
      .getWithHeaders('localizationkeys/searchtranslation',
        {
          language: this.languageOrigin.localizationLang,
          text: this.searchTranslation.value
        });

    this.loading$.next(true);
    await firstValueFrom(this.keys$).then(
      r => {
        this.searchTotalTranslated = 0;
        this.searchTotalTranslated = r.reduce((ac, v) => {
          if (v.Translated[this.languageOrigin.localizationLang])
            return ac + 1;
          return ac;
        }, 0);
        this.keys = r;
      },
      e => undefined);
    this.loading$.next(false);
  }
  //#endregion
}
