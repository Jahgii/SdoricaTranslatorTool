import { TuiPopover } from "@taiga-ui/cdk";
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TuiAlertOptions, TuiButton } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { BehaviorSubject } from 'rxjs';
import { PortraitsService } from 'src/app/core/services/portraits.service';

@Component({
    selector: 'app-alert-portraits',
    imports: [
        AsyncPipe,
        CommonModule,
        TranslateModule,
        TuiButton
    ],
    templateUrl: './alert-portraits.component.html',
    styleUrl: './alert-portraits.component.scss'
})
export class AlertPortraitsComponent {
  public mode$ = new BehaviorSubject<AlertPortraitMode>(AlertPortraitMode.Default);

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiPopover<TuiAlertOptions<AlertPortraitMode>, boolean>,
    public portraitsService: PortraitsService
  ) {
    this.mode$.next(this.context.data);
  }

  public async onFolderChange() {
    if (await this.portraitsService.onFolderChange()) {
      this.context.completeWith(true);
    }
  }

  public async onRequestPermissions() {
    if (await this.portraitsService.onRequestPermissions()) {
      this.context.completeWith(true);
    }
  }

}

export enum AlertPortraitMode {
  Default = "Default",
  MissFolder = "MissFolder",
  MissPermission = "MissPermissions"
}
