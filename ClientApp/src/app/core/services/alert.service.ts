import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TuiLooseUnion } from '@taiga-ui/cdk';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly translate = inject(TranslateService);
  private readonly alerts = inject(TuiAlertService);

  public showAlert(
    title: string,
    message: string,
    appearance: Appearance
  ) {
    this.alerts
      .open(this.translate.instant(message), { label: this.translate.instant(title), appearance: appearance })
      .subscribe();
  }
}

type Appearance = TuiLooseUnion<
  'accent' |
  'action-destructive' |
  'action-grayscale' |
  'action' |
  'flat-destructive' |
  'flat-grayscale' |
  'flat' |
  'floating' |
  'glass' |
  'icon' |
  'info' |
  'negative' |
  'neutral' |
  'outline-destructive' |
  'outline-grayscale' |
  'outline' |
  'positive' |
  'primary-destructive' |
  'primary-grayscale' |
  'primary' |
  'secondary-destructive' |
  'secondary-grayscale' |
  'secondary' |
  'textfield' |
  'warning'
>;