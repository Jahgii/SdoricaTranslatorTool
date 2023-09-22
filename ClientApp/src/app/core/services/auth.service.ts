import { Injectable } from '@angular/core';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

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
    private authService: SocialAuthService,
    private api: ApiService,
    private route: Router
  ) {
    this.authService
      .authState
      .subscribe(async (user) => {
        this.user = user;
        this.authenticating$.next(true);

        let authValidation: IAuthValidation = {
          provider: user.provider,
          idToken: user.idToken
        }

        firstValueFrom(this.api.post<IUser>('auth', authValidation))
          .then(
            res => {
              this.userDB = res;
              if (this.userDB.Rol == 'guest' || this.userDB.Rol == 'admin')
                this.rol = this.userDB.Rol;
              this.authenticated$.next(true);
            },
            error => {

            }
          );
      });
  }


}

interface IUser {
  Email: string;
  TranslationCount: number;
  Rol: string;
}

interface IAuthValidation {
  provider: string;
  idToken: string;
}