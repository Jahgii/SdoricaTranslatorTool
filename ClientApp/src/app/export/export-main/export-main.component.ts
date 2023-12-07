import { ChangeDetectionStrategy, Component } from '@angular/core';
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

    TuiExpandModule,
    TuiButtonModule,
    TuiHintModule,
    TuiBlockStatusModule,
    TuiAppBarModule,
    TuiIslandModule,
    TuiInputFilesModule,
    TuiModeModule,
    TuiMarkerIconModule,
    TuiLoaderModule,
    TuiSvgModule,
    TuiLinkModule
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
