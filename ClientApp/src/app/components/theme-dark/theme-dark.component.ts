import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AbstractTuiThemeSwitcher } from '@taiga-ui/cdk';

@Component({
  selector: 'app-theme-dark',
  template: '',
  styleUrls: ['./theme-dark.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeDarkComponent extends AbstractTuiThemeSwitcher {

}
