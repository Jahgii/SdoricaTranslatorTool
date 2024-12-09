import { TuiBlockStatus } from "@taiga-ui/layout";
import { TuiPrimitiveTextfieldModule, TuiTextfieldControllerModule, TuiComboBoxModule, TuiInputModule } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TuiDataList, TuiScrollbar, TuiDropdown, TuiButton, TuiHint } from '@taiga-ui/core';
import { firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILocalizationCategory } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizationTableComponent } from './localization-table/localization-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiDataListWrapper, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { LocalizationKeyComponent } from './localization-key/localization-key.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LocalizationService
  ],
  animations: [
    popinAnimation
  ],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiComboBoxModule,
    TuiTextfieldControllerModule,
    // TuiPrimitiveTextfieldModule,
    TuiDataList,
    TuiDataListWrapper,
    TuiDropdown,
    TuiButton,
    TuiInputModule,
    TuiHint,
    TuiBlockStatus,
    TuiFilterByInputPipe,
    
    LocalizationTableComponent
  ],
})
export class LocalizationComponent implements OnInit {
  viewIndex: number = -1;

  constructor(
    private api: ApiService,
    public languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService,
    public localization: LocalizationService
  ) {
  }

  ngOnInit(): void {
    this.localization.viewIndex = this.viewIndex;
    this.localization.loadStore();
  }

  public onResetCategories() {
    firstValueFrom(this.api.post('localizationcategories/reset', {}));
  }

  readonly stringify = (item: ILocalizationCategory): string =>
    `${item.Name} [${item.KeysTranslated[this.languageOrigin.localizationLang]}/${item.Keys[this.languageOrigin.localizationLang]}]`;

}
