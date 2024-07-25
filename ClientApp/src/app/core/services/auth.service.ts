import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
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

  public rol!: 'guest' | 'admin';
  private userDB!: IUser;

  constructor(
    private local: LocalStorageService,
    private api: ApiService,
    private languageOrigin: LanguageOriginService,
    private alert: TuiAlertService,
    private translate: TranslateService
  ) {

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