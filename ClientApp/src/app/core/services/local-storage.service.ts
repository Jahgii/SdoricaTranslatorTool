import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setDefaultLang(lang: string) {
    localStorage.setItem('defaultLang', lang);
  }

  getDefaultLang() {
    return localStorage.getItem('defaultLang');
  }
}
