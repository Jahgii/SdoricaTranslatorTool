import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { AsyncPipe } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiDropdownModule } from '@taiga-ui/core/directives/dropdown';
import { TuiHostedDropdownModule, TuiDataListModule } from '@taiga-ui/core';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiAppBarModule } from '@taiga-ui/addon-mobile';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TuiAppBarModule, TuiBlockStatusModule, TuiLoaderModule, TuiAvatarModule, TuiHostedDropdownModule, TuiDropdownModule, TuiButtonModule, TuiDataListModule, AsyncPipe, TranslateModule]
})
export class NavBarComponent {
  constructor(
    readonly translate: TranslateService,
    public theme: ThemeService,
    public auth: AuthService
  ) { }

}
