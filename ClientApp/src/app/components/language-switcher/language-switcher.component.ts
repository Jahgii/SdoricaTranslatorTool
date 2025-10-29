import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TUI_DOC_ICONS } from '@taiga-ui/addon-doc/tokens';
import { TuiButton, TuiDataList, TuiFlagPipe, TuiTextfield } from '@taiga-ui/core';
import { TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { TuiBadge, TuiBadgedContent, TuiButtonSelect } from '@taiga-ui/kit';
import { LangService } from 'src/app/core/services/lang.service';
import type { TuiCountryIsoCode, TuiLanguageName } from '@taiga-ui/i18n/types';

@Component({
  selector: 'app-language-switcher',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    TranslateModule,
    TuiBadge,
    TuiBadgedContent,
    TuiButton,
    TuiButtonSelect,
    TuiDataList,
    TuiFlagPipe,
    TuiTextfield,
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  protected readonly langService = inject(LangService);
  protected readonly icons = inject(TUI_DOC_ICONS);
  protected readonly switcher = inject(TuiLanguageSwitcherService);
  protected readonly language = new FormControl(capitalize(this.switcher.language));

  protected open = false;

  public readonly flags = new Map<TuiLanguageName, TuiCountryIsoCode>([
    ['english', 'US'],
    ['spanish', 'ES'],
  ]);

  public readonly names: TuiLanguageName[] = Array.from(this.flags.keys());

  constructor() { }

  public setLang(lang: TuiLanguageName): void {
    this.langService.setLang(lang);
    this.switcher.setLanguage(lang);
    this.open = false;
  }

}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}