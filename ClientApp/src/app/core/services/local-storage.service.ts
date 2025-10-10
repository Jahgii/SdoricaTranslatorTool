import { Injectable } from '@angular/core';
import { AppModes } from '../enums/app-modes';
import { PersistentModes } from '../enums/persistent-modes';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getAppApiUrl() {
    return localStorage.getItem('apiUrl');
  }

  setAppApiUrl(url: string) {
    localStorage.setItem('apiUrl', url);
  }

  getAppApiKey() {
    return localStorage.getItem('apiKey');
  }

  setAppApiKey(key: string) {
    localStorage.setItem('apiKey', key);
  }

  getAppMode(): AppModes | undefined {
    return localStorage.getItem('appMode') as AppModes ?? undefined;
  }

  setAppMode(mode: AppModes) {
    localStorage.setItem('appMode', mode);
  }

  getAppWizardDone(): number | undefined {
    return Number(localStorage.getItem('wizardDone')) ?? undefined;
  }

  setAppWizardDone() {
    localStorage.setItem('wizardDone', "1");
  }

  getAppMainTourDone(): number | undefined {
    return Number(localStorage.getItem('mainTourDone')) ?? undefined;
  }

  setAppMainTourDone() {
    localStorage.setItem('mainTourDone', "1");
  }

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

  getC2() {
    return localStorage.getItem('C2') ?? undefined;
  }

  setC2(componentViewerKey: string) {
    localStorage.setItem('C2', componentViewerKey);
  }

  getCategory(view: number) {
    return localStorage.getItem('Category' + view) ?? undefined;
  }

  setCategory(view: number, categoryId: string) {
    localStorage.setItem('Category' + view, categoryId);
  }

  getCategorySearch(search: string) {

  }

  setCategorySearch(search: string) {

  }

  getGroup(view: number) {
    return localStorage.getItem('Group' + view) ?? undefined;
  }

  setGroup(view: number, groupId: string) {
    localStorage.setItem('Group' + view, groupId);
  }

  getPortraitPersistentMode(): PersistentModes | undefined {
    return (localStorage.getItem('PortraitPersistentMode') as PersistentModes) ?? undefined;
  }

  setPortraitPersistentMode(mode: PersistentModes) {
    localStorage.setItem('PortraitPersistentMode', mode);
  }

  getPortraitFallbackPath(): string | undefined {
    return localStorage.getItem('PortraitPath') ?? undefined;
  }

  setPortraitFallbackPath(path: string) {
    localStorage.setItem('PortraitPath', path);
  }
}
