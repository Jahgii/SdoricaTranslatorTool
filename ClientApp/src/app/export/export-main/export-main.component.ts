import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiAvatar, TuiFiles, TuiButtonLoading, TuiTabs } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockStatus, TuiCardMedium } from '@taiga-ui/layout';
import { TuiExpand, TuiLoader, TuiIcon, TuiLink, TuiButton, TuiHint, TuiAppearance, TuiTitle, TuiScrollbar } from '@taiga-ui/core';
import { NgTemplateOutlet, AsyncPipe, DecimalPipe } from '@angular/common';
import { ExportTranslationService } from '../export-translation.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TuiTable } from '@taiga-ui/addon-table';

@Component({
    selector: 'app-export-main',
    templateUrl: './export-main.component.html',
    styleUrls: ['./export-main.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgTemplateOutlet,
    AsyncPipe,
    DecimalPipe,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TuiExpand,
    TuiTabs,
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
    TuiScrollbar,
    TuiTable
],
    providers: [
        ExportTranslationService
    ]
})
export class ExportTranslationGuestComponent {
  protected readonly eTS = inject(ExportTranslationService);
  protected readonly languageOrigin = inject(LanguageOriginService);

  protected activeItemIndex = 0;

}
