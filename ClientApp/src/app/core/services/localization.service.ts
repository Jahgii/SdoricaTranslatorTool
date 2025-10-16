import { Inject, Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom, of, takeWhile } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from '../interfaces/i-localizations';
import { LanguageOriginService } from './language-origin.service';
import { LibreTranslateService } from './libre-translate.service';
import { FormGroup, FormControl } from '@angular/forms';
import { TuiAlertService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalizationCategoriesService } from 'src/app/localization/localization-categories.service';
import { LocalStorageService } from './local-storage.service';
import { AppModes } from '../enums/app-modes';
import { IndexDBService } from './index-db.service';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';

@Injectable()
export class LocalizationService implements OnDestroy {
  viewIndex: number = -1;
  public categories$!: Observable<ILocalizationCategory[]>;

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
    if (value === null) return true;
    return item[this.languageOrigin.localizationLang] === value;
  };

  //#endregion

  public keys$!: Observable<ILocalizationKey[]>;
  public keys: ILocalizationKey[] | undefined;
  public saving$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public searchCategory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public alreadySearch$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public selectedCategory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingCategories$: Observable<boolean> = this.lCS.loadingStore$;
  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public selectedCategory!: ILocalizationCategory;
  public selectedCategoryIndex!: number;
  public propagateTranslation: boolean = true;
  public language: string = '';
  public focusRow: string = '';
  public searchTotalTranslated = 0;
  public controlCheckbox = 1;
  private autoLoadCategoryId: string | undefined = undefined;

  public search: FormControl = new FormControl('');
  public searchKey: FormControl = new FormControl('');
  public searchTranslation: FormControl = new FormControl('');
  private lastSearch!: () => Promise<void>;
  private subsSearch!: Subscription;
  private subsSearchKey!: Subscription;
  private subsSearchTranslation!: Subscription;
  private subsTranslatedColumn$!: Subscription;

  constructor(
    private readonly api: ApiService,
    private readonly indexedDB: IndexDBService,
    private readonly lStorage: LocalStorageService,
    private readonly lCS: LocalizationCategoriesService,
    private readonly languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService,
    private readonly translate: TranslateService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.language = this.languageOrigin.localizationLang;
    this.languageOrigin
      .language
      .valueChanges
      .subscribe(_ => {
        this.language = this.languageOrigin.localizationLang;

        let r = this.lCS.getData();
        let searchCategory = r[0];

        if (r.length === 0) return;

        searchCategory.Keys[this.language] =
          r.reduce((ac, v, i) => {
            if (i === 0) return 0;
            return ac + (v.Keys[this.language] ?? 0);
          }, 0);

        searchCategory.KeysTranslated[this.language] =
          r.reduce((ac, v, i) => {
            if (i === 0) return 0;
            return ac + (v.KeysTranslated[this.language] ?? 0);
          }, 0);

        if (!this.selectedCategory) return;
        this.selectedCategoryIndex = r.findIndex(c => c.Name === this.selectedCategory.Name);
        this.selectedCategory = r[this.selectedCategoryIndex];
        if (this.alreadySearch$.value && this.lastSearch != null) this.lastSearch();
      });

    this.autoSearch();
    this.onTranslatedColumnCheckboxChange();
    // this.onLoadLastSearch();
  }

  public loadStore() {
    if (!this.categories$)
      this.lCS
        .loadingStore$
        .pipe(takeWhile(_ => !this.categories$))
        .subscribe(_ => {
          this.categories$ = this.lCS.store$;
          this.initLastCategorySelected();
        });
  }

  private initLastCategorySelected() {
    if (this.viewIndex === -1) return;

    this.autoLoadCategoryId ??= this.lStorage
      .getCategory(this.viewIndex);;

    let categories = this.lCS.getData();
    let category = categories.find(e => String(e.Id) === this.autoLoadCategoryId);
    if (category) {
      this.selectedCategory = category;
      this.onSelectCategory(category);
    }

  }

  ngOnDestroy(): void {
    this.subsSearch.unsubscribe();
    this.subsSearchKey.unsubscribe();
    this.subsSearchTranslation.unsubscribe();
    this.subsTranslatedColumn$.unsubscribe();
  }

  public async onSelectCategory(category: ILocalizationCategory) {
    this.keys = undefined;
    this.restartFilters();

    if (!category) {
      this.lStorage.setCategory(this.viewIndex, '');
      this.selectedCategory$.next(false);
      return;
    }

    this.lStorage.setCategory(this.viewIndex, category.Id ?? "");
    this.selectedCategory$.next(true);

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getIndex<ILocalizationKey[]>(ObjectStoreNames.LocalizationKey, "Category", category.Name);
      this.keys$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online)
      this.keys$ = this.api.getWithHeaders('localizationkeys', { category: category.Name });
    else this.keys$ = of([]);

    if (category.Name == 'SEARCH') {
      this.selectedCategoryIndex = 0;
      this.keys = undefined;
      this.searchCategory$.next(true);
      this.alreadySearch$.next(false);
      this.searchTotalTranslated = 0;
    }
    else {
      let categories = this.lCS.getData();
      this.selectedCategoryIndex = categories.findIndex(c => c.Name === this.selectedCategory.Name);
      this.searchCategory$.next(false);
      this.alreadySearch$.next(true);
      this.loading$.next(true)
      await firstValueFrom(this.keys$).then(r => this.keys = r, e => undefined);
      this.loading$.next(false);
    }


  }

  public async onTranslatedCheck(check: boolean, keys: ILocalizationKey[], key: ILocalizationKey) {
    this.saving$.next(true);
    if (check) {
      this.lCS.updateCategoryKeys(this.selectedCategory, this.selectedCategoryIndex, check, key);
      this.searchTotalTranslated++;
    }
    else {
      this.lCS.updateCategoryKeys(this.selectedCategory, this.selectedCategoryIndex, check, key);
      this.searchTotalTranslated--;
    }

    await this.onKeyTranslated(key);

    if (!this.propagateTranslation) {
      this.saving$.next(false);
      return;
    }

    let propagateKeys = this.getPropagateKeys(keys, key);

    for (let index = 0; index < propagateKeys.length; index++) {
      let keyToPropagate = propagateKeys[index];

      if (keyToPropagate.Translated[this.languageOrigin.localizationLang] === check) {

      }
      else if (check) {
        this.lCS.updateCategoryKeys(this.selectedCategory, this.selectedCategoryIndex, check, key);
        this.searchTotalTranslated++;
      }
      else {
        this.lCS.updateCategoryKeys(this.selectedCategory, this.selectedCategoryIndex, check, key);
        this.searchTotalTranslated--;
      }
      keyToPropagate.Translated[this.languageOrigin.localizationLang] = check;
      await this.onKeyTranslated(keyToPropagate);
    }

    this.saving$.next(false);
  }

  public onTranslationChange(translation: string, keys: ILocalizationKey[], key: ILocalizationKey) {
    if (!this.propagateTranslation) return;

    this.getPropagateKeys(keys, key).forEach(key => {
      key.Translations[this.languageOrigin.localizationLang] = translation;
    });
  }

  private getPropagateKeys(keys: ILocalizationKey[], key: ILocalizationKey) {
    let keysToPropagate = keys.filter(e => e.Original[this.languageOrigin.localizationLang] === key.Original[this.languageOrigin.localizationLang]);
    let keyIndex = keysToPropagate.findIndex(e => e === key);
    keysToPropagate.splice(keyIndex, 1);

    return keysToPropagate;
  }

  public async onKeyTranslated(key: ILocalizationKey) {
    let request$: Observable<any> | undefined = undefined;
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.put<ILocalizationKey>(ObjectStoreNames.LocalizationKey, key);
      request$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online)
      request$ = this.api.putWithHeaders('localizationkeys', { language: this.language }, key);

    if (request$ === undefined) return;

    await firstValueFrom(request$)
      .then(_ => {
        if (this.lStorage.getAppMode() === AppModes.Offline) {
          this.onCategoryUpdateOffline(key, this.language);
        }
      }, _ => {
        this.alerts.open(this.translate.instant('alert-error-label'),
          {
            label: this.translate.instant('alert-error'),
            autoClose: 3_000,
            closeable: false,
            appearance: 'error'
          }
        ).subscribe({
          complete: () => {
          },
        });
      }
      );
  }

  private async onCategoryUpdateOffline(key: ILocalizationKey, lang: string) {
    let r = this.indexedDB.getIndex<ILocalizationCategory[]>(ObjectStoreNames.LocalizationCategory, "Name", key.Category);
    let categories = await firstValueFrom(r.success$);
    let category = categories[0];

    if (key.Translated) {
      category.KeysTranslated[lang] += key.Translated[lang] ? 1 : -1;
    }

    let update = this.indexedDB.put<ILocalizationCategory>(ObjectStoreNames.LocalizationCategory, category);
    firstValueFrom(update.success$);
  }

  public onMachineTranslate() {
    if (this.keys)
      this.libreTranslate.onTranslateKeys(this.keys, this.languageOrigin.localizationLang);
  }

  private onTranslatedColumnCheckboxChange() {
    this.subsTranslatedColumn$ = this.filterForm
      .controls['translated']
      .valueChanges
      .subscribe(_ => {
        if (this.controlCheckbox >= 2) this.controlCheckbox = -1;
        this.controlCheckbox += 1;

        switch (this.controlCheckbox) {
          case 0:
            this.filterForm.patchValue({ translated: false }, { emitEvent: false })
            break;
          case 1:
            this.filterForm.patchValue({ translated: null }, { emitEvent: false });
            break;
          case 2:
            this.filterForm.patchValue({ translated: true }, { emitEvent: false })
            break;
        }
      });
  }

  private restartFilters() {
    this.controlCheckbox = 1;
    this.filterForm.reset(undefined, { emitEvent: false });
    this.filterForm.patchValue({
      translated: null
    }, { emitEvent: false });
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
    this.lastSearch = this.onSearch;
    this.alreadySearch$.next(true);

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB
        .getCursor<ILocalizationKey>(
          ObjectStoreNames.LocalizationKey,
          e => e.Original[this.language]
            .toLocaleLowerCase()
            .includes(this.search.value.toLowerCase()));

      this.keys$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online)
      this.keys$ = this.api
        .getWithHeaders('localizationkeys/search',
          {
            language: this.languageOrigin.localizationLang,
            text: this.search.value
          });

    this.loading$.next(true);

    this.restartFilters();

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
    this.lastSearch = this.onSearchKey;
    this.alreadySearch$.next(true);

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB
        .getCursor<ILocalizationKey>(
          ObjectStoreNames.LocalizationKey,
          e => e.Name
            .toLocaleLowerCase()
            .includes(this.searchKey.value.toLowerCase()));
      this.keys$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online)
      this.keys$ = this.api
        .getWithHeaders('localizationkeys/searchkey',
          {
            key: this.searchKey.value
          });

    this.loading$.next(true);

    this.restartFilters();

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
    this.lastSearch = this.onSearchTranslation;
    this.alreadySearch$.next(true);

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getCursor<ILocalizationKey>(
        ObjectStoreNames.LocalizationKey,
        e => e.Translations[this.language]
          .toLocaleLowerCase()
          .includes(this.searchTranslation.value.toLowerCase()));
      this.keys$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online)
      this.keys$ = this.api
        .getWithHeaders('localizationkeys/searchtranslation',
          {
            language: this.languageOrigin.localizationLang,
            text: this.searchTranslation.value
          });

    this.loading$.next(true);

    this.restartFilters();

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
        e => undefined
      );
    this.loading$.next(false);
  }
  //#endregion
}
