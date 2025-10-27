import { TuiAlertService, TuiButton, TuiIcon, TuiLoader, TuiTextfield } from "@taiga-ui/core";
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TuiBlock, TuiPassword, TuiRadio } from '@taiga-ui/kit';
import { WizardService } from '../wizard.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { AppModes } from 'src/app/core/enums/app-modes';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageSwitcherComponent } from "../../language-switcher/language-switcher.component";
import { ViewersService } from "src/app/core/services/viewers.service";
import { AppViews, viewers } from "src/app/core/viewers";
import { TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { PasswordHideTextDirective } from "src/app/core/directives/password-hide-text.directive";

@Component({
  selector: 'app-mode-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TuiBlock,
    TuiRadio,
    TuiIcon,
    TuiTextfield,
    TuiPassword,
    TuiLoader,
    TuiButton,
    LanguageSwitcherComponent,
    TuiTextfieldControllerModule,

    PasswordHideTextDirective,
  ],
  templateUrl: './mode-selector.component.html',
  styleUrl: './mode-selector.component.scss'
})
export class ModeSelectorComponent implements OnInit, OnDestroy {
  private readonly vS = inject(ViewersService);
  private readonly wizardService = inject(WizardService);
  private readonly lStorage = inject(LocalStorageService);
  private readonly api = inject(ApiService);

  private modeSubs: Subscription | undefined;
  private apiUrlSubs: Subscription | undefined;
  private apiKeySubs: Subscription | undefined;
  private readonly urlRegex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  private readonly alerts = inject(TuiAlertService);
  private readonly translate = inject(TranslateService);
  public modes = AppModes;
  public modeForm = this.wizardService.modeForm;
  public modeControl = this.modeForm.get('mode');
  public testApi: WritableSignal<boolean> = signal(false);
  public apiAlive: WritableSignal<boolean> = signal(false);

  ngOnDestroy(): void {
    if (this.modeSubs) this.modeSubs.unsubscribe();
    if (this.apiUrlSubs) this.apiUrlSubs.unsubscribe();
    if (this.apiKeySubs) this.apiKeySubs.unsubscribe();
  }

  ngOnInit(): void {
    let appMode = this.lStorage.getAppMode();
    let appApiUrl = this.lStorage.getAppApiUrl() ?? "";
    let appApiKey = this.lStorage.getAppApiKey() ?? "";

    this.api.setBaseUrl(appApiUrl ?? "");
    this.onModeChange();
    this.onApiUrlChange();
    this.onApiKeyChange();

    this.modeForm.patchValue({
      mode: appMode,
      apiUrl: appApiUrl,
      apiKey: appApiKey
    });
  }

  private onModeChange() {
    this.modeSubs = this.modeForm
      .get('mode')
      ?.valueChanges
      .subscribe(mode => {
        if (mode === AppModes.Online) {
          this.lStorage.setAppMode(mode);
          this.modeForm.get('apiUrl')?.addValidators([Validators.required, Validators.pattern(this.urlRegex)]);
          this.modeForm.get('apiKey')?.addValidators([Validators.required]);
          this.modeForm.updateValueAndValidity();
          this.apiAlive.set(false);
        }
        else if (mode === AppModes.Offline) {
          this.lStorage.setAppMode(mode);
          this.modeForm.get('apiUrl')?.removeValidators([Validators.required, Validators.pattern(this.urlRegex)]);
          this.modeForm.get('apiKey')?.removeValidators([Validators.required]);
          this.modeForm.get('apiUrl')?.updateValueAndValidity();
          this.modeForm.get('apiKey')?.updateValueAndValidity();
          this.apiAlive.set(true);
        }
      });
  }

  private onApiUrlChange() {
    this.apiUrlSubs = this.modeForm
      .get('apiUrl')
      ?.valueChanges
      .subscribe(url => {
        this.lStorage.setAppApiUrl(url);
        this.api.setBaseUrl(url);
      });
  }

  private onApiKeyChange() {
    this.apiKeySubs = this.modeForm
      .get('apiKey')
      ?.valueChanges
      .subscribe(url => {
        this.lStorage.setAppApiKey(url);
      });
  }

  public async onTestServer() {
    this.testApi.set(true);
    let status = await firstValueFrom(this.api.get<{ version: string, status: string }>("status"))
      .then(
        status => status, error => {
          this.alerts.open(
            this.translate.instant('api-connection-error'),
            { appearance: 'accent', icon: 'triangle-alert' }
          ).subscribe({
            complete: () => { },
          });
        }
      );
    this.testApi.set(false);

    if (status && status.status === "Alive") {
      this.vS.loadComponent(AppViews.login, await viewers.login, {});
    } else this.apiAlive.set(false);
  }

  public onNext() {
    let currentIndex = this.wizardService.stepIndex$.value;
    this.wizardService.stepIndex$.next(currentIndex + 1);
  }
}