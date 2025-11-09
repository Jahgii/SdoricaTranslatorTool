import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiConfigurationService {
  private readonly lStorage = inject(LocalStorageService);
  private readonly alert = inject(AlertService);

  public change$ = signal(false);
  public key: string | undefined;
  public model: string = 'gemini-2.5-flash';
  public lang: string = this.lStorage.getGeminiTranslateLang() ?? "english";

  constructor() {
    this.onInit();
  }

  private onInit() {
    this.lang = this.lStorage.getGeminiTranslateLang() ?? "english";

    this.key = this.lStorage.getGeminiApiKey();
    if (!this.key) return;

    this.model = this.lStorage.getGeminiModel() ?? 'gemini-2.5-flash';
  }

  public onChange() {
    if (!this.key || !this.model) return;
    this.lStorage.setGeminiApiKey(this.key);
    this.lStorage.setGeminiTranslateLang(this.lang);
    this.lStorage.setGeminiModel(this.model);
    this.alert.showAlert('alert-gemini-activated', 'alert-gemini-activated-description', 'info', 'triangle-alert');
    this.change$.update(c => !c);
  }
}
