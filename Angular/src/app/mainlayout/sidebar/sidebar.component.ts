import { TuiAvatar } from "@taiga-ui/kit";
import { TuiActiveZone } from "@taiga-ui/cdk";
import { ChangeDetectionStrategy, Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { GamedataValuesComponent } from 'src/app/components/gamedata-values/gamedata-values.component';
import { CommonWordsComponent } from 'src/app/components/common-words/common-words.component';
import { TuiBreakpointService, TuiDataList, TuiDropdown, TuiButton, TuiHint, TuiFallbackSrcPipe, TuiAppearance } from '@taiga-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalizationKeyComponent } from 'src/app/localization/localization-key/localization-key.component';
import { AppViews, viewers } from 'src/app/core/viewers';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { skip, takeWhile } from 'rxjs';
import { TuiTextfieldControllerModule } from "@taiga-ui/legacy";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CommonModule,
    TranslateModule,
    TuiButton,
    TuiHint,
    TuiAvatar,
    TuiDropdown,
    TuiDataList,
    TuiActiveZone,
    LocalizationKeyComponent,
    GamedataValuesComponent,
    CommonWordsComponent,
    TuiFallbackSrcPipe,
    TuiTextfieldControllerModule,
    TuiAppearance
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @ViewChild(LocalizationKeyComponent) localizationKeyDialog!: LocalizationKeyComponent;
  @ViewChild(GamedataValuesComponent) gamedataDialog!: GamedataValuesComponent;
  @ViewChild(CommonWordsComponent) dictionaryDialog!: CommonWordsComponent;

  public importOpen: boolean = false;
  public open: boolean = false;
  public gamedataOpen: boolean = false;
  public commonOpen: boolean = false;

  public appViews = AppViews;
  public viewers = viewers;

  public componentOpens = this.viewersService.componentOpens;

  constructor(
    public auth: AuthService,
    private viewersService: ViewersService,
    public appState: AppStateService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) { }

  public onOpenMenu() {
    this.open = !this.open;

    this.onTourOnGoing();
  }

  private onTourOnGoing() {
    if (!this.appState.isOnTour$()) return;

    this.breakpointService$
      .pipe(
        takeWhile(() => this.open),
        skip(1)
      )
      .subscribe(_ => {
        this.open = false;
      });
  }

  public async loadComponent(viewerKey: AppViews) {
    this.viewersService.loadComponent(viewerKey, await viewers[viewerKey](), {});
    this.open = false;
  }

}
