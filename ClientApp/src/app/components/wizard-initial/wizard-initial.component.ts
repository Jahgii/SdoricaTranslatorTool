import { Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiIslandModule, TuiStepperModule } from '@taiga-ui/kit';
import { ModeSelectorComponent } from './mode-selector/mode-selector.component';
import { WizardService } from './wizard.service';
import { AsyncPipe } from '@angular/common';
import { ImportMainComponent } from 'src/app/import/import-main/import-main.component';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { LoadFileWizardComponent } from '../load-file-wizard/load-file-wizard.component';

@Component({
  selector: 'app-wizard-initial',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,

    TuiIslandModule,
    TuiStepperModule,

    ModeSelectorComponent,
    ImportMainComponent,
    LoadFileWizardComponent
  ],
  providers: [
    WizardService
  ],
  templateUrl: './wizard-initial.component.html',
  styleUrl: './wizard-initial.component.scss'
})
export class WizardInitialComponent {
  public index$ = this.wizardService.stepIndex$;

  constructor(
    @Inject(WizardService) private wizardService: WizardService
    , private indexDB: IndexDBService
  ) { }
}