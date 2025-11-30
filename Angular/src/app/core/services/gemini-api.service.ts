import { effect, inject, Injectable, signal } from '@angular/core';
import { ApiError, GoogleGenAI } from "@google/genai";
import { AlertService } from './alert.service';
import { GeminiApiConfigurationService } from './gemini-api-configuration.service';

@Injectable()
export class GeminiApiService {
  private readonly config = inject(GeminiApiConfigurationService);
  private readonly alert = inject(AlertService);

  public readonly ready$ = signal(false);
  public readonly waiting$ = signal(false);
  public prompt: string = `
    translate the next values of this json to {0},
    and return only the json, because the response
    will be use in other system that only work with json content, please.
  `;
  private ai?: GoogleGenAI;

  constructor() {
    this.onInit();

    effect(() => {
      this.config.change$();
      this.onInit();
    });
  }

  private onInit() {
    if (!this.config.key) return;

    this.ai = new GoogleGenAI({ apiKey: this.config.key });
    this.ready$.set(true);
  }

  public onChange() {
    if (!this.config.key || !this.config.model) return;
    this.onInit();
  }

  public async get(content: string) {
    this.waiting$.set(true);
    const response = await this.ai?.models.generateContent({
      model: this.config.model ?? 'gemini-2.5-flash',
      contents: `
      ${this.prompt.replace('{0}', this.config.lang)}

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
