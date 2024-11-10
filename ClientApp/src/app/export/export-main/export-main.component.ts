import { TuiIslandDirective } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiAvatar, TuiFiles, TuiButtonLoading } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockStatus } from '@taiga-ui/layout';
import { TuiExpand, TuiLoader, TuiIcon, TuiLink, TuiButton, TuiHint } from '@taiga-ui/core';
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
    TuiIslandDirective,
    TuiFiles,
    TuiAvatar,
    TuiLoader,
    TuiIcon,
    TuiLink,
      TuiButtonLoading
],
  providers: [
    ExportTranslationService
  ]
})
export class ExportTranslationGuestComponent {

  constructor(
    public eTS: ExportTranslationService,
    public languageOrigin: LanguageOriginService
  ) { }

}
