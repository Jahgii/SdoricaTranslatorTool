import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';

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
    return item[this.languageOrigin.localizationLang].toLowerCase().includes(value?.toLowerCase());
  };

  readonly filterTranslationColumn = (item: { [language: string]: string }, value: string): boolean => {
    if (!value) value = "";
    return item[this.languageOrigin.localizationLang].toLowerCase().includes(value?.toLowerCase());
  };

  readonly filterTranslatedColumn = (item: { [language: string]: boolean }, value: boolean): boolean => {
    return item[this.languageOrigin.localizationLang] === value;
  };

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
  public keys$!: Observable<ILocalizationKey[]>;
  public selectedCategoryIndex!: number;
  public selectedCategory!: ILocalizationCategory;
  public searchCategory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public language: string = '';

  constructor(
    private api: ApiService,
    private languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService
  ) {
    this.language = this.languageOrigin.localizationLang;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
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
    return translations[this.languageOrigin.localizationLang];
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

  public onTooltipCheck(scrollTooltip?: TuiScrollbarComponent) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['nativeElement']['offsetHeight'] < scrollTooltip['el']['nativeElement']['scrollHeight'];

    this.showTooltipArrow$.next(show);
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

  public onMachineTranslate(keys: ILocalizationKey[]) {
    this.libreTranslate.onTranslateKeys(keys, this.languageOrigin.localizationLang);
  }

}
