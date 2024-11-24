import { TuiStepper } from "@taiga-ui/kit";
import { Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModeSelectorComponent } from './mode-selector/mode-selector.component';
import { WizardService } from './wizard.service';
import { AsyncPipe } from '@angular/common';
import { ImportMainComponent } from 'src/app/import/import-main/import-main.component';
import { AppStateService } from 'src/app/core/services/app-state.service';

@Component({
  selector: 'app-wizard-initial',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,

    TuiStepper,

    ModeSelectorComponent,
    ImportMainComponent,
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
    private readonly app: AppStateService,
    @Inject(WizardService) private readonly wizardService: WizardService
  ) { }

  public wizardEnd() {
    this.app.initializeApp();
  }
}