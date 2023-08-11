import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILanguage } from 'src/app/core/interfaces/i-dialog-group';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class LocalizationComponent implements OnInit, OnDestroy {
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public propagateTranslation: boolean = true;

  readonly filterForm = new FormGroup({
    original: new FormControl(undefined),
    translation: new FormControl(undefined),
    translated: new FormControl(false)
  });

  readonly filterOriginalColumn = (item: { [language: string]: string }, value: string): boolean => {
    if (!value) value = "";
    return this.onRenderDefaultLanguage(item).toLowerCase().includes(value?.toLowerCase());
  };

  readonly filterTranslationColumn = (item: { [language: string]: string }, value: string): boolean => {
    if (!value) value = "";
    return item['ReplaceLang'].toLowerCase().includes(value?.toLowerCase());
  };

  readonly filterTranslatedColumn = (item: boolean, value: boolean): boolean => {
    return item === value;
  };

  public languages!: string[];
  public language: FormControl = new FormControl('', Validators.required);
  private subsLanguage!: Subscription;
  public categories$: Observable<ILocalizationCategory[]> = this.api.get<ILocalizationCategory[]>('localizationcategories')
    .pipe(map(r => {
      let searchCategory: ILocalizationCategory = {
        Name: "SEARCH",
        Keys: r.reduce((ac, v) => {
          return ac + v.Keys;
        }, 0),
        KeysTranslated: r.reduce((ac, v) => {
          return ac + v.KeysTranslated;
        }, 0)
      }
      r.unshift(searchCategory);
      return r;
    }));
  public keys$!: Observable<ILocalizationKey[]>;
  public selectedCategoryIndex!: number;
  public selectedCategory!: ILocalizationCategory;
  public searchCategory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    public libreTranslate: LibreTranslateService
  ) { }

  ngOnInit(): void {
    this.subsLanguage = this.language.valueChanges.subscribe((lang: string) => {
      this.local.setDefaultLang(lang);
    });

    firstValueFrom(this.api.get<ILanguage[]>('languages'))
      .then(r => {
        if (r.length == 0) {
          return;
        }

        this.languages = r.map(e => e.Name);

        let defaultLang = this.local.getDefaultLang();
        let lang = r.find(e => e.Name == defaultLang);

        if (!lang) {
          lang = r[0];
          this.local.setDefaultLang(lang.Name);
        }
        this.language.patchValue(lang.Name);
      });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }

  public onSelectCategory(category: ILocalizationCategory, index: number) {
    if (this.selectedCategoryIndex === index) return;

    this.filterForm.reset();
    this.filterForm.patchValue({
      translated: false
    });
    this.selectedCategory = category;
    this.selectedCategoryIndex = index;
    this.keys$ = this.api.getWithHeaders('localizationkeys', { category: category.Name });

    if (category.Name == 'SEARCH') this.searchCategory$.next(true);
    else this.searchCategory$.next(false);
  }

  public onRenderDefaultLanguage(translations: { [language: string]: string }): string {
    var key = Object.keys(translations).find(key => key.toLowerCase() === this.language.value);
    if (!key) return 'LANGUAGE NOT FOUND';
    return translations[key];
  }

  public async onTranslatedCheck(check: boolean, keys: ILocalizationKey[], key: ILocalizationKey) {
    if (check) this.selectedCategory.KeysTranslated += 1;
    else this.selectedCategory.KeysTranslated -= 1;

    await this.onKeyTranslated(key);

    if (!this.propagateTranslation) return;

    let propagateKeys = this.getPropagateKeys(keys, key);

    for (let index = 0; index < propagateKeys.length; index++) {
      let keyToPropagate = propagateKeys[index];
      if (keyToPropagate.Translated === check) return;
      if (check) this.selectedCategory.KeysTranslated += 1;
      else this.selectedCategory.KeysTranslated -= 1;
      keyToPropagate.Translated = check;
      await this.onKeyTranslated(keyToPropagate);
    }
  }

  public onTooltipCheck(scrollTooltip?: TuiScrollbarComponent) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['nativeElement']['offsetHeight'] < scrollTooltip['el']['nativeElement']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }

  public onTranslationChange(translation: string, keys: ILocalizationKey[], key: ILocalizationKey) {
    if (!this.propagateTranslation) return;

    this.getPropagateKeys(keys, key).forEach(key => {
      key.Translations['ReplaceLang'] = translation;
    });
  }

  private getPropagateKeys(keys: ILocalizationKey[], key: ILocalizationKey) {
    var keysToPropagate = keys.filter(e => this.onRenderDefaultLanguage(e.Translations) === this.onRenderDefaultLanguage(key.Translations));
    var keyIndex = keysToPropagate.findIndex(e => e === key);
    keysToPropagate.splice(keyIndex, 1);

    return keysToPropagate;
  }

  public async onKeyTranslated(key: ILocalizationKey) {
    await firstValueFrom(this.api.put('localizationkeys', key))
      .then(
        r => {

        },
        error => {
        }
      );
  }

  public onMachineTranslate(keys: ILocalizationKey[]) {
    this.libreTranslate.onTranslateKeys(keys, this.language.value);
  }

}
