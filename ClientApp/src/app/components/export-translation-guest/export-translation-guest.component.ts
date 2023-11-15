import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExportTranslationService } from 'src/app/core/services/export-translation.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiSvgModule } from '@taiga-ui/core/components/svg';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiIslandModule, TuiInputFilesModule, TuiMarkerIconModule } from '@taiga-ui/kit';
import { TuiAppBarModule } from '@taiga-ui/addon-mobile';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiExpandModule, TuiModeModule, TuiLinkModule } from '@taiga-ui/core';
import { NgIf, NgTemplateOutlet, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-export-translation-guest',
    templateUrl: './export-translation-guest.component.html',
    styleUrls: ['./export-translation-guest.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgTemplateOutlet, TuiExpandModule, TuiButtonModule, TuiHintModule, TuiBlockStatusModule, TuiAppBarModule, TuiIslandModule, TuiInputFilesModule, TuiModeModule, FormsModule, ReactiveFormsModule, TuiMarkerIconModule, TuiLoaderModule, TuiSvgModule, TuiLinkModule, AsyncPipe, DecimalPipe, TranslateModule]
})
export class ExportTranslationGuestComponent {

  constructor(
    public eTS: ExportTranslationService,
    public languageOrigin: LanguageOriginService
  ) { }

}
