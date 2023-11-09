import { Injectable } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { LanguageOriginService } from './language-origin.service';
import { TuiAlertService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticating$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public user: SocialUser | undefined;
  public rol!: 'guest' | 'admin';
  private userDB!: IUser;

  constructor(
    private socialAuthService: SocialAuthService,
    private local: LocalStorageService,
    private api: ApiService,
    private route: Router,
    private languageOrigin: LanguageOriginService,
    private alert: TuiAlertService,
    private translate: TranslateService
  ) {
    this.socialAuthService
      .authState
      .subscribe(async (user) => {
        this.authenticating$.next(true);

        let authValidation: IAuthValidation = {
          provider: user.provider,
          idToken: user.idToken
        }

        await firstValueFrom(this.api.post<IUser>('auth', authValidation))
          .then(
            async res => {
              this.local.setToken(res.Token);
              this.userDB = res;
              await this.languageOrigin.onRetriveLanguages();
              if (this.userDB.Rol == 'guest') {
                this.rol = this.userDB.Rol;
                this.route.navigateByUrl('');
              }
              else if (this.userDB.Rol == 'admin') {
                var element = document.querySelector(':root') as any;
                element.style.setProperty('--header-height', '3.9375rem');
                element.style.setProperty('--menu-width', '3rem');

                this.rol = this.userDB.Rol;
                this.route.navigateByUrl('home');
              }
              this.authenticated$.next(true);
              this.user = user;
            },
            error => {
              let alert = this.alert.open(this.translate.instant('can-not-login'), {
                label: 'Error',
                status: 'error',
                autoClose: true
              });

              firstValueFrom(alert);
            }
          );
        this.authenticating$.next(false);
      });
  }
}

interface IUser {
  Email: string;
  TranslationCount: number;
  Rol: string;
  Token: string;
}

interface IAuthValidation {
  provider: string;
  idToken: string;
}