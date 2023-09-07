import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-export-translation',
  templateUrl: './export-translation.component.html',
  styleUrls: ['./export-translation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FileReaderService, FileReaderLocalizationService]
})
export class ExportTranslationComponent {
  public activeItemIndex = 1;
  public languageSelected = false;

  
}
