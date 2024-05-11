import { Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiIslandModule, TuiStepperModule } from '@taiga-ui/kit';
import { ModeSelectorComponent } from './mode-selector/mode-selector.component';
import { WizardService } from './wizard.service';
import { AsyncPipe } from '@angular/common';
import { ImportMainComponent } from 'src/app/import/import-main/import-main.component';
import { LoadFileWizardComponent } from '../load-file-wizard/load-file-wizard.component';
import { AppStateService } from 'src/app/core/services/app-state.service';

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
    private app: AppStateService,
    @Inject(WizardService) private wizardService: WizardService
  ) { }

  public wizardEnd() {
    this.app.initializeApp();
  }
}