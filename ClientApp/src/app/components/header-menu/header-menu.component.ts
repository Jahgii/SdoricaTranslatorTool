import { TuiSidebar } from "@taiga-ui/addon-mobile";
import { TuiTextfieldControllerModule, TuiInputModule, TuiSelectModule } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, Component, inject, Inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiContext, TuiLet } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiDataList, TuiGroup, TuiButton, TuiHint, TuiTextfield, TuiPopup, TuiAlertService, TuiAlertContext } from '@taiga-ui/core';
import { TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { TuiDataListWrapper, TuiBadge, TuiBlock, TuiRadio, TuiDrawer } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, skip, takeWhile } from 'rxjs';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";
import { IndexDBService } from "src/app/core/services/index-db.service";
import { PolymorpheusTemplate } from '@taiga-ui/polymorpheus';
import { GeminiApiService } from "src/app/core/services/gemini-api.service";
import { AppModes } from "src/app/core/enums/app-modes";
import { LocalStorageService } from "src/app/core/services/local-storage.service";

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PolymorpheusTemplate,
    TuiPopup,
    TuiDrawer,
    TuiButton,
    TuiSidebar,
    TuiGroup,
    TuiRadio,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiDataList,
    TuiDataListWrapper,
    TuiInputModule,
    TuiBadge,
    TuiLet,
    TuiHint,
    LanguageSwitcherComponent
  ]
})
export class HeaderMenuComponent {
  @ViewChild('restartTemplate')
  protected restartTemplate?: TemplateRef<TuiAlertContext>;

  private readonly alerts = inject(TuiAlertService);

  protected openMenu: boolean = false;
  protected openSetting = signal(false);
  protected modes = AppModes;
  protected currentMode;

  protected langControl: FormControl = new FormControl();

  protected langs: { lang: string; value: string; }[] = [
    { lang: 'en', value: 'en' },
    { lang: 'es', value: 'es' }
  ];

  protected img$ = new BehaviorSubject<string>("");
  protected count = 0;

  constructor(
    public readonly languageOrigin: LanguageOriginService,
    public readonly libreTranslate: LibreTranslateService,
    public readonly geminiApi: GeminiApiService,
    public readonly portraitsService: PortraitsService,
    public readonly translate: TranslateService,
    public readonly authService: AuthService,
    private readonly viewers: ViewersService,
    public readonly theme: ThemeService,
    public readonly appState: AppStateService,
    public readonly indexDB: IndexDBService,
    private readonly lStorage: LocalStorageService,
    @Inject(TuiLanguageSwitcherService) readonly switcher: TuiLanguageSwitcherService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) {
    this.currentMode = this.lStorage.getAppMode() ?? AppModes.Offline;
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
    window.location.reload();
  }

  protected onMainTour() {
    this.openSetting.set(false);
    this.appState.tour.start();
  }

  private onTourOnGoing() {
    if (!this.appState.isOnTour$()) return;

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
    window.localStorage.clear();

    window.location.reload();
  }

  protected onOpenSettings(event: MouseEvent, toogle: boolean) {
    if (event.isTrusted) this.openSetting.set(toogle);
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