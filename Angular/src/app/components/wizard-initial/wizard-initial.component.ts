import { TuiStepper } from "@taiga-ui/kit";
import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModeSelectorComponent } from './mode-selector/mode-selector.component';
import { WizardService } from './wizard.service';
import { AsyncPipe } from '@angular/common';
import { ImportMainComponent } from 'src/app/import/import-main/import-main.component';
import { AppStateService } from 'src/app/core/services/app-state.service';

@Component({
  selector: 'app-wizard-initial',
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
  styleUrl: './wizard-initial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardInitialComponent {
  protected readonly app = inject(AppStateService);
  protected readonly wizardService = inject(WizardService);

  public index$ = this.wizardService.stepIndex$;

  public wizardEnd() {
    this.app.initializeApp();
  }
}