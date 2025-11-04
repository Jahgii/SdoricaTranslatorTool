import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticating$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public rol!: 'guest' | 'admin';
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