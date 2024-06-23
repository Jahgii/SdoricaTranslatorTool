import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiContextWithImplicit, TuiActiveZoneModule, TuiLetModule } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiScrollbarModule, TuiGroupModule, TuiTextfieldControllerModule, TuiPrimitiveTextfieldModule, TuiDataListModule, TuiHintModule } from '@taiga-ui/core';
import { TuiLanguageSwitcher } from '@taiga-ui/i18n';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { TuiBadgeModule } from '@taiga-ui/kit/components/badge';
import { TuiDataListWrapperModule } from '@taiga-ui/kit/components/data-list-wrapper';
import { TuiRadioBlockModule, TuiSelectModule, TuiInputModule } from '@taiga-ui/kit';
import { TuiSidebarModule } from '@taiga-ui/addon-mobile';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { BehaviorSubject, firstValueFrom, skip, takeWhile } from 'rxjs';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { AppStateService } from 'src/app/core/services/app-state.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiButtonModule,
    TuiActiveZoneModule,
    TuiSidebarModule,
    TuiScrollbarModule,
    TuiGroupModule,
    TuiRadioBlockModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiPrimitiveTextfieldModule,
    TuiDataListModule,
    TuiDataListWrapperModule,
    TuiInputModule,
    TuiBadgeModule,
    TuiLetModule,
    TuiHintModule
  ]
})
export class HeaderMenuComponent implements OnInit {
  public openMenu: boolean = false;
  public openSetting: boolean = false;

  public langControl: FormControl = new FormControl();

  public langs: { lang: string; value: string; }[] = [
    { lang: 'en', value: 'en' },
    { lang: 'es', value: 'es' }
  ];

  public img$ = new BehaviorSubject<string>("");
  public count = 0;

  constructor(
    readonly languageOrigin: LanguageOriginService,
    public libreTranslate: LibreTranslateService,
    public portraitsService: PortraitsService,
    private lStorage: LocalStorageService,
    readonly translate: TranslateService,
    public authService: AuthService,
    private viewers: ViewersService,
    public theme: ThemeService,
    public appState: AppStateService,
    @Inject(TuiLanguageSwitcher) readonly switcher: TuiLanguageSwitcher,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) {
    this.translate.currentLang = this.translate.defaultLang;
  }

  ngOnInit(): void {
    this.langControl.valueChanges
      .subscribe(lang => {
        this.translate.use(lang);
        this.lStorage.setAppLang(lang);
        this.switcher.setLanguage(lang);
      });

    let lang = this.lStorage.getAppLang();

    if (lang) {
      this.lStorage.setAppLang(lang);
      this.langControl.patchValue(lang);
    }
    else {
      this.lStorage.setAppLang('en');
      this.langControl.patchValue('en');
    }
  }

  public onToogleSettings() {
    let button = document.getElementById('settingsButton');
    button?.click();
    button?.click();

    this.openSetting = !this.openSetting;

    this.onTourOnGoing();
  }

  public onSplitModeToggle(event: MouseEvent) {
    if (event.isTrusted)
      this.viewers.splitMode();
  }

  private onTourOnGoing() {
    if (!this.appState.isOnTour$()) return;

    this.breakpointService$
      .pipe(
        takeWhile(() => this.openSetting),
        skip(1)
      )
      .subscribe(breakpoint => {
        this.openSetting = false;
      });
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