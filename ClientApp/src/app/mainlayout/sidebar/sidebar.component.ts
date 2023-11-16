import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiMarkerIconModule } from '@taiga-ui/kit';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { LocalizationComponent } from 'src/app/components/localization/localization.component';
import { DialogAssetsComponent } from 'src/app/components/dialog-assets/dialog-assets.component';
import { LoadFileWizardComponent } from 'src/app/components/load-file-wizard/load-file-wizard.component';
import { ExportTranslationGuestComponent } from 'src/app/components/export-translation-guest/export-translation-guest.component';
import { MainGroupsComponent } from 'src/app/components/main-groups/main-groups.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,

    TuiMarkerIconModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  public viewers: { [component: string]: Type<any> } = {
    localization: LocalizationComponent,
    dialogs: MainGroupsComponent,
    import: LoadFileWizardComponent,
    export: ExportTranslationGuestComponent
  };

  constructor(private viewersService: ViewersService) { }

  public loadComponent(component: Type<any>) {
    this.viewersService.loadComponent(component, {});
  }

}
