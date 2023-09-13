import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { BehaviorSubject } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LocalizationService } from 'src/app/core/services/localization.service';

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
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private languageOrigin: LanguageOriginService,
    public localization: LocalizationService
  ) {
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
}
