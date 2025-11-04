import { inject, Injectable, signal } from '@angular/core';
import { ApiError, GoogleGenAI } from "@google/genai";
import { LocalStorageService } from './local-storage.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private readonly lStorage = inject(LocalStorageService);
  private readonly alert = inject(AlertService);

  public readonly ready$ = signal(false);
  public readonly waiting$ = signal(false);
  public key: string | undefined;
  public model: string = 'gemini-2.5-flash';
  public lang: string = this.lStorage.getGeminiTranslateLang() ?? "english";
  public prompt: string = `
    translate the next values of this json to {0},
    and return only the json, because the response
    will be use in other system that only work with json content, please.
  `;
  private ai?: GoogleGenAI;

  constructor() {
    this.onInit();
  }

  private onInit() {
    this.lang = this.lStorage.getGeminiTranslateLang() ?? "english";

    this.key = this.lStorage.getGeminiApiKey();
    if (!this.key) return;

    this.model = this.lStorage.getGeminiModel() ?? 'gemini-2.5-flash';
    this.ai = new GoogleGenAI({ apiKey: this.key });
    this.ready$.set(true);
  }

  public onChange() {
    if (!this.key || !this.model) return;
    this.lStorage.setGeminiApiKey(this.key);
    this.lStorage.setGeminiTranslateLang(this.lang);
    this.lStorage.setGeminiModel(this.model);
    this.alert.showAlert('alert-gemini-activated', 'alert-gemini-activated-description', 'info', 'triangle-alert');
    this.onInit();
  }

  public async get(content: string) {
    this.waiting$.set(true);
    const response = await this.ai?.models.generateContent({
      model: this.model ?? 'gemini-2.5-flash',
      contents: `
      ${this.prompt.replace('{0}', this.lang)}

      ${content}
      `
    }).then(
      r => r,
      (error: ApiError) => {
        let message = error.message ?? 'alert-error-label';
        this.alert.showAlert('alert-error', message, 'accent', 'triangle-alert');
        return undefined;
      }
    );

    let cleanResponse = "{}";
    if (response) cleanResponse = response.text!.replace(/```json|```/g, '').trim();

    this.waiting$.set(false);
    return cleanResponse;
  }

}
