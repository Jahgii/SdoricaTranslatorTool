import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getLibreTranslateUrl() {
    return localStorage.getItem('lTUrl') ?? undefined;
  }

  setLibreTranslateUrl(url: string) {
    localStorage.setItem('lTUrl', url);
  }

  getLibreTranslateSource() {
    return localStorage.getItem('lTSource') ?? undefined;
  }
  
  setLibreTranslateSource(url: string) {
    localStorage.setItem('lTSource', url);
  }

  getLibreTranslateTarget() {
    return localStorage.getItem('lTTarget') ?? undefined;
  }

  setLibreTranslateTarget(url: string) {
    localStorage.setItem('lTTarget', url);
  }

  getDefaultLang() {
    return localStorage.getItem('defaultLang') ?? undefined;
  }

  setDefaultLang(lang: string) {
    localStorage.setItem('defaultLang', lang);
  }

  getAppLang() {
    return localStorage.getItem('appLang') ?? undefined;
  }

  setAppLang(lang: string) {
    localStorage.setItem('appLang', lang);
  }

  getToken() {
    return localStorage.getItem('token') ?? undefined;
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }
}
