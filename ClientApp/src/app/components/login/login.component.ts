import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { NgIf, AsyncPipe } from '@angular/common';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiAppBarModule } from '@taiga-ui/addon-mobile';
import { TuiBlockStatusModule } from '@taiga-ui/layout';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,

    TuiBlockStatusModule,
    TuiAppBarModule,
    TuiLoaderModule,

    GoogleSigninButtonModule
  ]
})
export class LoginComponent {
  constructor(
    public authService: AuthService,
    public theme: ThemeService
  ) { }
}
