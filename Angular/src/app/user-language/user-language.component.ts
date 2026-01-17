import { Component, inject } from '@angular/core';
import { TuiButton, TuiIcon, TuiTextfield, TuiScrollbar, TuiScrollable, TuiHint, TuiDropdown, TuiDataList, TuiLoader } from '@taiga-ui/core';
import { LangService } from '../core/services/lang.service';
import { FormsModule } from '@angular/forms';
import { TuiButtonLoading, TuiFilterByInputPipe, TuiStatus } from '@taiga-ui/kit';
import { NgTemplateOutlet } from '@angular/common';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { GeminiApiService } from '../core/services/gemini-api.service';
import { AlertService } from '../core/services/alert.service';
import { GeminiIconDirective } from '../core/directives/gemini-icon.directive';
import { TuiFilterPipe } from '@taiga-ui/cdk';

@Component({
  selector: 'app-user-language',
  providers: [GeminiApiService],
  imports: [
    NgTemplateOutlet,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    FormsModule,
    TranslateModule,
    TuiLoader,
    TuiButton,
    TuiButtonLoading,
    TuiHint,
    TuiDropdown,
    TuiDataList,
    TuiIcon,
    TuiTextfield,
    TuiScrollable,
    TuiScrollbar,
    TuiFilterPipe,
    GeminiIconDirective,
    TuiStatus
],
  templateUrl: './user-language.component.html',
  styleUrl: './user-language.component.scss'
})
export class UserLanguageComponent {
  protected readonly lS = inject(LangService);
  public readonly gemini = inject(GeminiApiService);
  private readonly alert = inject(AlertService);
  
  protected search: string = '';

  public async onGeminiTranslate() {
    const customLang = this.lS.languages().find(e => e.Custom === 1);
    const basedOnLang = this.lS.languages().find(e => e.Language === 'english');
    if (!customLang || !basedOnLang) return;

    const response = await this.gemini.get(JSON.stringify(basedOnLang.Content));
    const geminiLang: { [key: string]: string } = this.tryParseJson(response);

    if (!geminiLang) {
      this.alert.showAlert(
        'alert-error',
        'invalid-gemini-response',
        'accent',
        'triangle-alert'
      );

      return;
    }

    for (const k in geminiLang)
      if (customLang.Content[k]) customLang.Content[k] = geminiLang[k];

    this.lS.saveChanges();
  }

  private tryParseJson(text: string) {
    try {
      return JSON.parse(text)
    }
    catch {
      return undefined;
    }
  }

  public trackByKey(index: number, key: string): string {
    return key;
  }

  public searchByText = (key: string, search: string): boolean =>
    this.lS.languages().some(e => (e.Content[key] as string)?.toLowerCase().includes(search.toLowerCase()));

}
