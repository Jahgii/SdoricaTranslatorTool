import { ChangeDetectionStrategy, Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { GamedataValuesComponent } from 'src/app/components/gamedata-values/gamedata-values.component';
import { CommonWordsComponent } from 'src/app/components/common-words/common-words.component';
import { TuiBreakpointService, TuiButtonModule, TuiDataListModule, TuiDropdownModule, TuiHintModule, TuiHostedDropdownModule, TuiLoaderModule, TuiModeModule, TuiSvgModule } from '@taiga-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalizationKeyComponent } from 'src/app/localization/localization-key/localization-key.component';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { AppViews, viewers } from 'src/app/core/viewers';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { skip, take, takeWhile } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CommonModule,
    TranslateModule,

    TuiButtonModule,
    TuiHintModule,
    TuiLoaderModule,
    TuiAvatarModule,
    TuiHostedDropdownModule,
    TuiDataListModule,
    TuiSvgModule,
    TuiActiveZoneModule,
    TuiModeModule,
    TuiDropdownModule,

    LocalizationKeyComponent,
    GamedataValuesComponent,
    CommonWordsComponent
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @ViewChild(LocalizationKeyComponent) localizationKeyDialog!: LocalizationKeyComponent;
  @ViewChild(GamedataValuesComponent) gamedataDialog!: GamedataValuesComponent;
  @ViewChild(CommonWordsComponent) dictionaryDialog!: CommonWordsComponent;

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
      .subscribe(breakpoint => {
        this.open = false;
      });
  }

  public loadComponent(viewerKey: AppViews) {
    this.viewersService.loadComponent(viewerKey, viewers[viewerKey], {});
    this.open = false;
  }

}
