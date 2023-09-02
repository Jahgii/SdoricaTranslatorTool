import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';

@Component({
  selector: 'app-localization-search',
  templateUrl: './localization-search.component.html',
  styleUrls: ['./localization-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ]
})
export class LocalizationSearchComponent {
  @Output() onTranslated = new EventEmitter<{ check: boolean, keys: ILocalizationKey[], key: ILocalizationKey }>();
  public search: FormControl = new FormControl('', [Validators.required, Validators.minLength(4)]);
  public searchKey: FormControl = new FormControl('', [Validators.required, Validators.minLength(4)]);
  public results$!: Observable<ILocalizationKey[]>;
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public propagateTranslation: boolean = true;

  constructor(
    private api: ApiService,
    private languageOrigin: LanguageOriginService
  ) {

  }

  public onSearch() {
    let language = this.languageOrigin.language.value as string;
    switch (language) {
      case 'chinesesimplified':
        language = 'ChineseSimplified';
        break;
      case 'chinesetraditional':
        language = 'Chinese';
        break;
    }

    this.results$ = this.api
      .getWithHeaders('localizationkeys/search',
        {
          language: language.charAt(0).toUpperCase() + language.slice(1),
          text: this.search.value
        });
  }

  public onSearchKey() {
    this.results$ = this.api
      .getWithHeaders('localizationkeys/searchkey',
        {
          key: this.searchKey.value
        });
  }

  public onRenderDefaultLanguage(translations: { [language: string]: string }): string {
    var key = Object.keys(translations).find(key => key.toLowerCase() === this.languageOrigin.language.value);
    if (!key) return 'LANGUAGE NOT FOUND';
    return translations[key];
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

  public async onTranslatedCheck(check: boolean, keys: ILocalizationKey[], key: ILocalizationKey) {
    this.onTranslated.emit({ check, keys, key });
  }
}
