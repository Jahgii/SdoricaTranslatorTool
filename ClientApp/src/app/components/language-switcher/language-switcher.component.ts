import { NgForOf, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TUI_DOC_ICONS } from '@taiga-ui/addon-doc/tokens';
import { TuiButton, TuiDataList, TuiFlagPipe, TuiTextfield } from '@taiga-ui/core';
import { TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { TuiBadge, TuiBadgedContent, TuiButtonSelect } from '@taiga-ui/kit';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import type { TuiCountryIsoCode, TuiLanguageName } from '@taiga-ui/i18n/types';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
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
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  protected readonly icons = inject(TUI_DOC_ICONS);
  protected readonly lStorage = inject(LocalStorageService);
  protected readonly translate = inject(TranslateService);
  protected readonly switcher = inject(TuiLanguageSwitcherService);
  protected readonly language = new FormControl(capitalize(this.switcher.language));

  protected open = false;

  public readonly flags = new Map<TuiLanguageName, TuiCountryIsoCode>([
    ['english', 'US'],
    ['spanish', 'ES'],
  ]);

  public readonly names: TuiLanguageName[] = Array.from(this.flags.keys());

  constructor() {
    let lang = this.lStorage.getAppLang();

    if (lang) this.setLang(lang);
    else this.setLang('english');
  }

  public setLang(lang: TuiLanguageName): void {
    this.lStorage.setAppLang(lang);
    this.translate.use(lang);
    this.switcher.setLanguage(lang);
    this.open = false;
  }

}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}