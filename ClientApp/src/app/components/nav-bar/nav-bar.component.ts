import { TuiAvatar } from "@taiga-ui/kit";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { AsyncPipe } from '@angular/common';
import { TuiDataList, TuiLoader, TuiDropdown, TuiButton, TuiHint } from '@taiga-ui/core';
import { TuiAppBar, TuiBlockStatus } from '@taiga-ui/layout';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        TranslateModule,
        TuiAppBar,
        TuiBlockStatus,
        TuiLoader,
        TuiAvatar,
        TuiDropdown,
        TuiButton,
        TuiDataList,
        TuiHint
    ]
})
export class NavBarComponent {
  constructor(
    readonly translate: TranslateService,
    public theme: ThemeService,
    public auth: AuthService
  ) { }

}
