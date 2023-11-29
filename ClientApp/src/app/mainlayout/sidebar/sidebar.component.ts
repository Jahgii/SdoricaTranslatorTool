import { Component, Inject, Type, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { LoadFileWizardComponent } from 'src/app/components/load-file-wizard/load-file-wizard.component';
import { ExportTranslationGuestComponent } from 'src/app/components/export-translation-guest/export-translation-guest.component';
import { DialogMainComponent } from 'src/app/dialog-assets/dialog-main/dialog-main.component';
import { GamedataValuesComponent } from 'src/app/components/gamedata-values/gamedata-values.component';
import { CommonWordsComponent } from 'src/app/components/common-words/common-words.component';
import { TuiBreakpointService, TuiButtonModule, TuiDataListModule, TuiHintModule, TuiHostedDropdownModule, TuiLoaderModule, TuiSvgModule } from '@taiga-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalizationKeyComponent } from 'src/app/localization/localization-key/localization-key.component';
import { LocalizationComponent } from 'src/app/localization/localization.component';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { ImportMainComponent } from 'src/app/import/import-main/import-main.component';

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

    LocalizationKeyComponent,
    GamedataValuesComponent,
    CommonWordsComponent
  ],
})
export class SidebarComponent {
  @ViewChild(LocalizationKeyComponent) localizationKeyDialog!: LocalizationKeyComponent;
  @ViewChild(GamedataValuesComponent) gamedataDialog!: GamedataValuesComponent;
  @ViewChild(CommonWordsComponent) dictionaryDialog!: CommonWordsComponent;

  public open: boolean = false;
  public gamedataOpen: boolean = false;
  public commonOpen: boolean = false;

  public viewers: { [component: string]: Type<any> } = {
    localization: LocalizationComponent,
    dialogs: DialogMainComponent,
    import: LoadFileWizardComponent,
    // import: ImportMainComponent,
    export: ExportTranslationGuestComponent
  };

  public componentOpens = this.viewersService.componentOpens;

  constructor(
    public auth: AuthService,
    private viewersService: ViewersService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) { }

  public loadComponent(component: Type<any>) {
    this.viewersService.loadComponent(component, {});
    this.open = false;
  }

}
