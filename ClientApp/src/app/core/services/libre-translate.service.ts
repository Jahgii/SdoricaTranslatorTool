import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ILibreTranslateError, ILibreTranslateLanguages, ILibreTranslateResponse } from '../interfaces/i-libre-translate';
import { LocalStorageService } from './local-storage.service';
import { IDialog } from '../interfaces/i-dialog-asset';
import { ILocalizationKey } from '../interfaces/i-localizations';

@Injectable({
  providedIn: 'root'
})
export class LibreTranslateService {
  public errors$: BehaviorSubject<'emptyresponse' | 'emptyarray' | 'invalid' | 'servererror' | undefined> =
    new BehaviorSubject<'emptyresponse' | 'emptyarray' | 'invalid' | 'servererror' | undefined>(undefined);
  public errorServer$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public testing$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public serverAlive$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public serverReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public translating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public languages!: ILibreTranslateLanguages[];
  public targetLanguages: string[] | undefined;
  public url: string | undefined;
  public apiKey: string | undefined;
  public source: string | undefined;
  public target: string | undefined;

  constructor(
    private readonly http: HttpClient,
    private readonly local: LocalStorageService
  ) {
    this.onInit();
  }

  private async onInit() {
    this.url = this.local.getLibreTranslateUrl();
    this.source = this.local.getLibreTranslateSource();
    this.target = this.local.getLibreTranslateTarget();

    if (this.url) await this.isAlive();
    if (this.source && this.languages) this.onSourceChange(this.source);
    if (this.target && this.targetLanguages) this.onTestTranslate();
  }

  private getTranslationBody(text: string) {
    return {
      q: text ?? "",
      source: this.source,
      target: this.target,
      format: "text",
      api_key: this.apiKey ?? ""
    };
  }

  public async isAlive() {
    this.testing$.next(true);
    await firstValueFrom(this.http.get<ILibreTranslateLanguages[]>(`${this.url}languages`, undefined))
      .then(r => {
        this.serverAlive$.next(false);

        if (!r) this.errors$.next('emptyresponse');
        else if (r.length === 0) this.errors$.next('emptyarray');
        else if (r[0].code && r[0].name && r[0].targets) {
          this.errors$.next(undefined);
          this.serverAlive$.next(true);
          this.languages = r;
          if (this.source) this.onSourceChange(this.source);
        }
        else this.errors$.next('invalid');
      }, (_: HttpErrorResponse) => {
        this.errors$.next('servererror');
        this.serverReady$.next(false);
        this.serverAlive$.next(false);
      }
      );
    this.testing$.next(false);
  }

  public async onTestTranslate(event?: MouseEvent) {
    if (event && !event.isTrusted) return;

    this.testing$.next(true);
    this.errorServer$.next('');
    let body = this.getTranslationBody(`I'm alive`);
    await firstValueFrom(this.http.post<ILibreTranslateResponse>(`${this.url}translate`, body))
      .then(r => {
        if (r.translatedText) this.serverReady$.next(true);
      }, (r: HttpErrorResponse) => {
        if (r.error && r.error.error) this.errorServer$.next(r.error.error);
        else this.errorServer$.next("Unknow Error");
        this.serverReady$.next(false);
      }
      );
    this.testing$.next(false);
  }

  public onUrlChange(url: string) {
    this.local.setLibreTranslateUrl(url);
    this.serverAlive$.next(false);
    this.serverReady$.next(false);
  }

  public onSourceChange(code: string) {
    this.local.setLibreTranslateSource(code);
    this.targetLanguages = this.languages.find(e => e.code === code)?.targets;
  }

  public onTargetChange(code: string) {
    this.local.setLibreTranslateTarget(code);
  }

  public async onTranslateDialogs(dialogs: IDialog[]) {
    this.translating$.next(true);
    for (const element of dialogs) {
      let translatedText = await this.onTranslate(element.OriginalText);
      if (translatedText) element.Text = translatedText;
    }
    this.translating$.next(false);
  }

  public async onTranslateKeys(keys: ILocalizationKey[], currentLang: string) {
    this.translating$.next(true);
    for (const element of keys) {
      let translatedText = await this.onTranslate(element.Original[currentLang]);
      if (translatedText) element.Translations[currentLang] = translatedText;
    }
    this.translating$.next(false);
  }

  public async onTranslate(text: string) {
    let body = this.getTranslationBody(text);
    return await firstValueFrom(this.http.post<ILibreTranslateResponse>(`${this.url}translate`, body))
      .then(r => {
        if (r.translatedText) return r.translatedText;
        return undefined;
      }, (_: HttpErrorResponse) => {
        return undefined;
      }
      );
  }

}
