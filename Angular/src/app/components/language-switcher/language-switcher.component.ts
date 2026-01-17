import { LowerCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TUI_DOC_ICONS } from '@taiga-ui/addon-doc/tokens';
import { TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonSelect } from '@taiga-ui/kit';
import { LangService } from 'src/app/core/services/lang.service';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { Indexes, ObjectStoreNames } from 'src/app/core/interfaces/i-indexed-db';
import { firstValueFrom } from 'rxjs';
import { IAppLanguage } from 'src/app/core/interfaces/i-i18n';
import type { TuiLanguageName } from '@taiga-ui/i18n/types';

@Component({
  selector: 'app-language-switcher',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    LowerCasePipe,
    TranslateModule,
    TuiButton,
    TuiButtonSelect,
    TuiDataList,
    TuiTextfield,
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  protected readonly langService = inject(LangService);
  protected readonly icons = inject(TUI_DOC_ICONS);
  protected readonly indexedDB = inject(IndexDBService);

  protected open = false;

  constructor() {
    let request = this.indexedDB.getIndex<IAppLanguage[], ObjectStoreNames.AppLanguages>(
      ObjectStoreNames.AppLanguages,
      Indexes.AppLanguages.Custom,
      1
    ).success$;

    firstValueFrom(request).then(langs => {
      this.langService.customNames.set(langs.map(e => e.Language))
    });
  }

  public setLang(lang: TuiLanguageName): void {
    this.langService.setLang(lang);
    this.open = false;
  }

  public setCustomLang(lang: TuiLanguageName): void {
    this.langService.setCustomLang(lang);
    this.open = false;
  }
}