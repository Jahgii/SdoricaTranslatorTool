import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { LocalizationComponent } from 'src/app/components/localization/localization.component';
import { LoadFileWizardComponent } from 'src/app/components/load-file-wizard/load-file-wizard.component';
import { ExportTranslationGuestComponent } from 'src/app/components/export-translation-guest/export-translation-guest.component';
import { DialogMainComponent } from 'src/app/dialog-assets/dialog-main/dialog-main.component';
import { GamedataValuesComponent } from 'src/app/components/gamedata-values/gamedata-values.component';
import { CommonWordsComponent } from 'src/app/components/common-words/common-words.component';
import { TuiButtonModule, TuiHintModule } from '@taiga-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizationKeyComponent } from 'src/app/components/localization/localization-key/localization-key.component';

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

    LocalizationKeyComponent,
    GamedataValuesComponent,
    CommonWordsComponent
  ],
})
export class SidebarComponent {

  public viewers: { [component: string]: Type<any> } = {
    localization: LocalizationComponent,
    dialogs: DialogMainComponent,
    import: LoadFileWizardComponent,
    export: ExportTranslationGuestComponent
  };

  constructor(private viewersService: ViewersService) { }

  public loadComponent(component: Type<any>) {
    this.viewersService.loadComponent(component, {});
  }

}
