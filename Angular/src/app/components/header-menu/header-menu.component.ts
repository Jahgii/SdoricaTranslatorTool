import { ChangeDetectionStrategy, Component, inject, Inject, OnInit, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiContext } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiDataList, TuiGroup, TuiButton, TuiHint, TuiTextfield, TuiPopup, TuiAlertService, TuiAlertContext, TuiIcon, TuiLabel, TuiDropdown } from '@taiga-ui/core';
import { TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { TuiDataListWrapper, TuiBadge, TuiRadio, TuiDrawer, TuiPassword, TuiSelect, TuiChevron } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, skip, takeWhile } from 'rxjs';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";
import { IndexDBService } from "src/app/core/services/index-db.service";
import { PolymorpheusTemplate } from '@taiga-ui/polymorpheus';
import { AppModes } from "src/app/core/enums/app-modes";
import { LocalStorageService } from "src/app/core/services/local-storage.service";
import { PasswordHideTextDirective } from "src/app/core/directives/password-hide-text.directive";
import { TourService } from 'src/app/core/services/tour.service';
import { GeminiApiConfigurationService } from 'src/app/core/services/gemini-api-configuration.service';
import { Tours } from 'src/app/core/enums/tours';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TourService
  ],
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,
    PolymorpheusTemplate,

    TuiPopup,
    TuiDrawer,
    TuiButton,
    TuiGroup,
    TuiRadio,
    TuiTextfield,
    TuiLabel,
    TuiChevron,
    TuiSelect,
    TuiDataList,
    TuiDataListWrapper,
    TuiBadge,
    TuiHint,
    TuiPassword,
    TuiIcon,
    TuiDropdown,

    LanguageSwitcherComponent,
    PasswordHideTextDirective,
  ]
})
export class HeaderMenuComponent implements OnInit {
  @ViewChild('restartTemplate')
  protected restartTemplate?: TemplateRef<TuiAlertContext>;

  private readonly alerts = inject(TuiAlertService);

  protected direction: WritableSignal<'left' | 'right'> = signal('right');
  protected openMenu: boolean = false;
  protected openSetting = signal(false);
  protected modes = AppModes;
  protected currentMode;

  protected langControl: FormControl = new FormControl();

  protected langs: { lang: string; value: string; }[] = [
    { lang: 'en', value: 'en' },
    { lang: 'es', value: 'es' }
  ];

  protected tours = Object.values(Tours);
  protected open = false;

  protected img$ = new BehaviorSubject<string>("");
  protected count = 0;

  constructor(
    public readonly languageOrigin: LanguageOriginService,
    public readonly libreTranslate: LibreTranslateService,
    public readonly geminiConfig: GeminiApiConfigurationService,
    public readonly portraitsService: PortraitsService,
    public readonly translate: TranslateService,
    public readonly authService: AuthService,
    private readonly viewers: ViewersService,
    public readonly theme: ThemeService,
    public readonly appState: AppStateService,
    public readonly indexDB: IndexDBService,
    private readonly lStorage: LocalStorageService,
    private readonly tour: TourService,
    @Inject(TuiLanguageSwitcherService) readonly switcher: TuiLanguageSwitcherService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) {
    this.currentMode = this.lStorage.getAppMode() ?? AppModes.Offline;
  }

  ngOnInit(): void {
    if (!this.lStorage.getAppMainTourDone())
      this.tour.start(Tours.Main);
  }

  protected onToogleSettings() {
    let button = document.getElementById('settingsButton');
    button?.click();
    button?.click();

    this.openSetting.set(!this.openSetting);

    this.onTourOnGoing();
  }

  protected onSplitModeToggle(event: MouseEvent) {
    if (event.isTrusted)
      this.viewers.splitMode();
  }

  protected onSwitchAppMode(mode: AppModes) {
    this.lStorage.setAppMode(mode);
    globalThis.location.reload();
  }

  protected onMainTour(tour: Tours) {
    this.openSetting.set(false);
    this.tour.start(tour);
  }

  private onTourOnGoing() {
    if (!this.tour.isOnTour$()) return;

    this.breakpointService$
      .pipe(
        takeWhile(() => this.openSetting()),
        skip(1)
      )
      .subscribe(breakpoint => {
        this.openSetting.set(false);
      });
  }

  protected showWarningAlert(): void {
    this.alerts
      .open(this.restartTemplate || '', {
        label: this.translate.instant('app-restart-title'),
        appearance: 'negative',
        autoClose: 0,
      })
      .subscribe();
  }

  protected onRestartApp() {
    this.indexDB.destroyDB();
    globalThis.localStorage.clear();

    globalThis.location.reload();
  }

  protected onOpenSettings(event: MouseEvent, toogle: boolean) {
    let tui_root = document.querySelector('tui-root');
    if (!tui_root) return;
    let rtl_ltr = Number(globalThis.getComputedStyle(tui_root).getPropertyValue('--tui-inline') ?? 1);
    if (rtl_ltr === -1) this.direction.set('left');
    else this.direction.set('right');
    this.openSetting.set(toogle);
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