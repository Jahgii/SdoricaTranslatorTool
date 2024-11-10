import { TuiSidebar } from "@taiga-ui/addon-mobile";
import { TuiTextfieldControllerModule, TuiInputModule, TuiSelectModule } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiActiveZone, TuiContext, TuiLet } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiDataList, TuiScrollbar, TuiGroup, TuiButton, TuiHint, TuiTextfield } from '@taiga-ui/core';
import { TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { TuiDataListWrapper, TuiBadge, TuiBlock, TuiRadio } from '@taiga-ui/kit';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { BehaviorSubject, skip, takeWhile } from 'rxjs';
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

    TuiButton,
    TuiActiveZone,
    TuiSidebar,
    TuiScrollbar,
    TuiGroup,
    TuiBlock, TuiRadio,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiDataList,
    TuiDataListWrapper,
    TuiInputModule,
    TuiBadge,
    TuiLet,
    TuiHint
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
    @Inject(TuiLanguageSwitcherService) readonly switcher: TuiLanguageSwitcherService,
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

  public onMainTour() {
    this.appState.tour.start();
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
  ): TuiStringHandler<TuiContext<string>> {
    const map = new Map(items.map(({ code, name }) => [code, name] as [string, string]));

    return ({ $implicit }: TuiContext<string>) => map.get($implicit) || '';
  }

  readonly stringifyOriginLang = (name: string): string => this.translate.instant(name);

  @tuiPure
  stringifyLang(
    items: readonly { lang: string; value: string; }[],
  ): TuiStringHandler<TuiContext<string>> {
    const map = new Map(items.map(({ lang, value }) => [lang, value] as [string, string]));

    return ({ $implicit }: TuiContext<string>) => map.get($implicit) || '';
  }
}