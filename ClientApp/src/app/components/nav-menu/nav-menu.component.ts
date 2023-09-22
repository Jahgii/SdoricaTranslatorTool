import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiContextWithImplicit } from '@taiga-ui/cdk';
import { TuiBreakpointService } from '@taiga-ui/core';
import { TuiCountryIsoCode, TuiLanguageName, TuiLanguageSwitcher } from '@taiga-ui/i18n';
import { BehaviorSubject } from 'rxjs';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavMenuComponent implements OnInit {
  public openSetting: boolean = false;

  public langControl: FormControl = new FormControl();

  public langs: { lang: string; value: string; }[] = [
    { lang: 'en', value: 'en' },
    { lang: 'es', value: 'es' }
  ];

  readonly flags = new Map<TuiLanguageName, TuiCountryIsoCode>([
    ['english', TuiCountryIsoCode.GB],
    ['spanish', TuiCountryIsoCode.ES]
  ]);

  constructor(
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
    readonly translate: TranslateService,
    private localStorage: LocalStorageService,
    public authService: AuthService,
    public theme: ThemeService,
    @Inject(TuiLanguageSwitcher) readonly switcher: TuiLanguageSwitcher,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) {
    this.translate.currentLang = this.translate.defaultLang;
  }

  ngOnInit(): void {
    this.langControl.valueChanges
      .subscribe(lang => {
        this.translate.use(lang);
        this.localStorage.setAppLang(lang);
        this.switcher.setLanguage(lang);
      });

    let lang = this.localStorage.getAppLang();

    if (lang) {
      this.localStorage.setAppLang(lang);
      this.langControl.patchValue(lang);
    }
    else {
      this.localStorage.setAppLang('en');
      this.langControl.patchValue('en');
    }
  }

  public onToogleSettings() {
    this.openSetting = !this.openSetting;
  }

  public changeLang(lang: string) {
    this.translate.use(lang);
  }

  @tuiPure
  stringify(
    items: readonly ILibreTranslateLanguages[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({ code, name }) => [code, name] as [string, string]));

    return ({ $implicit }: TuiContextWithImplicit<string>) => map.get($implicit) || '';
  }

  readonly stringifyOriginLang = (name: string): string => this.translate.instant(name);

  @tuiPure
  stringifyLang(
    items: readonly { lang: string; value: string; }[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({ lang, value }) => [lang, value] as [string, string]));

    return ({ $implicit }: TuiContextWithImplicit<string>) => map.get($implicit) || '';
  }
}