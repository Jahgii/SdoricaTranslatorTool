import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    imports: [TuiBlockStatusModule, TuiAppBarModule, TuiLoaderModule, NgIf, GoogleSigninButtonModule, AsyncPipe, TranslateModule]
})
export class LoginComponent {
  constructor(
    private router: Router,
    public authService: AuthService,
    public theme: ThemeService
  ) {
    if (this.authService.authenticated$.value == true)
      this.router.navigateByUrl('/');
  }
}
