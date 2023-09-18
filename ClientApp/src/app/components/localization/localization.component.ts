import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { LocalizationService } from 'src/app/core/services/localization.service';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LocalizationService],
  animations: [
    popinAnimation
  ],
})
export class LocalizationComponent implements OnInit, OnDestroy {
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private api: ApiService,
    public languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService,
    public localization: LocalizationService
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  public onRenderDefaultLanguage(translations: { [language: string]: string }): string {
    return translations[this.languageOrigin.localizationLang];
  }

  public onTooltipCheck(scrollTooltip?: TuiScrollbarComponent) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['nativeElement']['offsetHeight'] < scrollTooltip['el']['nativeElement']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }

  public onResetCategories() {
    firstValueFrom(this.api.post('localizationcategories/reset', {}));
  }

  readonly stringify = (item: ILocalizationCategory): string =>
    `${item.Name} [${item.KeysTranslated[this.languageOrigin.localizationLang]}/${item.Keys[this.languageOrigin.localizationLang]}]`;

}
