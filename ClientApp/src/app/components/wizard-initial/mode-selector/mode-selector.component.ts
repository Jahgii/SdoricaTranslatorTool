import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiInputModule, TuiRadioBlockModule, TuiStepperModule } from '@taiga-ui/kit';
import { WizardService } from '../wizard.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { AppModes } from 'src/app/core/enums/app-modes';
import { ApiService } from 'src/app/core/services/api.service';

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
    , private api: ApiService
  ) { }

  ngOnDestroy(): void {
    if (this.modeSubs) this.modeSubs.unsubscribe();
  }

  ngOnInit(): void {
    let appMode = this.lStorage.getAppMode();
    let appApiUrl = this.lStorage.getAppApiUrl();

    this.modeForm.patchValue({
      mode: appMode,
      apiUrl: appApiUrl
    });

    this.api.setBaseUrl(appApiUrl ?? "");

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

    this.modeSubs = this.modeForm
      .get('apiUrl')
      ?.valueChanges
      .subscribe(url => {
        this.lStorage.setAppApiUrl(url);
      });
  }

  public onTestServer() {
    let url = this.modeForm.get('apiUrl')?.value;
    this.api.setBaseUrl(url);

    firstValueFrom(this.api.get("status"))
      .then(
        status => {
          console.log(status);
        }, error => {
          console.log(error);
        }
      );
  }

  public onNext() {
    let currentIndex = this.wizardService.stepIndex$.value;
    this.wizardService.stepIndex$.next(currentIndex + 1);
  }
}