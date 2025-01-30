import { TuiSidebar } from "@taiga-ui/addon-mobile";
import { TuiTextfieldControllerModule, TuiInputModule, TuiSelectModule } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiContext, TuiLet } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiDataList, TuiGroup, TuiButton, TuiHint, TuiTextfield, TuiPopup } from '@taiga-ui/core';
import { TuiLanguageSwitcherService } from '@taiga-ui/i18n';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { TuiDataListWrapper, TuiBadge, TuiBlock, TuiRadio, TuiDrawer } from '@taiga-ui/kit';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { BehaviorSubject, skip, takeWhile } from 'rxjs';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";

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

    LanguageSwitcherComponent,
  ]
})
export class HeaderMenuComponent {
  public openMenu: boolean = false;
  public openSetting = signal(false);;

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
    readonly translate: TranslateService,
    public authService: AuthService,
    private viewers: ViewersService,
    public theme: ThemeService,
    public appState: AppStateService,
    @Inject(TuiLanguageSwitcherService) readonly switcher: TuiLanguageSwitcherService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) {
  }

  public onToogleSettings() {
    let button = document.getElementById('settingsButton');
    button?.click();
    button?.click();

    this.openSetting.set(!this.openSetting);

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
        takeWhile(() => this.openSetting()),
        skip(1)
      )
      .subscribe(breakpoint => {
        this.openSetting.set(false);
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