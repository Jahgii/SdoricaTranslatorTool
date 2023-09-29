import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
  constructor(
    readonly translate: TranslateService,
    public theme: ThemeService,
    public auth: AuthService
  ) { }

}
