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

  getTheme() {
    let theme = (localStorage.getItem('theme') ?? 'dark') as 'light' | 'dark';
    if (theme != 'light' && theme != 'dark') theme = 'dark';
    return theme;
  }

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem('theme', theme);
  }

  getDefaultLang() {
    return localStorage.getItem('defaultLang') ?? 'undefined';
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

  getC1() {
    return localStorage.getItem('C1') ?? undefined;
  }

  setC1(componentViewerKey: string) {
    localStorage.setItem('C1', componentViewerKey);
  }
}
