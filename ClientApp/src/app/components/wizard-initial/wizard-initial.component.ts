import { TuiStepper } from "@taiga-ui/kit";
import { TuiIslandDirective } from "@taiga-ui/legacy";
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

    TuiIslandDirective,
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
    private app: AppStateService,
    @Inject(WizardService) private wizardService: WizardService
  ) { }

  public wizardEnd() {
    this.app.initializeApp();
  }
}