import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TuiBreakpointService, TuiScrollbarComponent } from '@taiga-ui/core';
import { BehaviorSubject } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LocalizationService } from 'src/app/core/services/localization.service';

@Component({
  selector: 'app-localization-table',
  templateUrl: './localization-table.component.html',
  styleUrls: ['./localization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ]
})
export class LocalizationTableComponent implements OnInit {
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public localization: LocalizationService,
    public languageOrigin: LanguageOriginService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) { }

  ngOnInit(): void {
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
