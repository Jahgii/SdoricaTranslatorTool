import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiInputModule, TuiRadioBlockModule, TuiStepperModule } from '@taiga-ui/kit';
import { WizardService } from '../wizard.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiStepperModule,
    TuiRadioBlockModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiButtonModule
  ],
  templateUrl: './mode-selector.component.html',
  styleUrl: './mode-selector.component.scss'
})
export class ModeSelectorComponent implements OnInit, OnDestroy {
  private modeSubs: Subscription | undefined;
  private urlRegex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  public modes = AppModes;
  public modeForm = this.wizardService.modeForm;
  public modeControl = this.modeForm.get('mode');

  constructor(
    private wizardService: WizardService
    , private lStorage: LocalStorageService
  ) { }

  ngOnDestroy(): void {
    if (this.modeSubs) this.modeSubs.unsubscribe();
  }

  ngOnInit(): void {
    let appMode = this.lStorage.getAppMode();

    this.modeForm.patchValue({
      mode: appMode
    });

    this.modeSubs = this.modeForm
      .get('mode')
      ?.valueChanges
      .subscribe(mode => {
        this.lStorage.setAppMode(mode);

        if (mode === AppModes.Online) {

          this.modeForm.get('apiUrl')?.addValidators([Validators.required, Validators.pattern(this.urlRegex)]);
          this.modeForm.get('apiKey')?.addValidators([Validators.required]);
          this.modeForm.updateValueAndValidity();

          return;
        }

        this.modeForm.get('apiUrl')?.removeValidators([Validators.required, Validators.pattern(this.urlRegex)]);
        this.modeForm.get('apiKey')?.removeValidators([Validators.required]);
        this.modeForm.get('apiUrl')?.updateValueAndValidity();
        this.modeForm.get('apiKey')?.updateValueAndValidity();
      });
  }

  public onNext() {
    let currentIndex = this.wizardService.stepIndex$.value;
    this.wizardService.stepIndex$.next(currentIndex + 1);
  }
}

export enum AppModes {
  Pending = "Pending",
  Offline = "Offline",
  Online = "Online"
}
