import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TuiBreakpointService, TuiScrollbarComponent, TuiTextfieldControllerModule, TuiPrimitiveTextfieldModule, TuiDataListModule, TuiHostedDropdownModule, TuiModeModule } from '@taiga-ui/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILocalizationCategory } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { LocalizationTableComponent } from './localization-table/localization-table.component';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiDataListWrapperModule } from '@taiga-ui/kit/components/data-list-wrapper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiComboBoxModule, TuiInputModule, TuiFilterByInputPipeModule } from '@taiga-ui/kit';
import { CommonWordsComponent } from '../common-words/common-words.component';
import { GamedataValuesComponent } from '../gamedata-values/gamedata-values.component';
import { LocalizationKeyComponent } from '../localization-key/localization-key.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-localization',
    templateUrl: './localization.component.html',
    styleUrls: ['./localization.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [LocalizationService],
    animations: [
        popinAnimation
    ],
    standalone: true,
    imports: [
        NgIf,
        LocalizationKeyComponent,
        GamedataValuesComponent,
        CommonWordsComponent,
        TuiComboBoxModule,
        FormsModule,
        TuiTextfieldControllerModule,
        TuiPrimitiveTextfieldModule,
        TuiDataListModule,
        TuiDataListWrapperModule,
        TuiHostedDropdownModule,
        TuiModeModule,
        TuiButtonModule,
        TuiInputModule,
        ReactiveFormsModule,
        TuiHintModule,
        LocalizationTableComponent,
        TuiBlockStatusModule,
        AsyncPipe,
        TuiFilterByInputPipeModule,
        TranslateModule,
    ],
})
export class LocalizationComponent implements OnInit, OnDestroy {
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private api: ApiService,
    public languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService,
    public localization: LocalizationService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
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
