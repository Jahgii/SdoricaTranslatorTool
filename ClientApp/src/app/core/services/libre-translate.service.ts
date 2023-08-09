import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ILibreTranslateError, ILibreTranslateLanguages, ILibreTranslateResponse } from '../interfaces/i-libre-translate';
import { LocalStorageService } from './local-storage.service';

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
  public languages!: ILibreTranslateLanguages[];
  public targetLanguages: string[] | undefined;
  public url: string | undefined;
  public apiKey: string | undefined;
  public source: string | undefined;
  public target: string | undefined;

  constructor(private http: HttpClient, private local: LocalStorageService) {
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
      .then(
        r => {
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
        },
        (error: HttpErrorResponse) => {
          this.errors$.next('servererror');
          this.serverReady$.next(false);
          this.serverAlive$.next(false);
        }
      );
    this.testing$.next(false);
  }

  public async onTestTranslate() {
    this.testing$.next(true);
    this.errorServer$.next('');
    let body = this.getTranslationBody(`I'm alive`);
    await firstValueFrom(this.http.post<ILibreTranslateResponse>(`${this.url}translate`, body))
      .then(
        r => {
          if (r.translatedText) this.serverReady$.next(true);
        },
        (r: HttpErrorResponse) => {
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

}
