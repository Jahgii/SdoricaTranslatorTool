import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiAvatar, TuiFiles, TuiButtonLoading } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockStatus, TuiCardMedium } from '@taiga-ui/layout';
import { TuiExpand, TuiLoader, TuiIcon, TuiLink, TuiButton, TuiHint, TuiAppearance, TuiTitle } from '@taiga-ui/core';
import { NgIf, NgTemplateOutlet, AsyncPipe, DecimalPipe } from '@angular/common';
import { ExportTranslationService } from '../export-translation.service';

@Component({
  selector: 'app-export-main',
  templateUrl: './export-main.component.html',
  styleUrls: ['./export-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgTemplateOutlet,
    AsyncPipe,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiExpand,
    TuiButton,
    TuiHint,
    TuiBlockStatus,
    TuiAppBar,
    TuiFiles,
    TuiAvatar,
    TuiLoader,
    TuiIcon,
    TuiLink,
    TuiButtonLoading,
    TuiCardMedium,
    TuiAppearance,
    TuiTitle,
  ],
  providers: [
    ExportTranslationService
  ]
})
export class ExportTranslationGuestComponent {
  protected readonly eTS = inject(ExportTranslationService);
  protected readonly languageOrigin = inject(LanguageOriginService);

}
